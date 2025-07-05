from django.contrib import admin
from .models import SkillCategory, Skill, SkillEndorsement, Certification


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'proficiency', 'proficiency_percentage', 'years_experience', 'is_featured', 'is_active']
    list_filter = ['category', 'proficiency', 'is_featured', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'icon_class', 'description')
        }),
        ('Proficiency', {
            'fields': ('proficiency', 'proficiency_percentage', 'years_experience')
        }),
        ('Display Options', {
            'fields': ('is_featured', 'is_active', 'order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SkillEndorsement)
class SkillEndorsementAdmin(admin.ModelAdmin):
    list_display = ['endorser_name', 'skill', 'endorser_company', 'is_featured', 'created_at']
    list_filter = ['is_featured', 'created_at', 'skill__category']
    search_fields = ['endorser_name', 'endorser_company', 'endorsement_text']
    readonly_fields = ['created_at']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuing_organization', 'issue_date', 'is_expired', 'is_featured', 'is_active']
    list_filter = ['issuing_organization', 'is_featured', 'is_active', 'issue_date']
    search_fields = ['name', 'issuing_organization', 'description']
    filter_horizontal = ['skills']
    readonly_fields = ['is_expired', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'issuing_organization', 'description')
        }),
        ('Dates', {
            'fields': ('issue_date', 'expiry_date', 'is_expired')
        }),
        ('Credentials', {
            'fields': ('credential_id', 'credential_url', 'badge_image')
        }),
        ('Related Skills', {
            'fields': ('skills',)
        }),
        ('Display Options', {
            'fields': ('is_featured', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
