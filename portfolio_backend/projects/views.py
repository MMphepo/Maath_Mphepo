from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Project, TechStack
from .serializers import ProjectListSerializer, ProjectDetailSerializer, TechStackSerializer


class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'tech_stack__category', 'is_featured']
    search_fields = ['title', 'description', 'client']
    ordering_fields = ['created_at', 'views', 'likes']
    ordering = ['-is_featured', '-created_at']
    
    def get_queryset(self):
        return Project.objects.prefetch_related('tech_stack', 'testimonials')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Get available tech categories
        tech_categories = TechStack.objects.values_list('category', flat=True).distinct()
        
        # Get current filters
        current_status = request.GET.get('status')
        current_category = request.GET.get('tech_stack__category')
        featured_only = request.GET.get('is_featured')
        search_query = request.GET.get('search', '')
        
        return Response({
            'success': True,
            'data': {
                'projects': serializer.data,
                'filters': {
                    'availableCategories': list(tech_categories),
                    'currentStatus': current_status,
                    'currentCategory': current_category,
                    'featuredOnly': featured_only == 'true',
                    'searchQuery': search_query,
                },
                'stats': {
                    'total': queryset.count(),
                    'featured': queryset.filter(is_featured=True).count(),
                    'completed': queryset.filter(status='completed').count(),
                }
            }
        })


class ProjectDetailView(generics.RetrieveAPIView):
    serializer_class = ProjectDetailSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Project.objects.prefetch_related('tech_stack', 'testimonials')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


@api_view(['GET'])
def tech_stack_list(request):
    """Get all tech stack items grouped by category"""
    tech_stacks = TechStack.objects.all().order_by('category', 'name')
    
    # Group by category
    grouped_tech = {}
    for tech in tech_stacks:
        category = tech.get_category_display()
        if category not in grouped_tech:
            grouped_tech[category] = []
        grouped_tech[category].append(TechStackSerializer(tech).data)
    
    return Response({
        'success': True,
        'data': grouped_tech
    })
