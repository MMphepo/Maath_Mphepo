from django.urls import path
from . import views, admin_views

app_name = 'blog'

urlpatterns = [
    # Public blog URLs
    path('', views.BlogPostListView.as_view(), name='blog-list'),
    path('tags/', views.blog_tags, name='blog-tags'),
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-detail'),
    path('<slug:slug>/like/', views.blog_like_toggle, name='blog-like'),
    path('<slug:slug>/comments/', views.blog_comments, name='blog-comments'),

    # Admin preview URLs
    path('admin/preview/<int:post_id>/', admin_views.blog_preview, name='blog_preview'),
    path('admin/preview-json/<int:post_id>/', admin_views.blog_preview_json, name='blog_preview_json'),
    path('admin/content-preview/', admin_views.blog_content_preview, name='blog_content_preview'),
    path('admin/analytics/<int:post_id>/', admin_views.blog_analytics_preview, name='blog_analytics_preview'),
    path('admin/bulk-preview/', admin_views.bulk_action_preview, name='bulk_action_preview'),
    path('admin/export/', admin_views.export_blog_data, name='export_blog_data'),
]
