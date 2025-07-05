from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.BlogPostListView.as_view(), name='blog-list'),
    path('tags/', views.blog_tags, name='blog-tags'),
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-detail'),
    path('<slug:slug>/like/', views.blog_like_toggle, name='blog-like'),
    path('<slug:slug>/comments/', views.blog_comments, name='blog-comments'),
]
