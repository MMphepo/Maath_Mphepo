from rest_framework import serializers
from .models import ContactSubmission, NewsletterSubscription, SocialLink


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = [
            'name', 'email', 'subject', 'message', 'phone', 'company',
            'website', 'budget_range', 'project_timeline', 'how_found'
        ]
    
    def create(self, validated_data):
        # Add IP address and user agent from request context
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = request.META.get('REMOTE_ADDR', '127.0.0.1')
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            validated_data['referrer'] = request.META.get('HTTP_REFERER', '')
        
        return super().create(validated_data)


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ['email', 'name']
    
    def create(self, validated_data):
        # Add IP address from request context
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = request.META.get('REMOTE_ADDR', '127.0.0.1')
            validated_data['source'] = 'website'
        
        # Check if email already exists
        email = validated_data['email']
        subscription, created = NewsletterSubscription.objects.get_or_create(
            email=email,
            defaults=validated_data
        )
        
        if not created and not subscription.is_active:
            # Reactivate if previously unsubscribed
            subscription.is_active = True
            subscription.unsubscribed_at = None
            subscription.save()
        
        return subscription


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'username', 'icon_class', 'order']
