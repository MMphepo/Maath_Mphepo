from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('config/', views.site_config, name='site-config'),
    path('testimonials/', views.testimonials_list, name='testimonials-list'),
    path('achievements/', views.achievements_list, name='achievements-list'),
]
