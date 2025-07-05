from django.urls import path
from . import views

app_name = 'contact'

urlpatterns = [
    path('', views.contact_submit, name='contact-submit'),
    path('info/', views.contact_info, name='contact-info'),
    path('social-links/', views.social_links, name='social-links'),
    path('newsletter/subscribe/', views.newsletter_subscribe, name='newsletter-subscribe'),
    path('newsletter/unsubscribe/', views.newsletter_unsubscribe, name='newsletter-unsubscribe'),
]
