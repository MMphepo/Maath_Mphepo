from django.db import models
from django.utils import timezone


class ContactSubmission(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('archived', 'Archived'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True, null=True)
    budget_range = models.CharField(max_length=50, blank=True)
    project_timeline = models.CharField(max_length=100, blank=True)
    how_found = models.CharField(max_length=100, blank=True, help_text="How they found you")
    
    # Admin fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    admin_notes = models.TextField(blank=True, help_text="Internal notes")
    replied_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking fields
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Contact from {self.name} - {self.subject}"

    def mark_as_read(self):
        """Mark submission as read"""
        if self.status == 'new':
            self.status = 'read'
            self.save(update_fields=['status', 'updated_at'])

    def mark_as_replied(self):
        """Mark submission as replied"""
        self.status = 'replied'
        self.replied_at = timezone.now()
        self.save(update_fields=['status', 'replied_at', 'updated_at'])

    @property
    def is_recent(self):
        """Check if submission is within last 24 hours"""
        return (timezone.now() - self.created_at).days < 1

    @property
    def response_time_hours(self):
        """Calculate response time in hours if replied"""
        if self.replied_at:
            return (self.replied_at - self.created_at).total_seconds() / 3600
        return None


class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    source = models.CharField(max_length=100, blank=True, help_text="Where they subscribed from")

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self):
        return f"Newsletter: {self.email}"

    def unsubscribe(self):
        """Unsubscribe user"""
        self.is_active = False
        self.unsubscribed_at = timezone.now()
        self.save(update_fields=['is_active', 'unsubscribed_at'])


class SocialLink(models.Model):
    PLATFORM_CHOICES = [
        ('github', 'GitHub'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('youtube', 'YouTube'),
        ('medium', 'Medium'),
        ('dev', 'Dev.to'),
        ('stackoverflow', 'Stack Overflow'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('website', 'Website'),
        ('other', 'Other'),
    ]
    
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    url = models.URLField()
    username = models.CharField(max_length=100, blank=True)
    icon_class = models.CharField(max_length=100, help_text="CSS class for icon")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'platform']

    def __str__(self):
        return f"{self.get_platform_display()}: {self.username or self.url}"
