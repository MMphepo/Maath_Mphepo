from django.contrib import admin
from .models import TechStack, Project, ProjectTestimonial


@admin.register(TechStack)
class TechStackAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'icon_class', 'color', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'status', 'is_featured', 'views', 'likes', 'created_at']
    list_filter = ['status', 'is_featured', 'created_at', 'tech_stack']
    search_fields = ['title', 'description', 'client']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tech_stack']
    readonly_fields = ['views', 'likes', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'detailed_description', 'status', 'is_featured')
        }),
        ('Media', {
            'fields': ('image', 'gallery_images')
        }),
        ('Technical Details', {
            'fields': ('features', 'tech_stack', 'challenges', 'solutions', 'lessons_learned')
        }),
        ('Links', {
            'fields': ('github_link', 'live_link')
        }),
        ('Project Details', {
            'fields': ('client', 'team_size', 'my_role', 'start_date', 'end_date')
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProjectTestimonial)
class ProjectTestimonialAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'project', 'rating', 'is_featured', 'created_at']
    list_filter = ['rating', 'is_featured', 'created_at', 'project']
    search_fields = ['client_name', 'client_company', 'testimonial']
    readonly_fields = ['created_at']
