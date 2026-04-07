#!/usr/bin/env python
"""Export portfolio data from Django to JSON files for frontend hardcoding"""

import os
import sys
import django
import json
from django.conf import settings

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'portfolio_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_backend.settings')
django.setup()

from projects.models import Project, TechStack
from projects.serializers import ProjectListSerializer
from skills.models import Skill, SkillCategory
from skills.serializers import SkillSerializer, SkillCategorySerializer
from core.models import Testimonial
from core.serializers import TestimonialSerializer


def export_projects():
    """Export featured projects for frontend"""
    projects = Project.objects.filter(is_featured=True).prefetch_related('tech_stack')
    serializer = ProjectListSerializer(projects, many=True)
    return serializer.data


def export_skills():
    """Export skills grouped by category"""
    categories = SkillCategory.objects.filter(is_active=True).prefetch_related('skills').order_by('order', 'name')
    
    grouped = []
    for category in categories:
        skills = Skill.objects.filter(category=category, is_active=True).order_by('order')
        grouped.append({
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'icon_class': category.icon_class,
            'color': category.color,
            'skills': SkillSerializer(skills, many=True).data
        })
    
    return grouped


def export_testimonials():
    """Export testimonials"""
    testimonials = Testimonial.objects.filter(is_active=True).order_by('-created_at')
    serializer = TestimonialSerializer(testimonials, many=True)
    return serializer.data


if __name__ == '__main__':
    try:
        print("Exporting projects...")
        projects_data = export_projects()
        
        print("Exporting skills...")
        skills_data = export_skills()
        
        print("Exporting testimonials...")
        testimonials_data = export_testimonials()
        
        # Save to JSON files
        output_dir = os.path.join(os.path.dirname(__file__), 'src', 'data')
        os.makedirs(output_dir, exist_ok=True)
        
        # Projects
        with open(os.path.join(output_dir, 'projects.json'), 'w') as f:
            json.dump({'success': True, 'data': {'projects': projects_data}}, f, indent=2, default=str)
        print(f"✓ Exported {len(projects_data)} projects")
        
        # Skills
        with open(os.path.join(output_dir, 'skills.json'), 'w') as f:
            json.dump({'success': True, 'data': {'skillsByCategory': skills_data}}, f, indent=2, default=str)
        print(f"✓ Exported skills from {len(skills_data)} categories")
        
        # Testimonials
        with open(os.path.join(output_dir, 'testimonials.json'), 'w') as f:
            json.dump({'success': True, 'data': testimonials_data}, f, indent=2, default=str)
        print(f"✓ Exported {len(testimonials_data)} testimonials")
        
        print("\n✓ All data exported successfully!")
        
    except Exception as e:
        print(f"✗ Error exporting data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
