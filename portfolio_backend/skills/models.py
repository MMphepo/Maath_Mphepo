from django.db import models


class SkillCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon_class = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=7, default="#10B981")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = "Skill Categories"

    def __str__(self):
        return self.name


class Skill(models.Model):
    PROFICIENCY_CHOICES = [
        (1, 'Beginner'),
        (2, 'Basic'),
        (3, 'Intermediate'),
        (4, 'Advanced'),
        (5, 'Expert'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    icon_class = models.CharField(max_length=100, help_text="CSS class for icon")
    proficiency = models.IntegerField(choices=PROFICIENCY_CHOICES, default=3)
    proficiency_percentage = models.IntegerField(default=80, help_text="Proficiency as percentage (1-100)")
    description = models.TextField(blank=True)
    years_experience = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category__order', 'order', '-proficiency_percentage', 'name']
        unique_together = ['name', 'category']

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def get_proficiency_display_custom(self):
        """Get proficiency as percentage with level"""
        level = self.get_proficiency_display()
        return f"{self.proficiency_percentage}% ({level})"


class SkillEndorsement(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='endorsements')
    endorser_name = models.CharField(max_length=100)
    endorser_position = models.CharField(max_length=100)
    endorser_company = models.CharField(max_length=100)
    endorser_avatar = models.URLField(blank=True, null=True)
    endorsement_text = models.TextField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"Endorsement for {self.skill.name} by {self.endorser_name}"


class Certification(models.Model):
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True, null=True)
    badge_image = models.URLField(blank=True, null=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name='certifications')
    description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-issue_date']

    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"

    @property
    def is_expired(self):
        """Check if certification is expired"""
        if self.expiry_date:
            from django.utils import timezone
            return timezone.now().date() > self.expiry_date
        return False
