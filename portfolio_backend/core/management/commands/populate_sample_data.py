from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import json

from blog.models import Tag, BlogPost, Comment
from projects.models import TechStack, Project, ProjectTestimonial
from skills.models import SkillCategory, Skill, SkillEndorsement, Certification
from contact.models import SocialLink
from core.models import SiteConfiguration, Testimonial, Achievement


class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create site configuration
        self.create_site_config()
        
        # Create blog data
        self.create_blog_data()
        
        # Create projects data
        self.create_projects_data()
        
        # Create skills data
        self.create_skills_data()
        
        # Create contact data
        self.create_contact_data()
        
        # Create core data
        self.create_core_data()
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))

    def create_site_config(self):
        config, created = SiteConfiguration.objects.get_or_create(
            pk=1,
            defaults={
                'site_name': 'Maath Mphepo Portfolio',
                'site_description': 'Backend Developer & Software Engineer',
                'site_author': 'Maath Mphepo',
                'email': 'maath@example.com',
                'phone': '+1234567890',
                'location': 'Remote',
                'github_url': 'https://github.com/maathmphepo',
                'linkedin_url': 'https://linkedin.com/in/maathmphepo',
                'twitter_url': 'https://twitter.com/maathmphepo',
            }
        )
        if created:
            self.stdout.write('✓ Site configuration created')

    def create_blog_data(self):
        # Create tags
        tags_data = [
            {'name': 'Django', 'slug': 'django'},
            {'name': 'Python', 'slug': 'python'},
            {'name': 'React', 'slug': 'react'},
            {'name': 'JavaScript', 'slug': 'javascript'},
            {'name': 'Web Development', 'slug': 'web-development'},
            {'name': 'Backend', 'slug': 'backend'},
            {'name': 'API', 'slug': 'api'},
            {'name': 'Database', 'slug': 'database'},
        ]
        
        for tag_data in tags_data:
            tag, created = Tag.objects.get_or_create(
                slug=tag_data['slug'],
                defaults={'name': tag_data['name'], 'usage_count': 1}
            )
        
        # Create blog posts
        django_tag = Tag.objects.get(slug='django')
        python_tag = Tag.objects.get(slug='python')
        react_tag = Tag.objects.get(slug='react')
        
        posts_data = [
            {
                'title': 'Building Scalable Django REST APIs',
                'slug': 'building-scalable-django-rest-apis',
                'description': 'Learn how to build robust and scalable REST APIs using Django REST Framework.',
                'content': '''# Building Scalable Django REST APIs

Django REST Framework (DRF) is a powerful toolkit for building Web APIs in Django. In this comprehensive guide, we'll explore best practices for creating scalable and maintainable REST APIs.

## Key Concepts

### 1. Serializers
Serializers in DRF handle the conversion between complex data types and Python datatypes that can be easily rendered into JSON, XML, or other content types.

### 2. ViewSets
ViewSets provide a way to group related views together, making your API more organized and easier to maintain.

### 3. Authentication & Permissions
Proper authentication and permission handling is crucial for API security.

## Best Practices

1. **Use proper HTTP status codes**
2. **Implement pagination for list endpoints**
3. **Add proper error handling**
4. **Use filtering and searching**
5. **Implement rate limiting**

This approach ensures your APIs are production-ready and can handle real-world traffic.''',
                'tags': [django_tag, python_tag],
                'author_name': 'Maath Mphepo',
                'author_bio': 'Backend Developer specializing in Django and Python',
                'author_avatar': 'https://via.placeholder.com/150',
                'banner_image': 'https://via.placeholder.com/800x400',
                'is_published': True,
                'views': 245,
                'likes': 18,
            },
            {
                'title': 'React State Management Best Practices',
                'slug': 'react-state-management-best-practices',
                'description': 'Explore different approaches to managing state in React applications.',
                'content': '''# React State Management Best Practices

State management is one of the most important aspects of React development. Let's explore different approaches and when to use them.

## Local State vs Global State

### When to use Local State
- Component-specific data
- Form inputs
- UI state (modals, dropdowns)

### When to use Global State
- User authentication data
- Application-wide settings
- Shared data between components

## Popular State Management Solutions

1. **useState & useReducer** - Built-in React hooks
2. **Context API** - For avoiding prop drilling
3. **Redux Toolkit** - For complex applications
4. **Zustand** - Lightweight alternative
5. **React Query** - For server state

Choose the right tool for your specific use case!''',
                'tags': [react_tag],
                'author_name': 'Maath Mphepo',
                'author_bio': 'Full-stack Developer with expertise in React and Node.js',
                'author_avatar': 'https://via.placeholder.com/150',
                'banner_image': 'https://via.placeholder.com/800x400',
                'is_published': True,
                'views': 189,
                'likes': 23,
            }
        ]
        
        for post_data in posts_data:
            tags = post_data.pop('tags')
            post, created = BlogPost.objects.get_or_create(
                slug=post_data['slug'],
                defaults=post_data
            )
            if created:
                post.tags.set(tags)
                self.stdout.write(f'✓ Blog post created: {post.title}')

    def create_projects_data(self):
        # Create tech stack
        tech_data = [
            {'name': 'Django', 'category': 'backend', 'icon_class': 'fab fa-python', 'color': '#092E20'},
            {'name': 'React', 'category': 'frontend', 'icon_class': 'fab fa-react', 'color': '#61DAFB'},
            {'name': 'PostgreSQL', 'category': 'database', 'icon_class': 'fas fa-database', 'color': '#336791'},
            {'name': 'Docker', 'category': 'devops', 'icon_class': 'fab fa-docker', 'color': '#2496ED'},
            {'name': 'AWS', 'category': 'cloud', 'icon_class': 'fab fa-aws', 'color': '#FF9900'},
        ]
        
        for tech in tech_data:
            TechStack.objects.get_or_create(name=tech['name'], defaults=tech)
        
        # Create projects
        django_tech = TechStack.objects.get(name='Django')
        react_tech = TechStack.objects.get(name='React')
        postgres_tech = TechStack.objects.get(name='PostgreSQL')
        
        project_data = {
            'title': 'E-Commerce Platform',
            'slug': 'ecommerce-platform',
            'description': 'Full-featured e-commerce platform with Django backend and React frontend',
            'detailed_description': 'A comprehensive e-commerce solution built with modern technologies.',
            'features': [
                'User authentication and authorization',
                'Product catalog with search and filtering',
                'Shopping cart and checkout process',
                'Payment integration with Stripe',
                'Order management system',
                'Admin dashboard for inventory management'
            ],
            'challenges': 'Implementing real-time inventory updates and handling concurrent transactions.',
            'solutions': 'Used Redis for caching and database transactions for data consistency.',
            'lessons_learned': 'Importance of proper error handling and user feedback in e-commerce applications.',
            'github_link': 'https://github.com/maathmphepo/ecommerce-platform',
            'live_link': 'https://ecommerce-demo.example.com',
            'image': 'https://via.placeholder.com/600x400',
            'gallery_images': [
                'https://via.placeholder.com/800x600',
                'https://via.placeholder.com/800x600',
                'https://via.placeholder.com/800x600'
            ],
            'client': 'Tech Startup Inc.',
            'team_size': 3,
            'my_role': 'Lead Backend Developer',
            'start_date': datetime.now().date() - timedelta(days=180),
            'end_date': datetime.now().date() - timedelta(days=30),
            'status': 'completed',
            'is_featured': True,
            'views': 156,
            'likes': 12,
        }
        
        project, created = Project.objects.get_or_create(
            slug=project_data['slug'],
            defaults=project_data
        )
        if created:
            project.tech_stack.set([django_tech, react_tech, postgres_tech])
            self.stdout.write(f'✓ Project created: {project.title}')

    def create_skills_data(self):
        # Create skill categories
        categories_data = [
            {'name': 'Backend Development', 'slug': 'backend', 'order': 1},
            {'name': 'Frontend Development', 'slug': 'frontend', 'order': 2},
            {'name': 'Database', 'slug': 'database', 'order': 3},
            {'name': 'DevOps & Cloud', 'slug': 'devops', 'order': 4},
        ]
        
        for cat_data in categories_data:
            SkillCategory.objects.get_or_create(slug=cat_data['slug'], defaults=cat_data)
        
        # Create skills
        backend_cat = SkillCategory.objects.get(slug='backend')
        frontend_cat = SkillCategory.objects.get(slug='frontend')
        
        skills_data = [
            {
                'name': 'Django',
                'category': backend_cat,
                'proficiency': 5,  # Expert level
                'proficiency_percentage': 95,
                'years_experience': 4,
                'is_featured': True,
                'description': 'Expert in Django web framework for building scalable web applications.'
            },
            {
                'name': 'React',
                'category': frontend_cat,
                'proficiency': 4,  # Advanced level
                'proficiency_percentage': 85,
                'years_experience': 3,
                'is_featured': True,
                'description': 'Advanced React developer with experience in hooks, context, and state management.'
            }
        ]
        
        for skill_data in skills_data:
            skill, created = Skill.objects.get_or_create(
                name=skill_data['name'],
                category=skill_data['category'],
                defaults=skill_data
            )
            if created:
                self.stdout.write(f'✓ Skill created: {skill.name}')

    def create_contact_data(self):
        # Create social links
        social_data = [
            {'platform': 'github', 'url': 'https://github.com/maathmphepo', 'username': 'maathmphepo', 'icon_class': 'fab fa-github', 'order': 1},
            {'platform': 'linkedin', 'url': 'https://linkedin.com/in/maathmphepo', 'username': 'maathmphepo', 'icon_class': 'fab fa-linkedin', 'order': 2},
            {'platform': 'twitter', 'url': 'https://twitter.com/maathmphepo', 'username': '@maathmphepo', 'icon_class': 'fab fa-twitter', 'order': 3},
        ]
        
        for social in social_data:
            SocialLink.objects.get_or_create(platform=social['platform'], defaults=social)
        
        self.stdout.write('✓ Social links created')

    def create_core_data(self):
        # Create testimonials
        testimonial_data = {
            'name': 'John Smith',
            'position': 'CTO',
            'company': 'Tech Solutions Inc.',
            'testimonial': 'Maath delivered exceptional work on our Django project. His attention to detail and technical expertise made the difference.',
            'rating': 5,
            'is_featured': True,
            'avatar': 'https://via.placeholder.com/150'
        }
        
        testimonial, created = Testimonial.objects.get_or_create(
            name=testimonial_data['name'],
            company=testimonial_data['company'],
            defaults=testimonial_data
        )
        if created:
            self.stdout.write('✓ Testimonial created')
        
        # Create achievements
        achievement_data = {
            'title': 'AWS Certified Developer',
            'category': 'certification',
            'description': 'Certified AWS Developer with expertise in cloud architecture and deployment.',
            'date_achieved': datetime.now().date() - timedelta(days=365),
            'issuing_organization': 'Amazon Web Services',
            'is_featured': True,
        }
        
        achievement, created = Achievement.objects.get_or_create(
            title=achievement_data['title'],
            defaults=achievement_data
        )
        if created:
            self.stdout.write('✓ Achievement created')
