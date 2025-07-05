from django.contrib import admin
from .models import Tag, BlogPost, Comment, BlogReaction


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'usage_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['usage_count', 'created_at']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_published', 'views', 'likes', 'read_time', 'created_at']
    list_filter = ['is_published', 'created_at', 'updated_at', 'tags']
    search_fields = ['title', 'description', 'content']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    readonly_fields = ['views', 'likes', 'read_time', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'is_published')
        }),
        ('Content', {
            'fields': ('content', 'banner_image', 'tags')
        }),
        ('Author Information', {
            'fields': ('author_name', 'author_bio', 'author_avatar')
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'read_time', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'blog_post', 'is_approved', 'parent', 'created_at']
    list_filter = ['is_approved', 'created_at', 'blog_post']
    search_fields = ['name', 'email', 'content']
    readonly_fields = ['created_at']
    actions = ['approve_comments', 'disapprove_comments']
    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} comments approved.")
    approve_comments.short_description = "Approve selected comments"
    
    def disapprove_comments(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f"{queryset.count()} comments disapproved.")
    disapprove_comments.short_description = "Disapprove selected comments"


@admin.register(BlogReaction)
class BlogReactionAdmin(admin.ModelAdmin):
    list_display = ['blog_post', 'reaction_type', 'ip_address', 'created_at']
    list_filter = ['reaction_type', 'created_at', 'blog_post']
    search_fields = ['blog_post__title', 'ip_address']
    readonly_fields = ['created_at']
