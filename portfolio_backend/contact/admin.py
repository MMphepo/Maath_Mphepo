from django.contrib import admin
from .models import ContactSubmission, NewsletterSubscription, SocialLink


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'status', 'priority', 'is_recent', 'created_at']
    list_filter = ['status', 'priority', 'created_at', 'replied_at']
    search_fields = ['name', 'email', 'subject', 'message', 'company']
    readonly_fields = ['ip_address', 'user_agent', 'referrer', 'created_at', 'updated_at', 'is_recent', 'response_time_hours']
    actions = ['mark_as_read', 'mark_as_replied', 'set_high_priority']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'company', 'website')
        }),
        ('Message', {
            'fields': ('subject', 'message')
        }),
        ('Project Details', {
            'fields': ('budget_range', 'project_timeline', 'how_found'),
            'classes': ('collapse',)
        }),
        ('Admin Fields', {
            'fields': ('status', 'priority', 'admin_notes', 'replied_at', 'response_time_hours')
        }),
        ('Tracking', {
            'fields': ('ip_address', 'user_agent', 'referrer', 'created_at', 'updated_at', 'is_recent'),
            'classes': ('collapse',)
        }),
    )
    
    def mark_as_read(self, request, queryset):
        count = 0
        for submission in queryset:
            if submission.status == 'new':
                submission.mark_as_read()
                count += 1
        self.message_user(request, f"{count} submissions marked as read.")
    mark_as_read.short_description = "Mark selected submissions as read"
    
    def mark_as_replied(self, request, queryset):
        count = 0
        for submission in queryset:
            submission.mark_as_replied()
            count += 1
        self.message_user(request, f"{count} submissions marked as replied.")
    mark_as_replied.short_description = "Mark selected submissions as replied"
    
    def set_high_priority(self, request, queryset):
        queryset.update(priority='high')
        self.message_user(request, f"{queryset.count()} submissions set to high priority.")
    set_high_priority.short_description = "Set selected submissions to high priority"


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'subscribed_at', 'unsubscribed_at']
    list_filter = ['is_active', 'subscribed_at', 'source']
    search_fields = ['email', 'name']
    readonly_fields = ['subscribed_at', 'unsubscribed_at', 'ip_address']
    actions = ['activate_subscriptions', 'deactivate_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        queryset.update(is_active=True, unsubscribed_at=None)
        self.message_user(request, f"{queryset.count()} subscriptions activated.")
    activate_subscriptions.short_description = "Activate selected subscriptions"
    
    def deactivate_subscriptions(self, request, queryset):
        for subscription in queryset:
            subscription.unsubscribe()
        self.message_user(request, f"{queryset.count()} subscriptions deactivated.")
    deactivate_subscriptions.short_description = "Deactivate selected subscriptions"


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ['platform', 'username', 'url', 'is_active', 'order']
    list_filter = ['platform', 'is_active']
    search_fields = ['platform', 'username', 'url']
    readonly_fields = ['created_at']
