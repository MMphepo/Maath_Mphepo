"""
Admin views for blog preview and management
"""

from django.shortcuts import render, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.generic import DetailView
from django.urls import reverse
from django.utils import timezone
import re
from .models import BlogPost, Tag, Comment


@staff_member_required
def blog_preview(request, post_id):
    """
    Preview a blog post as it would appear on the frontend
    """
    post = get_object_or_404(BlogPost, id=post_id)
    
    # Create post data dictionary
    post_data = {
        'id': post.id,
        'title': post.title,
        'slug': post.slug,
        'description': post.description,
        'content': post.content,
        'banner_image': post.banner_image.url if post.banner_image else None,
        'tags': [tag.name for tag in post.tags.all()],
        'views': post.views,
        'likes': post.likes,
        'read_time': post.read_time,
        'is_published': post.is_published,
        'created_at': post.created_at.isoformat(),
        'updated_at': post.updated_at.isoformat(),
        'author': {
            'name': post.author_name,
            'bio': post.author_bio,
            'avatar': post.author_avatar
        }
    }
    
    # Process content for preview (similar to frontend processing)
    processed_content = process_content_for_preview(post.content)
    
    context = {
        'post': post,
        'post_data': post_data,
        'processed_content': processed_content,
        'is_preview': True,
        'admin_user': request.user,
    }
    
    return render(request, 'admin/blog/preview.html', context)


@staff_member_required
def blog_preview_json(request, post_id):
    """
    Return blog post data as JSON for AJAX preview
    """
    post = get_object_or_404(BlogPost, id=post_id)

    # Create post data dictionary
    post_data = {
        'id': post.id,
        'title': post.title,
        'slug': post.slug,
        'description': post.description,
        'content': post.content,
        'banner_image': post.banner_image.url if post.banner_image else None,
        'tags': [tag.name for tag in post.tags.all()],
        'views': post.views,
        'likes': post.likes,
        'read_time': post.read_time,
        'is_published': post.is_published,
        'created_at': post.created_at.isoformat(),
        'updated_at': post.updated_at.isoformat(),
    }

    return JsonResponse({
        'success': True,
        'post': post_data,
        'preview_url': reverse('blog:blog_preview', args=[post.id])
    })


@staff_member_required
def blog_content_preview(request):
    """
    Preview content without saving (for AJAX requests)
    """
    if request.method == 'POST':
        content = request.POST.get('content', '')
        title = request.POST.get('title', 'Preview')
        
        # Process content
        processed_content = process_content_for_preview(content)
        
        # Generate table of contents
        toc = generate_table_of_contents(content)
        
        # Calculate reading time
        word_count = len(re.sub(r'<[^>]+>', '', content).split())
        read_time = max(1, word_count // 200)
        
        return JsonResponse({
            'success': True,
            'processed_content': processed_content,
            'toc': toc,
            'word_count': word_count,
            'read_time': read_time
        })
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@staff_member_required
def blog_analytics_preview(request, post_id):
    """
    Show analytics preview for a blog post
    """
    post = get_object_or_404(BlogPost, id=post_id)
    
    # Get comments
    comments = Comment.objects.filter(blog_post=post).order_by('-created_at')
    approved_comments = comments.filter(is_approved=True)
    pending_comments = comments.filter(is_approved=False)
    
    # Calculate engagement metrics
    engagement_rate = 0
    if post.views > 0:
        engagement_rate = ((post.likes + approved_comments.count()) / post.views) * 100
    
    # Get related posts by tags
    related_posts = BlogPost.objects.filter(
        tags__in=post.tags.all(),
        is_published=True
    ).exclude(id=post.id).distinct()[:5]
    
    context = {
        'post': post,
        'total_comments': comments.count(),
        'approved_comments': approved_comments.count(),
        'pending_comments': pending_comments.count(),
        'engagement_rate': round(engagement_rate, 2),
        'related_posts': related_posts,
        'comments': comments[:10],  # Latest 10 comments
    }
    
    return render(request, 'admin/blog/analytics_preview.html', context)


def process_content_for_preview(content):
    """
    Process blog content for preview display
    """
    if not content:
        return ''
    
    # Add IDs to headings for table of contents
    def add_heading_ids(match):
        level = len(match.group(1))
        text = match.group(2).strip()
        heading_id = generate_slug(text)
        return f'<h{level} id="{heading_id}">{text}</h{level}>'
    
    # Process headings
    content = re.sub(r'<h([1-6])>(.*?)</h[1-6]>', add_heading_ids, content)
    
    # Add syntax highlighting classes to code blocks
    content = re.sub(
        r'<pre><code class="language-(\w+)">(.*?)</code></pre>',
        r'<pre class="language-\1"><code class="language-\1">\2</code></pre>',
        content,
        flags=re.DOTALL
    )
    
    # Add responsive classes to images
    content = re.sub(
        r'<img([^>]*?)>',
        r'<img\1 class="img-responsive blog-image" loading="lazy">',
        content
    )
    
    # Add target="_blank" to external links
    content = re.sub(
        r'<a href="(https?://[^"]*)"([^>]*)>',
        r'<a href="\1"\2 target="_blank" rel="noopener noreferrer">',
        content
    )
    
    return content


def generate_table_of_contents(content):
    """
    Generate table of contents from content
    """
    if not content:
        return []
    
    # Find all headings
    headings = re.findall(r'<h([1-6])>(.*?)</h[1-6]>', content)
    
    toc = []
    for level, text in headings:
        # Clean text (remove HTML tags)
        clean_text = re.sub(r'<[^>]+>', '', text).strip()
        if clean_text:
            toc.append({
                'level': int(level),
                'text': clean_text,
                'id': generate_slug(clean_text)
            })
    
    return toc


def generate_slug(text):
    """
    Generate URL-friendly slug from text
    """
    import re
    from django.utils.text import slugify
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Generate slug
    return slugify(text)


@staff_member_required
def bulk_action_preview(request):
    """
    Preview bulk actions before applying them
    """
    if request.method == 'POST':
        action = request.POST.get('action')
        post_ids = request.POST.getlist('_selected_action')
        
        if not post_ids:
            return JsonResponse({'success': False, 'error': 'No posts selected'})
        
        posts = BlogPost.objects.filter(id__in=post_ids)
        
        preview_data = {
            'action': action,
            'affected_posts': [],
            'summary': {}
        }
        
        for post in posts:
            preview_data['affected_posts'].append({
                'id': post.id,
                'title': post.title,
                'current_status': 'Published' if post.is_published else 'Draft',
                'current_featured': post.is_featured
            })
        
        # Generate action summary
        if action == 'make_published':
            draft_count = posts.filter(is_published=False).count()
            preview_data['summary'] = {
                'message': f'Will publish {draft_count} draft posts',
                'type': 'success'
            }
        elif action == 'make_unpublished':
            published_count = posts.filter(is_published=True).count()
            preview_data['summary'] = {
                'message': f'Will unpublish {published_count} published posts',
                'type': 'warning'
            }
        elif action == 'make_featured':
            unfeatured_count = posts.filter(is_featured=False).count()
            preview_data['summary'] = {
                'message': f'Will feature {unfeatured_count} posts',
                'type': 'info'
            }
        elif action == 'make_unfeatured':
            featured_count = posts.filter(is_featured=True).count()
            preview_data['summary'] = {
                'message': f'Will unfeature {featured_count} posts',
                'type': 'info'
            }
        
        return JsonResponse({'success': True, 'preview': preview_data})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@staff_member_required
def export_blog_data(request):
    """
    Export blog data for backup or migration
    """
    if request.method == 'POST':
        export_format = request.POST.get('format', 'json')
        include_drafts = request.POST.get('include_drafts') == 'on'
        include_comments = request.POST.get('include_comments') == 'on'
        
        # Get posts
        posts_query = BlogPost.objects.all()
        if not include_drafts:
            posts_query = posts_query.filter(is_published=True)
        
        posts = posts_query.order_by('-created_at')
        
        export_data = {
            'export_date': timezone.now().isoformat(),
            'total_posts': posts.count(),
            'posts': []
        }
        
        for post in posts:
            post_data = {
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'description': post.description,
                'content': post.content,
                'banner_image': post.banner_image.url if post.banner_image else None,
                'tags': [tag.name for tag in post.tags.all()],
                'views': post.views,
                'likes': post.likes,
                'read_time': post.read_time,
                'is_published': post.is_published,
                'created_at': post.created_at.isoformat(),
                'updated_at': post.updated_at.isoformat(),
            }

            if include_comments:
                comments = Comment.objects.filter(blog_post=post, is_approved=True)
                post_data['comments'] = [
                    {
                        'name': comment.name,
                        'content': comment.content,
                        'created_at': comment.created_at.isoformat()
                    }
                    for comment in comments
                ]

            export_data['posts'].append(post_data)
        
        if export_format == 'json':
            response = JsonResponse(export_data, json_dumps_params={'indent': 2})
            response['Content-Disposition'] = 'attachment; filename="blog_export.json"'
            return response
        
        # Add other export formats here (CSV, XML, etc.)
        
    return JsonResponse({'success': False, 'error': 'Invalid request'})


@method_decorator(staff_member_required, name='dispatch')
class BlogPostPreviewView(DetailView):
    """
    Class-based view for blog post preview
    """
    model = BlogPost
    template_name = 'admin/blog/preview_detail.html'
    context_object_name = 'post'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.get_object()
        
        # Add serialized data
        context['post_data'] = {
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'description': post.description,
            'content': post.content,
            'banner_image': post.banner_image.url if post.banner_image else None,
            'tags': [tag.name for tag in post.tags.all()],
            'views': post.views,
            'likes': post.likes,
            'read_time': post.read_time,
            'is_published': post.is_published,
            'created_at': post.created_at.isoformat(),
            'updated_at': post.updated_at.isoformat(),
        }
        
        # Process content
        context['processed_content'] = process_content_for_preview(post.content)
        
        # Generate TOC
        context['toc'] = generate_table_of_contents(post.content)
        
        # Add preview flag
        context['is_preview'] = True
        context['admin_user'] = self.request.user
        
        return context
