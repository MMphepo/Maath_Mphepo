"""
Blog utilities for image processing and content management
"""

import os
import uuid
from PIL import Image, ImageOps
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


def optimize_image(image_file, max_width=1200, max_height=800, quality=85):
    """
    Optimize uploaded images for web display
    
    Args:
        image_file: Django UploadedFile object
        max_width: Maximum width in pixels
        max_height: Maximum height in pixels
        quality: JPEG quality (1-100)
    
    Returns:
        ContentFile: Optimized image file
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
        
        # Auto-orient based on EXIF data
        image = ImageOps.exif_transpose(image)
        
        # Calculate new dimensions while maintaining aspect ratio
        original_width, original_height = image.size
        
        # Only resize if image is larger than max dimensions
        if original_width > max_width or original_height > max_height:
            ratio = min(max_width / original_width, max_height / original_height)
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)
            
            # Use high-quality resampling
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized image to BytesIO
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
        logger.error(f"Error optimizing image {image_file.name}: {str(e)}")
        # Return original file if optimization fails
        return image_file


def generate_thumbnail(image_file, size=(300, 200)):
    """
    Generate thumbnail for an image
    
    Args:
        image_file: Django UploadedFile object or file path
        size: Tuple of (width, height) for thumbnail
    
    Returns:
        ContentFile: Thumbnail image file
    """
    try:
        if isinstance(image_file, str):
            # If it's a file path, open it
            image = Image.open(image_file)
        else:
            # If it's an uploaded file, open it
            image = Image.open(image_file)
        
        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Auto-orient based on EXIF data
        image = ImageOps.exif_transpose(image)
        
        # Create thumbnail maintaining aspect ratio
        image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Create a new image with the exact size and center the thumbnail
        thumb = Image.new('RGB', size, (255, 255, 255))
        
        # Calculate position to center the thumbnail
        x = (size[0] - image.size[0]) // 2
        y = (size[1] - image.size[1]) // 2
        
        thumb.paste(image, (x, y))
        
        # Save thumbnail to BytesIO
        output = BytesIO()
        thumb.save(output, format='JPEG', quality=90, optimize=True)
        output.seek(0)
        
        # Generate thumbnail filename
        if isinstance(image_file, str):
            name = os.path.basename(image_file)
        else:
            name = image_file.name
        
        name_without_ext = os.path.splitext(name)[0]
        thumb_name = f"{name_without_ext}_thumb.jpg"
        
        return ContentFile(output.getvalue(), name=thumb_name)
        
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        return None


def clean_filename(filename):
    """
    Clean filename for safe storage
    
    Args:
        filename: Original filename
    
    Returns:
        str: Cleaned filename
    """
    # Remove unsafe characters
    import re
    name, ext = os.path.splitext(filename)
    
    # Replace spaces and special characters with underscores
    clean_name = re.sub(r'[^\w\-_.]', '_', name)
    
    # Remove multiple consecutive underscores
    clean_name = re.sub(r'_+', '_', clean_name)
    
    # Remove leading/trailing underscores
    clean_name = clean_name.strip('_')
    
    # Ensure we have a name
    if not clean_name:
        clean_name = str(uuid.uuid4())[:8]
    
    return f"{clean_name}{ext.lower()}"


def get_image_dimensions(image_file):
    """
    Get dimensions of an image file
    
    Args:
        image_file: Django UploadedFile object or file path
    
    Returns:
        tuple: (width, height) or None if error
    """
    try:
        if isinstance(image_file, str):
            image = Image.open(image_file)
        else:
            image = Image.open(image_file)
        
        return image.size
    except Exception as e:
        logger.error(f"Error getting image dimensions: {str(e)}")
        return None


def validate_image_file(image_file, max_size_mb=10):
    """
    Validate uploaded image file
    
    Args:
        image_file: Django UploadedFile object
        max_size_mb: Maximum file size in MB
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check file size
    if image_file.size > max_size_mb * 1024 * 1024:
        return False, f"File size exceeds {max_size_mb}MB limit"
    
    # Check file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if image_file.content_type not in allowed_types:
        return False, "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
    
    # Try to open the image to verify it's valid
    try:
        image = Image.open(image_file)
        image.verify()
        return True, None
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"


def create_responsive_images(image_file, sizes=None):
    """
    Create multiple sizes of an image for responsive design
    
    Args:
        image_file: Django UploadedFile object
        sizes: List of (width, height) tuples
    
    Returns:
        dict: Dictionary with size names as keys and file paths as values
    """
    if sizes is None:
        sizes = [
            ('small', 400, 300),
            ('medium', 800, 600),
            ('large', 1200, 900),
            ('xlarge', 1600, 1200)
        ]
    
    responsive_images = {}
    
    try:
        image = Image.open(image_file)
        
        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Auto-orient based on EXIF data
        image = ImageOps.exif_transpose(image)
        
        original_width, original_height = image.size
        
        for size_name, max_width, max_height in sizes:
            # Skip if original is smaller than target size
            if original_width <= max_width and original_height <= max_height:
                continue
            
            # Calculate new dimensions
            ratio = min(max_width / original_width, max_height / original_height)
            new_width = int(original_width * ratio)
            new_height = int(original_height * ratio)
            
            # Resize image
            resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save resized image
            output = BytesIO()
            resized_image.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            # Generate filename
            name, ext = os.path.splitext(image_file.name)
            responsive_name = f"{name}_{size_name}.jpg"
            
            # Save to storage
            file_path = default_storage.save(
                f"blog/responsive/{responsive_name}",
                ContentFile(output.getvalue())
            )
            
            responsive_images[size_name] = file_path
        
        return responsive_images
        
    except Exception as e:
        logger.error(f"Error creating responsive images: {str(e)}")
        return {}
