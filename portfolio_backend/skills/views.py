from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Prefetch

from .models import Skill, SkillCategory, Certification
from .serializers import (
    SkillSerializer, SkillCategorySerializer, CertificationSerializer,
    SkillsByCategorySerializer
)


class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'proficiency', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'proficiency_percentage', 'years_experience', 'created_at']
    ordering = ['category__order', 'order', 'name']
    
    def get_queryset(self):
        return Skill.objects.filter(is_active=True).select_related('category').prefetch_related('endorsements')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Group skills by category
        categories = SkillCategory.objects.filter(is_active=True).prefetch_related(
            Prefetch('skills', queryset=queryset)
        ).order_by('order', 'name')
        
        grouped_skills = []
        for category in categories:
            if category.skills.exists():
                grouped_skills.append({
                    'category': SkillCategorySerializer(category).data,
                    'skills': SkillSerializer(category.skills.all(), many=True).data
                })
        
        # Get current filters
        current_category = request.GET.get('category__slug')
        current_proficiency = request.GET.get('proficiency')
        featured_only = request.GET.get('is_featured')
        search_query = request.GET.get('search', '')
        
        # Get stats
        total_skills = queryset.count()
        featured_skills = queryset.filter(is_featured=True).count()
        expert_skills = queryset.filter(proficiency=5).count()  # Expert level = 5
        
        return Response({
            'success': True,
            'data': {
                'skillsByCategory': grouped_skills,
                'filters': {
                    'availableCategories': SkillCategorySerializer(
                        SkillCategory.objects.filter(is_active=True), many=True
                    ).data,
                    'currentCategory': current_category,
                    'currentProficiency': current_proficiency,
                    'featuredOnly': featured_only == 'true',
                    'searchQuery': search_query,
                },
                'stats': {
                    'total': total_skills,
                    'featured': featured_skills,
                    'expert': expert_skills,
                    'categories': categories.count(),
                }
            }
        })


@api_view(['GET'])
def skill_categories(request):
    """Get all skill categories"""
    categories = SkillCategory.objects.filter(is_active=True).order_by('order', 'name')
    serializer = SkillCategorySerializer(categories, many=True)
    return Response({
        'success': True,
        'data': serializer.data
    })


@api_view(['GET'])
def certifications_list(request):
    """Get all certifications"""
    certifications = Certification.objects.filter(is_active=True).prefetch_related('skills').order_by('-issue_date')
    
    # Filter by featured if requested
    if request.GET.get('featured') == 'true':
        certifications = certifications.filter(is_featured=True)
    
    serializer = CertificationSerializer(certifications, many=True)
    
    return Response({
        'success': True,
        'data': {
            'certifications': serializer.data,
            'stats': {
                'total': certifications.count(),
                'active': certifications.filter(expiry_date__isnull=True).count(),
                'expired': certifications.filter(is_expired=True).count(),
            }
        }
    })


@api_view(['GET'])
def featured_skills(request):
    """Get featured skills for homepage/summary"""
    skills = Skill.objects.filter(is_active=True, is_featured=True).select_related('category').order_by('category__order', 'order')
    
    # Group by category
    grouped = {}
    for skill in skills:
        category_name = skill.category.name
        if category_name not in grouped:
            grouped[category_name] = []
        grouped[category_name].append(SkillSerializer(skill).data)
    
    return Response({
        'success': True,
        'data': grouped
    })
