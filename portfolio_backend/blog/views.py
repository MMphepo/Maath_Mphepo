from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum
from django.db import models
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
import os
from PIL import Image

from .models import BlogPost, Tag, Comment, BlogReaction
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer,
    BlogPostCreateSerializer, BlogPostUpdateSerializer,
    CommentSerializer, CommentCreateSerializer, TagSerializer
)
from .content_processors import process_blog_content, generate_table_of_contents, extract_content_metadata


class BlogPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'limit'
    max_page_size = 20


class BlogPostListView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    pagination_class = BlogPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tags__slug']
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['created_at', 'views', 'likes']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).prefetch_related('tags')
    
    def list(self, request, *args, **kwargs):
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get pagination info
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            
            # Get available tags with usage counts
            available_tags = Tag.objects.filter(usage_count__gt=0).order_by('-usage_count', 'name')
            tags_data = TagSerializer(available_tags, many=True).data
            
            # Get current filters
            current_tag = request.GET.get('tags__slug')
            current_sort = request.GET.get('ordering', 'newest')
            search_query = request.GET.get('search', '')
            
            # Format response to match Next.js API
            response_data = {
                'success': True,
                'data': {
                    'posts': serializer.data,
                    'pagination': {
                        'currentPage': paginated_response.data.get('current_page', 1),
                        'totalPages': paginated_response.data.get('total_pages', 1),
                        'totalPosts': paginated_response.data.get('count', 0),
                        'hasNext': paginated_response.data.get('next') is not None,
                        'hasPrev': paginated_response.data.get('previous') is not None,
                    },
                    'filters': {
                        'availableTags': tags_data,
                        'currentTag': current_tag,
                        'currentSort': current_sort,
                        'searchQuery': search_query,
                    }
                }
            }
            return Response(response_data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': {
                'posts': serializer.data,
                'pagination': {
                    'currentPage': 1,
                    'totalPages': 1,
                    'totalPosts': len(serializer.data),
                    'hasNext': False,
                    'hasPrev': False,
                },
                'filters': {
                    'availableTags': [],
                    'currentTag': None,
                    'currentSort': 'newest',
                    'searchQuery': '',
                }
            }
        })


class BlogPostDetailView(generics.RetrieveAPIView):
    serializer_class = BlogPostDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).prefetch_related('tags', 'comments')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


@api_view(['POST'])
@csrf_exempt
@ratelimit(key='ip', rate='5/m', method='POST')
def blog_like_toggle(request, slug):
    """Toggle like for a blog post"""
    try:
        blog_post = get_object_or_404(BlogPost, slug=slug, is_published=True)
        ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')
        
        # Toggle reaction
        liked = BlogReaction.toggle_reaction(blog_post, ip_address, 'like')
        
        return Response({
            'success': True,
            'data': {
                'liked': liked,
                'likes': blog_post.likes
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@csrf_exempt
def blog_comments(request, slug):
    """Get or create comments for a blog post"""
    blog_post = get_object_or_404(BlogPost, slug=slug, is_published=True)
    
    if request.method == 'GET':
        comments = blog_post.get_top_level_comments()
        serializer = CommentSerializer(comments, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        # Rate limiting for comment creation
        from django_ratelimit.core import is_ratelimited
        if is_ratelimited(request, group='comments', key='ip', rate='3/m', method='POST'):
            return Response({
                'success': False,
                'error': 'Rate limit exceeded. Please wait before posting another comment.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(blog_post=blog_post)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Comment posted successfully!'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def blog_tags(request):
    """Get all tags with usage counts"""
    tags = Tag.objects.filter(usage_count__gt=0).order_by('-usage_count', 'name')
    serializer = TagSerializer(tags, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    })


class BlogPostAdminViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for comprehensive blog post management
    """
    queryset = BlogPost.objects.all().prefetch_related('tags').order_by('-created_at')
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_published', 'is_featured', 'tags__slug']
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['created_at', 'updated_at', 'views', 'likes']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return BlogPostCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BlogPostUpdateSerializer
        else:
            from .serializers import BlogPostAdminSerializer
            return BlogPostAdminSerializer

    def get_queryset(self):
        """Return all posts for admin (including unpublished)"""
        return BlogPost.objects.all().prefetch_related('tags').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Create a new blog post"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            blog_post = serializer.save()

            # Return detailed response
            response_serializer = BlogPostAdminSerializer(blog_post)
            return Response({
                'success': True,
                'message': 'Blog post created successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Update a blog post"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            blog_post = serializer.save()

            # Return detailed response
            response_serializer = BlogPostAdminSerializer(blog_post)
            return Response({
                'success': True,
                'message': 'Blog post updated successfully',
                'data': response_serializer.data
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Delete a blog post"""
        instance = self.get_object()
        title = instance.title
        instance.delete()

        return Response({
            'success': True,
            'message': f'Blog post "{title}" deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def toggle_publish(self, request, pk=None):
        """Toggle publish status of a blog post"""
        blog_post = self.get_object()
        blog_post.is_published = not blog_post.is_published

        if blog_post.is_published and not blog_post.published_at:
            blog_post.published_at = timezone.now()
        elif not blog_post.is_published:
            blog_post.published_at = None

        blog_post.save()

        status_text = 'published' if blog_post.is_published else 'unpublished'
        return Response({
            'success': True,
            'message': f'Blog post {status_text} successfully',
            'data': {
                'is_published': blog_post.is_published,
                'published_at': blog_post.published_at.isoformat() if blog_post.published_at else None
            }
        })

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a blog post"""
        blog_post = self.get_object()
        blog_post.is_featured = not blog_post.is_featured
        blog_post.save()

        status_text = 'featured' if blog_post.is_featured else 'unfeatured'
        return Response({
            'success': True,
            'message': f'Blog post {status_text} successfully',
            'data': {
                'is_featured': blog_post.is_featured
            }
        })

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get blog post preview with processed content"""
        blog_post = self.get_object()

        # Process content for preview
        processed_content = process_blog_content(blog_post.content, output_format='html')
        toc = generate_table_of_contents(blog_post.content)
        metadata = extract_content_metadata(blog_post.content)

        return Response({
            'success': True,
            'data': {
                'id': blog_post.id,
                'title': blog_post.title,
                'slug': blog_post.slug,
                'description': blog_post.description,
                'content': blog_post.content,
                'processed_content': processed_content,
                'table_of_contents': toc,
                'content_metadata': metadata,
                'banner_image': blog_post.banner_image.url if blog_post.banner_image else None,
                'tags': [tag.name for tag in blog_post.tags.all()],
                'is_published': blog_post.is_published,
                'is_featured': blog_post.is_featured,
                'created_at': blog_post.created_at.isoformat(),
                'updated_at': blog_post.updated_at.isoformat(),
                'author': {
                    'name': blog_post.author_name,
                    'bio': blog_post.author_bio,
                    'avatar': blog_post.author_avatar
                }
            }
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Upload image for blog content
    """
    if 'image' not in request.FILES:
        return Response({
            'success': False,
            'error': 'No image file provided'
        }, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']

    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if image_file.content_type not in allowed_types:
        return Response({
            'success': False,
            'error': 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    if image_file.size > max_size:
        return Response({
            'success': False,
            'error': 'File size too large. Maximum size is 10MB.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Generate unique filename
        file_extension = os.path.splitext(image_file.name)[1]
        unique_filename = f"blog_{uuid.uuid4().hex}{file_extension}"

        # Create upload path with date structure
        upload_date = timezone.now().strftime('%Y/%m')
        upload_path = f"blog/images/{upload_date}/{unique_filename}"

        # Optimize image before saving
        optimized_image = optimize_image_for_web(image_file)

        # Save the file
        file_path = default_storage.save(upload_path, optimized_image)
        file_url = default_storage.url(file_path)

        return Response({
            'success': True,
            'data': {
                'url': file_url,
                'path': file_path,
                'filename': unique_filename,
                'size': optimized_image.size if hasattr(optimized_image, 'size') else image_file.size
            }
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to upload image: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def optimize_image_for_web(image_file, max_width=1200, max_height=800, quality=85):
    """
    Optimize image for web display
    """
    try:
        # Open the image
        image = Image.open(image_file)

        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background

        # Calculate new dimensions while maintaining aspect ratio
        original_width, original_height = image.size

        if original_width > max_width or original_height > max_height:
            ratio = min(max_width / original_width, max_height / original_height)
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)

            # Resize image
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Save optimized image to BytesIO
        from io import BytesIO
        output = BytesIO()

        # Determine format
        format_map = {
            'JPEG': 'JPEG',
            'JPG': 'JPEG',
            'PNG': 'PNG',
            'WEBP': 'WEBP'
        }

        # Get original format or default to JPEG
        original_format = image.format or 'JPEG'
        save_format = format_map.get(original_format.upper(), 'JPEG')

        # Save with optimization
        if save_format == 'JPEG':
            image.save(output, format=save_format, quality=quality, optimize=True)
        elif save_format == 'PNG':
            image.save(output, format=save_format, optimize=True)
        else:
            image.save(output, format=save_format)

        output.seek(0)

        # Generate new filename with optimization suffix
        name, ext = os.path.splitext(image_file.name)
        if save_format == 'JPEG' and ext.lower() not in ['.jpg', '.jpeg']:
            ext = '.jpg'
        elif save_format == 'PNG' and ext.lower() != '.png':
            ext = '.png'

        optimized_name = f"{name}_optimized{ext}"

        return ContentFile(output.getvalue(), name=optimized_name)

    except Exception as e:
        # Return original file if optimization fails
        return image_file


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get dashboard statistics for admin
    """
    try:
        # Get basic counts
        total_posts = BlogPost.objects.count()
        published_posts = BlogPost.objects.filter(is_published=True).count()
        draft_posts = total_posts - published_posts
        featured_posts = BlogPost.objects.filter(is_featured=True).count()

        # Get total views and likes
        total_views = BlogPost.objects.aggregate(
            total_views=models.Sum('views')
        )['total_views'] or 0

        total_likes = BlogPost.objects.aggregate(
            total_likes=models.Sum('likes')
        )['total_likes'] or 0

        # Get total comments
        total_comments = Comment.objects.filter(is_approved=True).count()

        # Get recent posts
        recent_posts = BlogPost.objects.order_by('-created_at')[:5]
        recent_posts_data = BlogPostListSerializer(recent_posts, many=True).data

        # Get popular tags
        popular_tags = Tag.objects.filter(usage_count__gt=0).order_by('-usage_count')[:10]
        popular_tags_data = TagSerializer(popular_tags, many=True).data

        return Response({
            'success': True,
            'data': {
                'stats': {
                    'total_posts': total_posts,
                    'published_posts': published_posts,
                    'draft_posts': draft_posts,
                    'featured_posts': featured_posts,
                    'total_views': total_views,
                    'total_likes': total_likes,
                    'total_comments': total_comments
                },
                'recent_posts': recent_posts_data,
                'popular_tags': popular_tags_data
            }
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to fetch dashboard stats: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
