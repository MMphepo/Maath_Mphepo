from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit

from .models import SiteConfiguration, Testimonial, Achievement
from .serializers import TestimonialSerializer, AchievementSerializer


@api_view(['POST'])
@csrf_exempt
@ratelimit(key='ip', rate='5/m', method='POST')
def login_view(request):
    """Admin login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'success': False,
            'error': 'Username and password are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user and user.is_active:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }
            }
        })
    
    return Response({
        'success': False,
        'error': 'Invalid credentials.'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Admin logout endpoint"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Successfully logged out.'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Invalid token.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def site_config(request):
    """Get site configuration"""
    config = SiteConfiguration.get_config()
    
    return Response({
        'success': True,
        'data': {
            'siteName': config.site_name,
            'siteDescription': config.site_description,
            'siteKeywords': config.site_keywords,
            'siteAuthor': config.site_author,
            'email': config.email,
            'phone': config.phone,
            'location': config.location,
            'socialMedia': {
                'github': config.github_url,
                'linkedin': config.linkedin_url,
                'twitter': config.twitter_url,
            },
            'features': {
                'blogEnabled': config.blog_enabled,
                'projectsEnabled': config.projects_enabled,
                'contactFormEnabled': config.contact_form_enabled,
                'newsletterEnabled': config.newsletter_enabled,
            },
            'maintenance': {
                'maintenanceMode': config.maintenance_mode,
                'maintenanceMessage': config.maintenance_message,
            }
        }
    })


@api_view(['GET'])
def testimonials_list(request):
    """Get testimonials"""
    testimonials = Testimonial.objects.filter(is_active=True)
    
    # Filter by featured if requested
    if request.GET.get('featured') == 'true':
        testimonials = testimonials.filter(is_featured=True)
    
    testimonials = testimonials.order_by('-is_featured', '-created_at')
    serializer = TestimonialSerializer(testimonials, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    })


@api_view(['GET'])
def achievements_list(request):
    """Get achievements"""
    achievements = Achievement.objects.filter(is_active=True)
    
    # Filter by category if requested
    category = request.GET.get('category')
    if category:
        achievements = achievements.filter(category=category)
    
    # Filter by featured if requested
    if request.GET.get('featured') == 'true':
        achievements = achievements.filter(is_featured=True)
    
    achievements = achievements.order_by('-is_featured', '-date_achieved')
    serializer = AchievementSerializer(achievements, many=True)
    
    return Response({
        'success': True,
        'data': {
            'achievements': serializer.data,
            'categories': Achievement.CATEGORY_CHOICES,
        }
    })
