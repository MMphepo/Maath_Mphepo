from django.db import models
from django.utils.text import slugify


class TechStack(models.Model):
    CATEGORY_CHOICES = [
        ('backend', 'Backend'),
        ('frontend', 'Frontend'),
        ('database', 'Database'),
        ('tools', 'Tools'),
        ('cloud', 'Cloud'),
        ('mobile', 'Mobile'),
        ('devops', 'DevOps'),
    ]
    
    name = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon_class = models.CharField(max_length=100, help_text="CSS class for icon (e.g., 'fab fa-python')")
    color = models.CharField(max_length=7, default="#10B981", help_text="Hex color code")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Project(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('in_progress', 'In Progress'),
        ('planned', 'Planned'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    detailed_description = models.TextField(blank=True, help_text="Longer description for project detail page")
    features = models.JSONField(default=list, help_text="List of key features")
    tech_stack = models.ManyToManyField(TechStack, blank=True)
    github_link = models.URLField(blank=True, null=True)
    live_link = models.URLField(blank=True, null=True)
    image = models.URLField(help_text="Main project image URL")
    gallery_images = models.JSONField(default=list, help_text="Additional project images")
    is_featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    client = models.CharField(max_length=100, blank=True, help_text="Client or company name")
    team_size = models.PositiveIntegerField(default=1)
    my_role = models.CharField(max_length=100, blank=True, help_text="Your role in the project")
    challenges = models.TextField(blank=True, help_text="Technical challenges faced")
    solutions = models.TextField(blank=True, help_text="Solutions implemented")
    lessons_learned = models.TextField(blank=True)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_tech_by_category(self):
        """Get technologies grouped by category"""
        tech_dict = {}
        for tech in self.tech_stack.all():
            category = tech.get_category_display()
            if category not in tech_dict:
                tech_dict[category] = []
            tech_dict[category].append({
                'name': tech.name,
                'icon_class': tech.icon_class,
                'color': tech.color
            })
        return tech_dict

    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])


class ProjectTestimonial(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='testimonials')
    client_name = models.CharField(max_length=100)
    client_position = models.CharField(max_length=100)
    client_company = models.CharField(max_length=100)
    client_avatar = models.URLField(blank=True, null=True)
    testimonial = models.TextField()
    rating = models.PositiveIntegerField(default=5, help_text="Rating out of 5")
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"Testimonial by {self.client_name} for {self.project.title}"
