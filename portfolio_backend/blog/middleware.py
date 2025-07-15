"""
Middleware for blog auto-save functionality
"""

import json
import logging
from django.utils import timezone
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.urls import resolve, reverse
from django.conf import settings

logger = logging.getLogger(__name__)


class BlogAutoSaveMiddleware:
    """
    Middleware to handle auto-save functionality for blog posts
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Process view to handle auto-save requests
        """
        # Only process POST requests from staff users
        if not request.method == 'POST' or not request.user.is_staff:
            return None
        
        # Check if this is an auto-save request
        if 'auto_save' in request.POST and request.POST.get('auto_save') == 'true':
            try:
                # Get the URL pattern
                url_name = resolve(request.path_info).url_name
                
                # Handle blog post auto-save
                if url_name == 'blog_blogpost_change':
                    return self.handle_blog_post_autosave(request, view_kwargs.get('object_id'))
            
            except Exception as e:
                logger.error(f"Auto-save error: {str(e)}")
        
        return None
    
    def handle_blog_post_autosave(self, request, post_id):
        """
        Handle auto-save for blog posts
        """
        from .models import BlogPost, AutoSave
        
        try:
            # Get the blog post
            post = BlogPost.objects.get(id=post_id)
            
            # Create or update auto-save
            auto_save, created = AutoSave.objects.update_or_create(
                blog_post=post,
                user=request.user,
                defaults={
                    'content': request.POST.get('content', ''),
                    'title': request.POST.get('title', ''),
                    'description': request.POST.get('description', ''),
                    'last_modified': timezone.now()
                }
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Auto-save successful',
                'timestamp': auto_save.last_modified.isoformat()
            })
            
        except Exception as e:
            logger.error(f"Blog post auto-save error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Auto-save failed: {str(e)}'
            }, status=500)


@staff_member_required
def recover_autosave(request, post_id):
    """
    Recover auto-saved content
    """
    from .models import BlogPost, AutoSave
    
    try:
        # Get the blog post
        post = BlogPost.objects.get(id=post_id)
        
        # Get auto-save
        auto_save = AutoSave.objects.filter(
            blog_post=post,
            user=request.user
        ).first()
        
        if auto_save:
            return JsonResponse({
                'success': True,
                'auto_save': {
                    'content': auto_save.content,
                    'title': auto_save.title,
                    'description': auto_save.description,
                    'timestamp': auto_save.last_modified.isoformat()
                }
            })
        
        return JsonResponse({
            'success': False,
            'message': 'No auto-save found'
        })
        
    except Exception as e:
        logger.error(f"Recover auto-save error: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Error recovering auto-save: {str(e)}'
        }, status=500)


@staff_member_required
def discard_autosave(request, post_id):
    """
    Discard auto-saved content
    """
    from .models import BlogPost, AutoSave
    
    try:
        # Get the blog post
        post = BlogPost.objects.get(id=post_id)
        
        # Delete auto-save
        deleted, _ = AutoSave.objects.filter(
            blog_post=post,
            user=request.user
        ).delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Auto-save discarded',
            'deleted': deleted > 0
        })
        
    except Exception as e:
        logger.error(f"Discard auto-save error: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Error discarding auto-save: {str(e)}'
        }, status=500)
