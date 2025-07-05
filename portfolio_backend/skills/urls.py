from django.urls import path
from . import views

app_name = 'skills'

urlpatterns = [
    path('', views.SkillListView.as_view(), name='skill-list'),
    path('categories/', views.skill_categories, name='skill-categories'),
    path('certifications/', views.certifications_list, name='certifications-list'),
    path('featured/', views.featured_skills, name='featured-skills'),
]
