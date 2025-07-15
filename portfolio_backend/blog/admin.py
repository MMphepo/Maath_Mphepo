from django.contrib import admin
from django.utils.html import format_html, strip_tags
from .models import Tag, BlogPost, Comment, BlogReaction


class TagInline(admin.TabularInline):
    model = BlogPost.tags.through
    extra = 1
    verbose_name = "Tag"
    verbose_name_plural = "Tags"


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'usage_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['usage_count', 'created_at']
    ordering = ['-usage_count', 'name']

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('blogpost_set')


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = [
        'title_with_status', 'slug', 'status_badge', 'featured_badge',
        'is_published', 'is_featured', 'views', 'likes', 'read_time', 'published_at', 'updated_at'
    ]
    list_filter = [
        'is_published', 'is_featured', 'created_at', 'updated_at',
        'published_at', 'tags'
    ]
    search_fields = ['title', 'description', 'content', 'meta_description', 'meta_keywords']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    readonly_fields = [
        'views', 'likes', 'read_time', 'created_at', 'updated_at',
        'word_count', 'content_preview', 'banner_preview'
    ]
    list_editable = ['is_published', 'is_featured']
    list_per_page = 20
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    actions = ['make_published', 'make_unpublished', 'make_featured', 'make_unfeatured']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description'),
            'description': 'Essential blog post information'
        }),
        ('Content', {
            'fields': ('content', 'word_count', 'content_preview'),
            'description': 'Main blog content with rich text editor'
        }),
        ('Media', {
            'fields': ('banner_image', 'banner_preview', 'banner_image_alt'),
            'classes': ('collapse',),
            'description': 'Featured image and media content'
        }),
        ('SEO & Meta', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',),
            'description': 'Search engine optimization fields'
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_featured', 'published_at', 'tags'),
            'description': 'Publication status and categorization'
        }),
        ('Author Information', {
            'fields': ('author_name', 'author_bio', 'author_avatar'),
            'classes': ('collapse',),
            'description': 'Author details'
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'read_time', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Analytics and timestamps'
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('tags')

    def title_with_status(self, obj):
        """Display title with publication status icon"""
        icon = "✅" if obj.is_published else "📝"
        featured = "⭐" if obj.is_featured else ""
        return format_html(
            '{} {} <strong>{}</strong>',
            icon, featured, obj.title
        )
    title_with_status.short_description = 'Title'
    title_with_status.admin_order_field = 'title'

    def status_badge(self, obj):
        """Display publication status as colored badge"""
        if obj.is_published:
            color = '#28a745'
            text = 'Published'
        else:
            color = '#6c757d'
            text = 'Draft'

        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color, text
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_published'

    def featured_badge(self, obj):
        """Display featured status"""
        if obj.is_featured:
            return format_html(
                '<span style="background-color: #ffc107; color: #212529; padding: 3px 8px; '
                'border-radius: 3px; font-size: 11px; font-weight: bold;">Featured</span>'
            )
        return '-'
    featured_badge.short_description = 'Featured'
    featured_badge.admin_order_field = 'is_featured'

    def word_count(self, obj):
        """Display word count of content"""
        if obj.content:
            clean_content = strip_tags(obj.content)
            count = len(clean_content.split())
            return f"{count:,} words"
        return "0 words"
    word_count.short_description = 'Word Count'

    def content_preview(self, obj):
        """Display content preview"""
        if obj.content:
            clean_content = strip_tags(obj.content)
            preview = clean_content[:200] + "..." if len(clean_content) > 200 else clean_content
            return format_html(
                '<div style="max-width: 400px; padding: 10px; background: #f8f9fa; '
                'border-left: 3px solid #007cba; font-size: 12px;">{}</div>',
                preview
            )
        return "No content"
    content_preview.short_description = 'Content Preview'

    def banner_preview(self, obj):
        """Display banner image preview"""
        if obj.banner_image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 100px; '
                'object-fit: cover; border-radius: 4px;" />',
                obj.banner_image.url
            )
        return "No image"
    banner_preview.short_description = 'Banner Preview'

    # Bulk Actions
    def make_published(self, request, queryset):
        """Bulk action to publish posts"""
        updated = queryset.update(is_published=True)
        self.message_user(request, f'{updated} posts were successfully published.')
    make_published.short_description = "Mark selected posts as published"

    def make_unpublished(self, request, queryset):
        """Bulk action to unpublish posts"""
        updated = queryset.update(is_published=False)
        self.message_user(request, f'{updated} posts were successfully unpublished.')
    make_unpublished.short_description = "Mark selected posts as unpublished"

    def make_featured(self, request, queryset):
        """Bulk action to feature posts"""
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} posts were successfully featured.')
    make_featured.short_description = "Mark selected posts as featured"

    def make_unfeatured(self, request, queryset):
        """Bulk action to unfeature posts"""
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} posts were successfully unfeatured.')
    make_unfeatured.short_description = "Mark selected posts as unfeatured"

    def get_urls(self):
        """Add custom admin URLs"""
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:object_id>/preview/',
                self.admin_site.admin_view(self.preview_view),
                name='blog_blogpost_preview'
            ),
        ]
        return custom_urls + urls

    def preview_view(self, request, object_id):
        """Admin preview view"""
        from django.shortcuts import redirect
        return redirect('blog:blog_preview', post_id=object_id)

    def get_readonly_fields(self, request, obj=None):
        """Add preview link to readonly fields for existing objects"""
        readonly = list(super().get_readonly_fields(request, obj))
        if obj and obj.pk:
            readonly.append('preview_link')
        return readonly

    def preview_link(self, obj):
        """Display preview link"""
        if obj.pk:
            preview_url = f"/api/blog/admin/preview/{obj.pk}/"
            return format_html(
                '<a href="{}" target="_blank" class="btn-preview" '
                'style="background: #17a2b8; color: white; padding: 8px 16px; '
                'text-decoration: none; border-radius: 4px; display: inline-block;">'
                'Preview Post</a>',
                preview_url
            )
        return "Save post to enable preview"
    preview_link.short_description = 'Preview'

    class Media:
        css = {
            'all': ('admin/css/blog_admin.css',)
        }
        js = ('admin/js/blog_admin.js',)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ['created_at']
    fields = ['name', 'email', 'content', 'is_approved', 'created_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        'comment_preview', 'name', 'blog_post', 'approval_status',
        'is_approved', 'parent', 'created_at'
    ]
    list_filter = ['is_approved', 'created_at', 'blog_post']
    search_fields = ['name', 'email', 'content', 'blog_post__title']
    readonly_fields = ['created_at']
    actions = ['approve_comments', 'disapprove_comments']
    list_editable = ['is_approved']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    def comment_preview(self, obj):
        """Display comment content preview"""
        preview = obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
        return format_html(
            '<div style="max-width: 300px; font-size: 12px;">{}</div>',
            preview
        )
    comment_preview.short_description = 'Comment'

    def approval_status(self, obj):
        """Display approval status with colored badge"""
        if obj.is_approved:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 2px 6px; '
                'border-radius: 3px; font-size: 10px;">Approved</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 2px 6px; '
                'border-radius: 3px; font-size: 10px;">Pending</span>'
            )
    approval_status.short_description = 'Status'
    approval_status.admin_order_field = 'is_approved'

    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f"{updated} comments approved.")
    approve_comments.short_description = "Approve selected comments"

    def disapprove_comments(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f"{updated} comments disapproved.")
    disapprove_comments.short_description = "Disapprove selected comments"


@admin.register(BlogReaction)
class BlogReactionAdmin(admin.ModelAdmin):
    list_display = ['blog_post', 'reaction_badge', 'ip_address', 'created_at']
    list_filter = ['reaction_type', 'created_at', 'blog_post']
    search_fields = ['blog_post__title', 'ip_address']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    def reaction_badge(self, obj):
        """Display reaction type with emoji"""
        emoji_map = {
            'like': '👍',
            'love': '❤️',
            'laugh': '😂',
            'wow': '😮',
            'sad': '😢',
            'angry': '😠'
        }
        emoji = emoji_map.get(obj.reaction_type, '👍')
        return format_html(
            '{} {}',
            emoji, obj.reaction_type.title()
        )
    reaction_badge.short_description = 'Reaction'
    reaction_badge.admin_order_field = 'reaction_type'
