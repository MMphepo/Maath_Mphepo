from django.db import models
from django.utils.text import slugify
from django.utils import timezone
import re
import math


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


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    content = models.TextField()
    banner_image = models.URLField(blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    read_time = models.PositiveIntegerField(default=5)  # in minutes
    is_published = models.BooleanField(default=False)
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
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Calculate read time based on content
        if self.content:
            word_count = len(self.content.split())
            self.read_time = max(1, math.ceil(word_count / 200))  # 200 words per minute
        
        super().save(*args, **kwargs)
        
        # Update tag usage counts
        for tag in self.tags.all():
            tag.update_usage_count()

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
