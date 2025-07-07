from django.db import models


class SiteConfiguration(models.Model):
    """Site-wide configuration settings"""
    site_name = models.CharField(max_length=100, default="Maath Mphepo Portfolio")
    site_description = models.TextField(default="Backend Developer & Software Engineer")
    site_keywords = models.TextField(blank=True)
    site_author = models.CharField(max_length=100, default="Maath Mphepo")
    
    # Contact info
    email = models.EmailField(default="maathmphepo80@gmail.com")
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    # Social media
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    
    # SEO
    google_analytics_id = models.CharField(max_length=50, blank=True)
    google_tag_manager_id = models.CharField(max_length=50, blank=True)
    
    # Features
    blog_enabled = models.BooleanField(default=True)
    projects_enabled = models.BooleanField(default=True)
    contact_form_enabled = models.BooleanField(default=True)
    newsletter_enabled = models.BooleanField(default=True)
    
    # Maintenance
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configuration"

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        # Ensure only one configuration exists
        if not self.pk and SiteConfiguration.objects.exists():
            raise ValueError("Only one site configuration is allowed")
        super().save(*args, **kwargs)

    @classmethod
    def get_config(cls):
        """Get or create site configuration"""
        config, created = cls.objects.get_or_create(pk=1)
        return config


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    avatar = models.URLField(blank=True, null=True)
    testimonial = models.TextField()
    rating = models.PositiveIntegerField(default=5, help_text="Rating out of 5")
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"Testimonial by {self.name} from {self.company}"


class Achievement(models.Model):
    CATEGORY_CHOICES = [
        ('award', 'Award'),
        ('certification', 'Certification'),
        ('milestone', 'Milestone'),
        ('recognition', 'Recognition'),
        ('publication', 'Publication'),
    ]
    
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    date_achieved = models.DateField()
    issuing_organization = models.CharField(max_length=100, blank=True)
    certificate_url = models.URLField(blank=True, null=True)
    badge_image = models.URLField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-date_achieved']

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"
