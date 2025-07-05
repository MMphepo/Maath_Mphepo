from rest_framework import serializers
from .models import TechStack, Project, ProjectTestimonial


class TechStackSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechStack
        fields = ['id', 'name', 'category', 'icon_class', 'color']


class ProjectTestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTestimonial
        fields = [
            'id', 'client_name', 'client_position', 'client_company', 
            'client_avatar', 'testimonial', 'rating', 'created_at'
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    tech_stack = TechStackSerializer(many=True, read_only=True)
    tech_by_category = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'features', 'tech_stack',
            'tech_by_category', 'github_link', 'live_link', 'image', 
            'is_featured', 'status', 'views', 'likes', 'created_at'
        ]
    
    def get_tech_by_category(self, obj):
        return obj.get_tech_by_category()


class ProjectDetailSerializer(ProjectListSerializer):
    testimonials = serializers.SerializerMethodField()
    
    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + [
            'detailed_description', 'gallery_images', 'start_date', 'end_date',
            'client', 'team_size', 'my_role', 'challenges', 'solutions',
            'lessons_learned', 'testimonials', 'updated_at'
        ]
    
    def get_testimonials(self, obj):
        testimonials = obj.testimonials.filter(is_featured=True)[:3]
        return ProjectTestimonialSerializer(testimonials, many=True).data
