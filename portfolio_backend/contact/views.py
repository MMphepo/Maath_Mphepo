from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings

from .models import ContactSubmission, NewsletterSubscription, SocialLink
from .serializers import (
    ContactSubmissionSerializer, NewsletterSubscriptionSerializer, 
    SocialLinkSerializer
)


@api_view(['POST'])
@csrf_exempt
@ratelimit(key='ip', rate='3/h', method='POST')
def contact_submit(request):
    """Handle contact form submissions"""
    serializer = ContactSubmissionSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        submission = serializer.save()
        
        # Send notification email to admin
        try:
            send_mail(
                subject=f'New Contact Form Submission: {submission.subject}',
                message=f'''
New contact form submission received:

Name: {submission.name}
Email: {submission.email}
Company: {submission.company}
Subject: {submission.subject}

Message:
{submission.message}

Additional Details:
- Phone: {submission.phone}
- Website: {submission.website}
- Budget Range: {submission.budget_range}
- Project Timeline: {submission.project_timeline}
- How they found you: {submission.how_found}

Submitted at: {submission.created_at}
IP Address: {submission.ip_address}
                '''.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.EMAIL_HOST_USER or 'maathmphepo80@gmail.com'],
                fail_silently=True,
            )
        except Exception as e:
            # Log error but don't fail the request
            print(f"Failed to send notification email: {e}")
        
        return Response({
            'success': True,
            'message': 'Thank you for your message! I\'ll get back to you soon.',
            'data': {
                'id': submission.id,
                'name': submission.name,
                'subject': submission.subject,
                'created_at': submission.created_at
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors,
        'message': 'Please check your form data and try again.'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
@ratelimit(key='ip', rate='5/h', method='POST')
def newsletter_subscribe(request):
    """Handle newsletter subscriptions"""
    serializer = NewsletterSubscriptionSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        subscription = serializer.save()
        
        # Send welcome email
        try:
            send_mail(
                subject='Welcome to Maath Mphepo\'s Newsletter!',
                message=f'''
Hi {subscription.name or 'there'}!

Thank you for subscribing to my newsletter. You'll receive updates about:
- New blog posts and tutorials
- Project updates and case studies
- Tech insights and industry trends
- Exclusive content and resources

You can unsubscribe at any time by replying to any newsletter email.

Best regards,
Maath Mphepo
                '''.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[subscription.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        
        return Response({
            'success': True,
            'message': 'Successfully subscribed to the newsletter!',
            'data': {
                'email': subscription.email,
                'subscribed_at': subscription.subscribed_at
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors,
        'message': 'Please provide a valid email address.'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
def newsletter_unsubscribe(request):
    """Handle newsletter unsubscriptions"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'success': False,
            'message': 'Email address is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        subscription = NewsletterSubscription.objects.get(email=email, is_active=True)
        subscription.unsubscribe()
        
        return Response({
            'success': True,
            'message': 'Successfully unsubscribed from the newsletter.'
        })
    except NewsletterSubscription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Email address not found or already unsubscribed.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def social_links(request):
    """Get all active social links"""
    links = SocialLink.objects.filter(is_active=True).order_by('order', 'platform')
    serializer = SocialLinkSerializer(links, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    })


@api_view(['GET'])
def contact_info(request):
    """Get contact information and social links"""
    from core.models import SiteConfiguration
    
    config = SiteConfiguration.get_config()
    social_links = SocialLink.objects.filter(is_active=True).order_by('order', 'platform')
    
    return Response({
        'success': True,
        'data': {
            'email': config.email,
            'phone': config.phone,
            'location': config.location,
            'socialLinks': SocialLinkSerializer(social_links, many=True).data,
            'availability': {
                'status': 'Available for new projects',
                'responseTime': '24-48 hours',
                'timezone': 'UTC+2 (CAT)'
            }
        }
    })
