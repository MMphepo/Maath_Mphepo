from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.core.files.storage import default_storage
from django.contrib.auth.models import User
from ckeditor_uploader.fields import RichTextUploadingField
import re
import math
import os


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-usage_count', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def update_usage_count(self):
        """Update usage count based on published blog posts"""
        self.usage_count = self.blogpost_set.filter(is_published=True).count()
        self.save()


def blog_image_upload_path(instance, filename):
    """Generate upload path for blog images"""
    from .utils import clean_filename

    # Clean the filename
    clean_name = clean_filename(filename)

    # Create path with date structure
    date_path = timezone.now().strftime('%Y/%m')
    slug_prefix = instance.slug or 'blog'

    # Generate unique filename
    name, ext = os.path.splitext(clean_name)
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    final_name = f"{slug_prefix}_{timestamp}_{name}{ext}"

    return os.path.join('blog', 'images', date_path, final_name)


class BlogPost(models.Model):
    # Basic Information
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(5)],
        help_text="Blog post title (5-200 characters)"
    )
    slug = models.SlugField(unique=True, blank=True, max_length=250)
    description = models.TextField(
        validators=[MinLengthValidator(50), MaxLengthValidator(500)],
        help_text="Brief description for SEO and previews (50-500 characters)"
    )

    # Content
    content = RichTextUploadingField(
        config_name='blog_content',
        help_text="Main blog content with rich text formatting"
    )

    # SEO Fields
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        help_text="SEO meta description (max 160 characters)"
    )
    meta_keywords = models.CharField(
        max_length=255,
        blank=True,
        help_text="SEO keywords, comma-separated"
    )

    # Media
    banner_image = models.ImageField(
        upload_to=blog_image_upload_path,
        blank=True,
        null=True,
        help_text="Featured image for the blog post"
    )
    banner_image_alt = models.CharField(
        max_length=255,
        blank=True,
        help_text="Alt text for banner image (accessibility)"
    )

    # Relationships
    tags = models.ManyToManyField(Tag, blank=True)

    # Statistics
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    read_time = models.PositiveIntegerField(default=5)  # in minutes

    # Publishing
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False, help_text="Feature this post on homepage")
    published_at = models.DateTimeField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Author info (embedded for simplicity)
    author_name = models.CharField(max_length=100, default="Maath Mphepo")
    author_bio = models.TextField(default="Backend Developer & Software Engineer")
    author_avatar = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Generate slug if not provided
        if not self.slug:
            self.slug = slugify(self.title)

        # Auto-generate meta description from description if not provided
        if not self.meta_description and self.description:
            self.meta_description = self.description[:160]

        # Set published_at when first published
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        elif not self.is_published:
            self.published_at = None

        # Calculate read time based on content
        if self.content:
            # Strip HTML tags for word count
            clean_content = re.sub(r'<[^>]+>', '', self.content)
            word_count = len(clean_content.split())
            self.read_time = max(1, math.ceil(word_count / 200))  # 200 words per minute

        # Handle image optimization
        if self.banner_image and hasattr(self.banner_image, 'file') and not kwargs.get('no_optimize', False):
            try:
                from .utils import optimize_image, generate_thumbnail

                # Only optimize if it's a new file or has been changed
                if hasattr(self, '_original_banner_image'):
                    if self._original_banner_image != self.banner_image:
                        self.banner_image = optimize_image(self.banner_image)
                else:
                    self.banner_image = optimize_image(self.banner_image)

                # Save without optimization to prevent infinite recursion
                kwargs['no_optimize'] = True
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error optimizing image: {str(e)}")

        super().save(*args, **kwargs)

        # Update tag usage counts
        for tag in self.tags.all():
            tag.update_usage_count()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Store original banner image to detect changes
        self._original_banner_image = self.banner_image if self.pk else None

    def validate_for_publishing(self):
        """
        Validate blog post before publishing

        Returns:
            tuple: (is_valid, errors_list)
        """
        errors = []

        # Check required fields
        if not self.title or len(self.title.strip()) < 5:
            errors.append("Title must be at least 5 characters long")

        if not self.description or len(self.description.strip()) < 50:
            errors.append("Description must be at least 50 characters long")

        if not self.content or len(self.content.strip()) < 100:
            errors.append("Content must be at least 100 characters long")

        # Check SEO fields
        if self.meta_description and len(self.meta_description) > 160:
            errors.append("Meta description should not exceed 160 characters")

        # Check content quality
        if self.content:
            word_count = len(re.sub(r'<[^>]+>', '', self.content).split())
            if word_count < 50:
                errors.append("Content should have at least 50 words")

        # Check for duplicate slug
        if self.slug:
            duplicate = BlogPost.objects.filter(slug=self.slug).exclude(pk=self.pk).first()
            if duplicate:
                errors.append(f"Slug '{self.slug}' is already in use")

        return len(errors) == 0, errors

    def create_draft_version(self, user, notes=""):
        """
        Create a draft version of the current post

        Args:
            user: User creating the draft
            notes: Optional notes about the draft

        Returns:
            DraftVersion: Created draft version
        """
        return DraftVersion.objects.create(
            blog_post=self,
            user=user,
            content=self.content,
            title=self.title,
            description=self.description,
            notes=notes
        )

    def restore_from_draft(self, draft_version):
        """
        Restore blog post from a draft version

        Args:
            draft_version: DraftVersion instance to restore from
        """
        self.content = draft_version.content
        self.title = draft_version.title
        self.description = draft_version.description
        # Don't auto-save, let the user decide

    def get_autosave(self, user):
        """
        Get auto-save for this post and user

        Args:
            user: User to get auto-save for

        Returns:
            AutoSave or None
        """
        return self.autosaves.filter(user=user).first()

    def has_unsaved_changes(self, user):
        """
        Check if there are unsaved changes for this user

        Args:
            user: User to check for

        Returns:
            bool: True if there are unsaved changes
        """
        autosave = self.get_autosave(user)
        if not autosave:
            return False

        # Compare current content with auto-saved content
        return (
            autosave.content != self.content or
            autosave.title != self.title or
            autosave.description != self.description
        )

    def get_content_statistics(self):
        """
        Get content statistics

        Returns:
            dict: Content statistics
        """
        if not self.content:
            return {
                'word_count': 0,
                'character_count': 0,
                'paragraph_count': 0,
                'heading_count': 0,
                'image_count': 0,
                'link_count': 0
            }

        # Strip HTML for word count
        clean_content = re.sub(r'<[^>]+>', '', self.content)

        # Count various elements
        word_count = len(clean_content.split())
        character_count = len(clean_content)
        paragraph_count = len(re.findall(r'<p[^>]*>', self.content))
        heading_count = len(re.findall(r'<h[1-6][^>]*>', self.content))
        image_count = len(re.findall(r'<img[^>]*>', self.content))
        link_count = len(re.findall(r'<a[^>]*>', self.content))

        return {
            'word_count': word_count,
            'character_count': character_count,
            'paragraph_count': paragraph_count,
            'heading_count': heading_count,
            'image_count': image_count,
            'link_count': link_count
        }

    def get_excerpt(self, length=150):
        """Get excerpt from content"""
        if self.description:
            return self.description[:length] + "..." if len(self.description) > length else self.description
        
        # Fallback to content
        clean_content = re.sub(r'[#*`\[\]()]', '', self.content)
        return clean_content[:length] + "..." if len(clean_content) > length else clean_content

    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])

    def get_comments_count(self):
        """Get total comments count including replies"""
        return self.comments.filter(is_approved=True).count()

    def get_top_level_comments(self):
        """Get only top-level comments (no parent)"""
        return self.comments.filter(parent=None, is_approved=True).order_by('-created_at')


class Comment(models.Model):
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.name} on {self.blog_post.title}'

    def get_replies(self):
        """Get approved replies to this comment"""
        return self.replies.filter(is_approved=True).order_by('created_at')


class AutoSave(models.Model):
    """
    Auto-save model for blog posts
    """
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='autosaves')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_autosaves')
    content = models.TextField(blank=True)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    last_modified = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('blog_post', 'user')
        ordering = ['-last_modified']

    def __str__(self):
        return f'AutoSave for {self.blog_post.title} by {self.user.username}'


class DraftVersion(models.Model):
    """
    Draft version model for blog posts
    """
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='draft_versions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_drafts')
    content = models.TextField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    version_number = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Notes about this draft version")

    class Meta:
        ordering = ['-created_at']
        unique_together = ('blog_post', 'version_number')

    def __str__(self):
        return f'Draft v{self.version_number} for {self.blog_post.title}'

    def save(self, *args, **kwargs):
        # Auto-increment version number if not specified
        if not self.version_number and self.blog_post:
            latest = DraftVersion.objects.filter(blog_post=self.blog_post).order_by('-version_number').first()
            self.version_number = (latest.version_number + 1) if latest else 1

        super().save(*args, **kwargs)


class BlogReaction(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('heart', 'Heart'),
        ('clap', 'Clap'),
    ]
    
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='reactions')
    ip_address = models.GenericIPAddressField()
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES, default='like')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['blog_post', 'ip_address', 'reaction_type']

    def __str__(self):
        return f'{self.reaction_type} on {self.blog_post.title} from {self.ip_address}'

    @classmethod
    def toggle_reaction(cls, blog_post, ip_address, reaction_type='like'):
        """Toggle reaction for a blog post from an IP address"""
        reaction, created = cls.objects.get_or_create(
            blog_post=blog_post,
            ip_address=ip_address,
            reaction_type=reaction_type
        )
        
        if not created:
            # Remove existing reaction
            reaction.delete()
            blog_post.likes = max(0, blog_post.likes - 1)
            blog_post.save(update_fields=['likes'])
            return False
        else:
            # Add new reaction
            blog_post.likes += 1
            blog_post.save(update_fields=['likes'])
            return True
