"""
Custom storage backends for blog media files
"""

import os
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.utils.deconstruct import deconstructible
from .utils import optimize_image, validate_image_file


@deconstructible
class OptimizedImageStorage(FileSystemStorage):
    """
    Custom storage that automatically optimizes images on upload
    """
    
    def __init__(self, location=None, base_url=None, file_permissions_mode=None,
                 directory_permissions_mode=None, auto_optimize=True, max_size_mb=10):
        self.auto_optimize = auto_optimize
        self.max_size_mb = max_size_mb
        
        if location is None:
            location = os.path.join(settings.MEDIA_ROOT, 'blog')
        if base_url is None:
            base_url = f"{settings.MEDIA_URL}blog/"
            
        super().__init__(
            location=location,
            base_url=base_url,
            file_permissions_mode=file_permissions_mode,
            directory_permissions_mode=directory_permissions_mode
        )
    
    def _save(self, name, content):
        """
        Override save to add image optimization
        """
        # Validate image if it's an image file
        if self._is_image_file(name):
            is_valid, error_message = validate_image_file(content, self.max_size_mb)
            if not is_valid:
                raise ValueError(f"Image validation failed: {error_message}")
            
            # Optimize image if auto_optimize is enabled
            if self.auto_optimize:
                try:
                    content = optimize_image(content)
                    # Update name if optimization changed the extension
                    if hasattr(content, 'name') and content.name:
                        name = content.name
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).warning(
                        f"Image optimization failed for {name}: {str(e)}"
                    )
        
        return super()._save(name, content)
    
    def _is_image_file(self, name):
        """
        Check if file is an image based on extension
        """
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']
        return any(name.lower().endswith(ext) for ext in image_extensions)
    
    def get_available_name(self, name, max_length=None):
        """
        Override to create directory structure if it doesn't exist
        """
        # Ensure directory exists
        dir_name = os.path.dirname(name)
        if dir_name:
            full_path = os.path.join(self.location, dir_name)
            os.makedirs(full_path, exist_ok=True)
        
        return super().get_available_name(name, max_length)


@deconstructible
class CKEditorStorage(FileSystemStorage):
    """
    Custom storage for CKEditor uploads with additional security
    """
    
    def __init__(self, location=None, base_url=None):
        if location is None:
            location = os.path.join(settings.MEDIA_ROOT, 'uploads')
        if base_url is None:
            base_url = f"{settings.MEDIA_URL}uploads/"
            
        super().__init__(location=location, base_url=base_url)
    
    def _save(self, name, content):
        """
        Override save to add security checks
        """
        # Security: Check file type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
        file_ext = os.path.splitext(name)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise ValueError(f"File type {file_ext} is not allowed")
        
        # For images, validate and optimize
        if file_ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            is_valid, error_message = validate_image_file(content, max_size_mb=5)
            if not is_valid:
                raise ValueError(f"Image validation failed: {error_message}")
            
            # Optimize image
            try:
                content = optimize_image(content, max_width=1600, max_height=1200, quality=90)
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    f"Image optimization failed for {name}: {str(e)}"
                )
        
        return super()._save(name, content)
    
    def get_available_name(self, name, max_length=None):
        """
        Override to organize files by date
        """
        from django.utils import timezone
        
        # Add date-based directory structure
        date_path = timezone.now().strftime('%Y/%m')
        name = os.path.join(date_path, name)
        
        # Ensure directory exists
        dir_name = os.path.dirname(name)
        if dir_name:
            full_path = os.path.join(self.location, dir_name)
            os.makedirs(full_path, exist_ok=True)
        
        return super().get_available_name(name, max_length)


# Storage instances
optimized_image_storage = OptimizedImageStorage()
ckeditor_storage = CKEditorStorage()


def get_upload_path(instance, filename, subfolder=''):
    """
    Generate upload path for model files
    
    Args:
        instance: Model instance
        filename: Original filename
        subfolder: Optional subfolder name
    
    Returns:
        str: Upload path
    """
    from django.utils import timezone
    from .utils import clean_filename
    
    # Clean filename
    clean_name = clean_filename(filename)
    
    # Create date-based path
    date_path = timezone.now().strftime('%Y/%m')
    
    # Generate path
    if subfolder:
        path = os.path.join('blog', subfolder, date_path, clean_name)
    else:
        path = os.path.join('blog', date_path, clean_name)
    
    return path


def blog_upload_path(instance, filename):
    """Upload path for blog-related files"""
    return get_upload_path(instance, filename, 'general')


def blog_image_upload_path_optimized(instance, filename):
    """Upload path for blog images with optimization"""
    return get_upload_path(instance, filename, 'images')


def blog_thumbnail_upload_path(instance, filename):
    """Upload path for blog thumbnails"""
    return get_upload_path(instance, filename, 'thumbnails')


# Configuration for different file types
STORAGE_CONFIGS = {
    'blog_images': {
        'storage': optimized_image_storage,
        'upload_path': blog_image_upload_path_optimized,
        'max_size_mb': 10,
        'allowed_types': ['image/jpeg', 'image/png', 'image/webp'],
        'optimize': True
    },
    'ckeditor_uploads': {
        'storage': ckeditor_storage,
        'upload_path': None,  # Handled by CKEditor
        'max_size_mb': 5,
        'allowed_types': [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        'optimize': True
    }
}


def get_storage_config(storage_type):
    """
    Get storage configuration for a specific type
    
    Args:
        storage_type: Type of storage ('blog_images', 'ckeditor_uploads', etc.)
    
    Returns:
        dict: Storage configuration
    """
    return STORAGE_CONFIGS.get(storage_type, STORAGE_CONFIGS['blog_images'])


def cleanup_unused_media():
    """
    Clean up unused media files (to be called by management command)
    """
    import os
    from django.conf import settings
    from .models import BlogPost
    
    # Get all image files in media directory
    media_root = settings.MEDIA_ROOT
    blog_media_path = os.path.join(media_root, 'blog')
    
    if not os.path.exists(blog_media_path):
        return
    
    # Get all files in blog media directory
    all_files = []
    for root, dirs, files in os.walk(blog_media_path):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, media_root)
            all_files.append(rel_path.replace('\\', '/'))  # Normalize path separators
    
    # Get all files referenced in database
    used_files = set()
    
    # Check BlogPost banner images
    for post in BlogPost.objects.all():
        if post.banner_image:
            used_files.add(post.banner_image.name)
    
    # Find unused files
    unused_files = set(all_files) - used_files
    
    # Delete unused files (be careful with this!)
    deleted_count = 0
    for file_path in unused_files:
        full_path = os.path.join(media_root, file_path)
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
                deleted_count += 1
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error deleting {full_path}: {str(e)}")
    
    return deleted_count, len(unused_files)
