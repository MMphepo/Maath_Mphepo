from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json

from .models import BlogPost, Tag, Comment, BlogReaction
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer,
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
