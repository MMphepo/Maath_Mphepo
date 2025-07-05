"""
URL configuration for portfolio_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.authentication import login_view, logout_view, refresh_token_view, verify_token_view, change_password_view

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # API Authentication
    path("api/auth/login/", login_view, name='api-login'),
    path("api/auth/logout/", logout_view, name='api-logout'),
    path("api/auth/refresh/", refresh_token_view, name='api-refresh'),
    path("api/auth/verify/", verify_token_view, name='api-verify'),
    path("api/auth/change-password/", change_password_view, name='api-change-password'),

    # API Routes - matching Next.js API structure
    path("api/blog/", include('blog.urls')),
    path("api/projects/", include('projects.urls')),
    path("api/skills/", include('skills.urls')),
    path("api/contact/", include('contact.urls')),
    path("api/", include('core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
