from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('', views.ProjectListView.as_view(), name='project-list'),
    path('tech-stack/', views.tech_stack_list, name='tech-stack-list'),
    path('<slug:slug>/', views.ProjectDetailView.as_view(), name='project-detail'),
]
