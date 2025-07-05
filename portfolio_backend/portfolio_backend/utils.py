from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.conf import settings
import hashlib
import time
from functools import wraps


def ratelimit_exceeded(request, exception):
    """Custom rate limit exceeded response"""
    return JsonResponse({
        'success': False,
        'error': 'Rate limit exceeded. Please try again later.',
        'retry_after': getattr(exception, 'retry_after', 60)
    }, status=429)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def generate_api_key(user_id, timestamp=None):
    """Generate API key for user"""
    if timestamp is None:
        timestamp = int(time.time())
    
    data = f"{user_id}:{timestamp}:{settings.SECRET_KEY}"
    return hashlib.sha256(data.encode()).hexdigest()


def validate_api_key(api_key, user_id):
    """Validate API key for user"""
    # Simple validation - in production, use more sophisticated method
    try:
        # Check if key exists in cache
        cached_key = cache.get(f"api_key_{user_id}")
        return cached_key == api_key
    except:
        return False


def cache_response(timeout=300):
    """Decorator to cache API responses"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key based on request
            cache_key = f"api_response_{request.path}_{hash(str(request.GET))}"
            
            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response:
                return cached_response
            
            # Get fresh response
            response = view_func(request, *args, **kwargs)
            
            # Cache successful responses
            if hasattr(response, 'status_code') and response.status_code == 200:
                cache.set(cache_key, response, timeout)
            
            return response
        return wrapper
    return decorator


def log_api_access(request, endpoint, user=None):
    """Log API access for monitoring"""
    from django.utils import timezone
    import logging
    
    logger = logging.getLogger('portfolio_backend')
    
    log_data = {
        'timestamp': timezone.now().isoformat(),
        'endpoint': endpoint,
        'method': request.method,
        'ip': get_client_ip(request),
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        'user': user.username if user else 'anonymous',
    }
    
    logger.info(f"API Access: {log_data}")


def sanitize_input(data):
    """Basic input sanitization"""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', 'javascript:', 'data:']
        for char in dangerous_chars:
            data = data.replace(char, '')
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    
    return data


def require_https(view_func):
    """Decorator to require HTTPS in production"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not settings.DEBUG and not request.is_secure():
            return JsonResponse({
                'success': False,
                'error': 'HTTPS required'
            }, status=400)
        return view_func(request, *args, **kwargs)
    return wrapper


class SecurityMiddleware:
    """Custom security middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log suspicious activity
        self.check_suspicious_activity(request)
        
        response = self.get_response(request)
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'same-origin'
        
        return response
    
    def check_suspicious_activity(self, request):
        """Check for suspicious activity patterns"""
        ip = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Check for common attack patterns
        suspicious_patterns = [
            'sqlmap', 'nikto', 'nmap', 'masscan',
            'python-requests', 'curl', 'wget'
        ]
        
        if any(pattern in user_agent.lower() for pattern in suspicious_patterns):
            # Log suspicious activity
            import logging
            logger = logging.getLogger('portfolio_backend')
            logger.warning(f"Suspicious user agent from {ip}: {user_agent}")


def validate_json_schema(schema):
    """Decorator to validate JSON request data against schema"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if request.content_type == 'application/json':
                try:
                    import json
                    data = json.loads(request.body)
                    
                    # Basic schema validation
                    for field, field_type in schema.items():
                        if field in data:
                            if not isinstance(data[field], field_type):
                                return JsonResponse({
                                    'success': False,
                                    'error': f'Field {field} must be of type {field_type.__name__}'
                                }, status=400)
                    
                except json.JSONDecodeError:
                    return JsonResponse({
                        'success': False,
                        'error': 'Invalid JSON data'
                    }, status=400)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
