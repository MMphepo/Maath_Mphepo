from rest_framework import serializers
from .models import SiteConfiguration, Testimonial, Achievement


class SiteConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfiguration
        fields = [
            'site_name', 'site_description', 'site_keywords', 'site_author',
            'email', 'phone', 'location', 'github_url', 'linkedin_url', 'twitter_url',
            'blog_enabled', 'projects_enabled', 'contact_form_enabled', 'newsletter_enabled',
            'maintenance_mode', 'maintenance_message'
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            'id', 'name', 'position', 'company', 'avatar', 'testimonial',
            'rating', 'is_featured', 'created_at'
        ]


class AchievementSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'title', 'category', 'category_display', 'description',
            'date_achieved', 'issuing_organization', 'certificate_url',
            'badge_image', 'is_featured', 'created_at'
        ]
