from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging

from portfolio_backend.utils import get_client_ip, log_api_access, sanitize_input

logger = logging.getLogger('portfolio_backend')


@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST')
def login_view(request):
    """Enhanced admin login endpoint with security features"""
    try:
        # Sanitize input data
        data = sanitize_input(request.data)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'success': False,
                'error': 'Username and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for brute force attempts
        ip = get_client_ip(request)
        failed_attempts_key = f"failed_login_{ip}"
        failed_attempts = cache.get(failed_attempts_key, 0)
        
        if failed_attempts >= 5:
            logger.warning(f"Brute force attempt detected from {ip}")
            return Response({
                'success': False,
                'error': 'Too many failed attempts. Please try again later.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user and user.is_active:
            # Reset failed attempts on successful login
            cache.delete(failed_attempts_key)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Store refresh token in cache for tracking
            cache.set(f"refresh_token_{user.id}", str(refresh), timeout=60*60*24*7)  # 7 days
            
            # Log successful login
            log_api_access(request, 'auth/login', user)
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                'success': True,
                'data': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                        'last_login': user.last_login,
                    },
                    'expires_in': 3600,  # 1 hour
                }
            })
        else:
            # Increment failed attempts
            cache.set(failed_attempts_key, failed_attempts + 1, timeout=60*15)  # 15 minutes
            
            logger.warning(f"Failed login attempt for username '{username}' from {ip}")
            
            return Response({
                'success': False,
                'error': 'Invalid credentials.'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            'success': False,
            'error': 'An error occurred during login.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Enhanced logout endpoint with token blacklisting"""
    try:
        refresh_token = request.data.get('refresh')
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                # Remove from cache
                cache.delete(f"refresh_token_{request.user.id}")
                
                log_api_access(request, 'auth/logout', request.user)
                
                return Response({
                    'success': True,
                    'message': 'Successfully logged out.'
                })
            except TokenError:
                return Response({
                    'success': False,
                    'error': 'Invalid refresh token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'success': True,
                'message': 'Logged out (no refresh token provided).'
            })
            
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({
            'success': False,
            'error': 'An error occurred during logout.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST')
def refresh_token_view(request):
    """Refresh access token using refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'success': False,
                'error': 'Refresh token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validate refresh token
            refresh = RefreshToken(refresh_token)
            user_id = refresh.payload.get('user_id')
            
            # Check if token is still valid in cache
            cached_token = cache.get(f"refresh_token_{user_id}")
            if cached_token != refresh_token:
                return Response({
                    'success': False,
                    'error': 'Invalid or expired refresh token.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate new access token
            new_access_token = refresh.access_token
            
            return Response({
                'success': True,
                'data': {
                    'access': str(new_access_token),
                    'expires_in': 3600,  # 1 hour
                }
            })
            
        except TokenError as e:
            return Response({
                'success': False,
                'error': 'Invalid or expired refresh token.'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return Response({
            'success': False,
            'error': 'An error occurred during token refresh.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    """Verify if current token is valid"""
    try:
        return Response({
            'success': True,
            'data': {
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'is_staff': request.user.is_staff,
                    'is_superuser': request.user.is_superuser,
                },
                'token_valid': True,
            }
        })
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return Response({
            'success': False,
            'error': 'Token verification failed.'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password with security checks"""
    try:
        data = sanitize_input(request.data)
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        if not all([current_password, new_password, confirm_password]):
            return Response({
                'success': False,
                'error': 'All password fields are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                'success': False,
                'error': 'New passwords do not match.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not request.user.check_password(current_password):
            return Response({
                'success': False,
                'error': 'Current password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        # Invalidate all existing tokens
        cache.delete(f"refresh_token_{request.user.id}")
        
        log_api_access(request, 'auth/change-password', request.user)
        
        return Response({
            'success': True,
            'message': 'Password changed successfully. Please log in again.'
        })
        
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return Response({
            'success': False,
            'error': 'An error occurred while changing password.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
