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
    help = 'Populate database with comprehensive portfolio data'

    def handle(self, *args, **options):
        self.stdout.write('Creating comprehensive portfolio data...')
        
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        TechStack.objects.all().delete()
        Project.objects.all().delete()
        SkillCategory.objects.all().delete()
        Skill.objects.all().delete()
        
        # Create comprehensive data
        self.create_comprehensive_tech_stack()
        self.create_comprehensive_skill_categories()
        self.create_comprehensive_skills()
        self.create_comprehensive_projects()
        
        self.stdout.write(self.style.SUCCESS('Comprehensive portfolio data created successfully!'))

    def create_comprehensive_tech_stack(self):
        """Create comprehensive technology stack"""
        self.stdout.write('Creating comprehensive tech stack...')
        
        tech_data = [
            # Languages
            {'name': 'Python', 'category': 'backend', 'icon_class': 'fab fa-python', 'color': '#3776AB'},
            {'name': 'PHP', 'category': 'backend', 'icon_class': 'fab fa-php', 'color': '#777BB4'},
            {'name': 'JavaScript', 'category': 'frontend', 'icon_class': 'fab fa-js-square', 'color': '#F7DF1E'},
            {'name': 'HTML/CSS', 'category': 'frontend', 'icon_class': 'fab fa-html5', 'color': '#E34F26'},
            
            # Backend Frameworks
            {'name': 'Django', 'category': 'backend', 'icon_class': 'fas fa-server', 'color': '#092E20'},
            {'name': 'Laravel', 'category': 'backend', 'icon_class': 'fab fa-laravel', 'color': '#FF2D20'},
            
            # Frontend Frameworks
            {'name': 'React', 'category': 'frontend', 'icon_class': 'fab fa-react', 'color': '#61DAFB'},
            {'name': 'Next.js', 'category': 'frontend', 'icon_class': 'fas fa-code', 'color': '#000000'},
            
            # Databases
            {'name': 'MySQL', 'category': 'database', 'icon_class': 'fas fa-database', 'color': '#4479A1'},
            {'name': 'PostgreSQL', 'category': 'database', 'icon_class': 'fas fa-database', 'color': '#336791'},
            {'name': 'SQLite', 'category': 'database', 'icon_class': 'fas fa-database', 'color': '#003B57'},
            
            # Tools & Libraries
            {'name': 'Flet', 'category': 'tools', 'icon_class': 'fas fa-desktop', 'color': '#10B981'},
            {'name': 'JWT Authentication', 'category': 'tools', 'icon_class': 'fas fa-shield-alt', 'color': '#000000'},
            {'name': 'Tailwind CSS', 'category': 'frontend', 'icon_class': 'fas fa-paint-brush', 'color': '#06B6D4'},
            {'name': 'Artisan', 'category': 'tools', 'icon_class': 'fas fa-terminal', 'color': '#FF2D20'},
        ]
        
        for tech in tech_data:
            TechStack.objects.create(**tech)
        
        self.stdout.write(f'Created {len(tech_data)} tech stack items')

    def create_comprehensive_skill_categories(self):
        """Create comprehensive skill categories"""
        self.stdout.write('Creating comprehensive skill categories...')
        
        categories = [
            {'name': 'Languages', 'slug': 'languages', 'description': 'Programming languages I work with', 'icon_class': 'fas fa-code', 'color': '#10B981', 'order': 1},
            {'name': 'Backend Frameworks', 'slug': 'backend-frameworks', 'description': 'Server-side frameworks and technologies', 'icon_class': 'fas fa-server', 'color': '#3B82F6', 'order': 2},
            {'name': 'Frontend Frameworks', 'slug': 'frontend-frameworks', 'description': 'Client-side frameworks and libraries', 'icon_class': 'fab fa-react', 'color': '#8B5CF6', 'order': 3},
            {'name': 'Databases', 'slug': 'databases', 'description': 'Database management systems', 'icon_class': 'fas fa-database', 'color': '#F59E0B', 'order': 4},
            {'name': 'Tools & Libraries', 'slug': 'tools-libraries', 'description': 'Development tools and utility libraries', 'icon_class': 'fas fa-tools', 'color': '#EF4444', 'order': 5},
        ]
        
        for cat_data in categories:
            SkillCategory.objects.create(**cat_data)
        
        self.stdout.write(f'Created {len(categories)} skill categories')

    def create_comprehensive_skills(self):
        """Create comprehensive skills"""
        self.stdout.write('Creating comprehensive skills...')
        
        # Get categories
        languages = SkillCategory.objects.get(slug='languages')
        backend_frameworks = SkillCategory.objects.get(slug='backend-frameworks')
        frontend_frameworks = SkillCategory.objects.get(slug='frontend-frameworks')
        databases = SkillCategory.objects.get(slug='databases')
        tools_libraries = SkillCategory.objects.get(slug='tools-libraries')
        
        skills_data = [
            # Languages
            {'name': 'Python', 'category': languages, 'icon_class': 'fab fa-python', 'proficiency': 5, 'proficiency_percentage': 95, 'description': 'Primary backend language for API development, data processing, and automation', 'years_experience': 3, 'is_featured': True, 'order': 1},
            {'name': 'PHP', 'category': languages, 'icon_class': 'fab fa-php', 'proficiency': 4, 'proficiency_percentage': 85, 'description': 'Laravel development, authentication systems, and web applications', 'years_experience': 2, 'is_featured': True, 'order': 2},
            {'name': 'JavaScript', 'category': languages, 'icon_class': 'fab fa-js-square', 'proficiency': 4, 'proficiency_percentage': 80, 'description': 'Frontend development and Node.js backend applications', 'years_experience': 2, 'is_featured': True, 'order': 3},
            {'name': 'HTML/CSS', 'category': languages, 'icon_class': 'fab fa-html5', 'proficiency': 4, 'proficiency_percentage': 90, 'description': 'Semantic markup and responsive styling with modern CSS', 'years_experience': 3, 'is_featured': False, 'order': 4},
            
            # Backend Frameworks
            {'name': 'Django', 'category': backend_frameworks, 'icon_class': 'fas fa-server', 'proficiency': 5, 'proficiency_percentage': 90, 'description': 'REST API development, serializers, custom parsers, and authentication', 'years_experience': 3, 'is_featured': True, 'order': 1},
            {'name': 'Laravel', 'category': backend_frameworks, 'icon_class': 'fab fa-laravel', 'proficiency': 4, 'proficiency_percentage': 85, 'description': 'Authentication systems, artisan commands, routing, and MVC architecture', 'years_experience': 2, 'is_featured': True, 'order': 2},
            
            # Frontend Frameworks
            {'name': 'React', 'category': frontend_frameworks, 'icon_class': 'fab fa-react', 'proficiency': 4, 'proficiency_percentage': 80, 'description': 'Component-based UI development with hooks and state management', 'years_experience': 2, 'is_featured': True, 'order': 1},
            {'name': 'Next.js', 'category': frontend_frameworks, 'icon_class': 'fas fa-code', 'proficiency': 4, 'proficiency_percentage': 75, 'description': 'Full-stack React framework with SSR and API routes', 'years_experience': 1, 'is_featured': True, 'order': 2},
            
            # Databases
            {'name': 'MySQL', 'category': databases, 'icon_class': 'fas fa-database', 'proficiency': 4, 'proficiency_percentage': 85, 'description': 'Production database management and optimization', 'years_experience': 3, 'is_featured': True, 'order': 1},
            {'name': 'PostgreSQL', 'category': databases, 'icon_class': 'fas fa-database', 'proficiency': 4, 'proficiency_percentage': 80, 'description': 'Advanced relational database with complex queries', 'years_experience': 2, 'is_featured': True, 'order': 2},
            {'name': 'SQLite', 'category': databases, 'icon_class': 'fas fa-database', 'proficiency': 4, 'proficiency_percentage': 90, 'description': 'Lightweight database for development environments', 'years_experience': 3, 'is_featured': False, 'order': 3},
            
            # Tools & Libraries
            {'name': 'Flet', 'category': tools_libraries, 'icon_class': 'fas fa-desktop', 'proficiency': 3, 'proficiency_percentage': 70, 'description': 'Cross-platform Python GUI framework for desktop applications', 'years_experience': 1, 'is_featured': True, 'order': 1},
            {'name': 'JWT Authentication', 'category': tools_libraries, 'icon_class': 'fas fa-shield-alt', 'proficiency': 4, 'proficiency_percentage': 85, 'description': 'API security and token-based authentication systems', 'years_experience': 2, 'is_featured': True, 'order': 2},
            {'name': 'Tailwind CSS', 'category': tools_libraries, 'icon_class': 'fas fa-paint-brush', 'proficiency': 4, 'proficiency_percentage': 80, 'description': 'Utility-first CSS framework for rapid UI development', 'years_experience': 1, 'is_featured': True, 'order': 3},
            {'name': 'Artisan', 'category': tools_libraries, 'icon_class': 'fas fa-terminal', 'proficiency': 4, 'proficiency_percentage': 85, 'description': 'Laravel CLI tool for code generation and task automation', 'years_experience': 2, 'is_featured': False, 'order': 4},
        ]
        
        for skill_data in skills_data:
            Skill.objects.create(**skill_data)
        
        self.stdout.write(f'Created {len(skills_data)} skills')

    def create_comprehensive_projects(self):
        """Create comprehensive project portfolio"""
        self.stdout.write('Creating comprehensive projects...')

        # Tech stack will be added by name lookup in the loop

        projects_data = [
            {
                'title': 'Portfolio Website',
                'slug': 'portfolio-website',
                'description': 'Modern portfolio website built with Next.js and Tailwind CSS, featuring a Django REST API backend for blog management and dynamic content.',
                'detailed_description': 'A comprehensive portfolio website showcasing my work and skills. Built with Next.js for the frontend with server-side rendering, Tailwind CSS for styling with glassmorphism effects, and Django REST API for the backend. Features include a dynamic blog system, project showcase, skills display, and contact management.',
                'features': ['Responsive Design', 'Blog Management', 'Django REST API', 'Glassmorphism UI', 'SEO Optimized', 'Admin Portal'],
                'github_link': 'https://github.com/maathmphepo/portfolio',
                'live_link': 'https://maathmphepo.dev',
                'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
                'is_featured': True,
                'status': 'completed',
                'my_role': 'Full Stack Developer',
                'tech_stack_names': ['Next.js', 'Django', 'Tailwind CSS', 'PostgreSQL', 'JWT Authentication']
            },
            {
                'title': 'Task Tracking Website',
                'slug': 'task-tracking-website',
                'description': 'Laravel and React-based task management system with responsive UI and comprehensive status management for project tracking.',
                'detailed_description': 'A full-featured task tracking application built with Laravel backend and React frontend. Includes user authentication, project management, task assignment, status tracking, and reporting features.',
                'features': ['Task Management', 'Status Tracking', 'User Authentication', 'Responsive Design', 'Project Organization', 'Reporting Dashboard'],
                'github_link': 'https://github.com/maathmphepo/task-tracker',
                'live_link': 'https://tasktracker.example.com',
                'image': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
                'is_featured': True,
                'status': 'completed',
                'my_role': 'Full Stack Developer',
                'tech_stack_names': ['Laravel', 'React', 'MySQL', 'PHP', 'JavaScript']
            },
            {
                'title': 'ESCOM Schedule API',
                'slug': 'escom-schedule-api',
                'description': 'Django REST API with custom serializers for managing and serving power schedule data for Malawi\'s electricity utility company.',
                'detailed_description': 'A specialized API system for ESCOM (Electricity Supply Corporation of Malawi) to manage and distribute power outage schedules. Features custom serializers, data validation, and efficient querying for schedule information.',
                'features': ['Custom Serializers', 'Schedule Management', 'Data Validation', 'API Documentation', 'Efficient Querying', 'Real-time Updates'],
                'github_link': 'https://github.com/maathmphepo/escom-api',
                'live_link': None,
                'image': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
                'is_featured': True,
                'status': 'completed',
                'my_role': 'Backend Developer',
                'tech_stack_names': ['Django', 'Python', 'PostgreSQL']
            },
            {
                'title': 'KIPS Finance System',
                'slug': 'kips-finance-system',
                'description': 'Restaurant financial tracking system with normalized database design for comprehensive financial management and reporting.',
                'detailed_description': 'A comprehensive financial management system for KIPS Restaurant featuring normalized database design, transaction tracking, inventory management, and detailed financial reporting.',
                'features': ['Financial Tracking', 'Normalized Database', 'Inventory Management', 'Reporting System', 'Transaction History', 'Multi-user Access'],
                'github_link': 'https://github.com/maathmphepo/kips-finance',
                'live_link': None,
                'image': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
                'is_featured': True,
                'status': 'completed',
                'my_role': 'Database Designer & Backend Developer',
                'tech_stack_names': ['Django', 'Python', 'MySQL']
            },
            {
                'title': 'IBM Case Study & Supply Chain Analysis',
                'slug': 'ibm-case-study',
                'description': 'Comprehensive business analysis and system improvement proposals for IBM supply chain optimization and process enhancement.',
                'detailed_description': 'An in-depth case study analyzing IBM\'s supply chain processes, identifying bottlenecks, and proposing system improvements. Includes data analysis, process mapping, and strategic recommendations.',
                'features': ['Business Analysis', 'Process Mapping', 'Data Analysis', 'Strategic Recommendations', 'System Design', 'Performance Metrics'],
                'github_link': None,
                'live_link': None,
                'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                'is_featured': False,
                'status': 'completed',
                'my_role': 'Business Analyst',
                'tech_stack_names': []
            }
        ]

        # Create first 5 projects
        for project_data in projects_data:
            tech_stack_names = project_data.pop('tech_stack_names', [])
            project = Project.objects.create(**project_data)

            # Add tech stack relationships
            for tech_name in tech_stack_names:
                try:
                    tech = TechStack.objects.get(name=tech_name)
                    project.tech_stack.add(tech)
                except TechStack.DoesNotExist:
                    pass

        # Create remaining projects
        remaining_projects = [
            {
                'title': 'School Electricity Viewer',
                'slug': 'school-electricity-viewer',
                'description': 'Django web application for students to lookup electricity schedules and power outage information for educational institutions.',
                'detailed_description': 'A user-friendly web application built with Django to help students access electricity schedule information for their schools. Features include schedule lookup, notifications, and mobile-responsive design.',
                'features': ['Schedule Lookup', 'Student Portal', 'Mobile Responsive', 'Notification System', 'Search Functionality', 'Admin Management'],
                'github_link': 'https://github.com/maathmphepo/school-electricity',
                'live_link': 'https://schoolpower.example.com',
                'image': 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=800&h=600&fit=crop',
                'is_featured': False,
                'status': 'completed',
                'my_role': 'Full Stack Developer',
                'tech_stack_names': ['Django', 'Python', 'SQLite', 'HTML/CSS']
            },
            {
                'title': 'Customer Management System',
                'slug': 'customer-management-system',
                'description': 'Django CRM system with Malawi phone number validation and custom ID format generation for customer management.',
                'detailed_description': 'A comprehensive Customer Relationship Management system tailored for Malawi businesses. Features custom phone number validation for Malawi formats, automatic customer ID generation, and complete customer lifecycle management.',
                'features': ['Malawi Phone Validation', 'Custom ID Generation', 'Customer Lifecycle', 'Contact Management', 'Activity Tracking', 'Reporting Dashboard'],
                'github_link': 'https://github.com/maathmphepo/crm-system',
                'live_link': None,
                'image': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
                'is_featured': True,
                'status': 'completed',
                'my_role': 'Full Stack Developer',
                'tech_stack_names': ['Django', 'Python', 'MySQL']
            },
            {
                'title': 'Restaurant Employee Management',
                'slug': 'restaurant-employee-management',
                'description': 'HR management system with automatic employee ID generation and validation for restaurant staff management.',
                'detailed_description': 'A specialized HR system for restaurant management featuring automatic employee ID generation, staff scheduling, payroll integration, and performance tracking.',
                'features': ['Auto ID Generation', 'Staff Scheduling', 'Payroll Integration', 'Performance Tracking', 'Attendance Management', 'Role-based Access'],
                'github_link': 'https://github.com/maathmphepo/restaurant-hr',
                'live_link': None,
                'image': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
                'is_featured': False,
                'status': 'completed',
                'my_role': 'Backend Developer',
                'tech_stack_names': ['Django', 'Python', 'MySQL']
            },
            {
                'title': 'MicroPython ESP32-C3 Projects',
                'slug': 'micropython-esp32-projects',
                'description': 'IoT automation projects using MicroPython v1.24.0 on ESP32-C3 microcontrollers for smart home and industrial applications.',
                'detailed_description': 'A collection of IoT projects built with MicroPython on ESP32-C3 microcontrollers. Includes sensor monitoring, home automation, and industrial control systems.',
                'features': ['IoT Automation', 'Sensor Integration', 'WiFi Connectivity', 'Real-time Monitoring', 'Remote Control', 'Data Logging'],
                'github_link': 'https://github.com/maathmphepo/esp32-micropython',
                'live_link': None,
                'image': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
                'is_featured': True,
                'status': 'completed',
                'my_role': 'IoT Developer',
                'tech_stack_names': ['Python']
            },
            {
                'title': 'Google OAuth Integration',
                'slug': 'google-oauth-integration',
                'description': 'PHP authentication system with Google OAuth login integration for secure user authentication and authorization.',
                'detailed_description': 'A secure authentication system built in PHP featuring Google OAuth integration, session management, and user profile synchronization.',
                'features': ['Google OAuth', 'Session Management', 'Profile Sync', 'Security Features', 'User Management', 'API Integration'],
                'github_link': 'https://github.com/maathmphepo/php-google-oauth',
                'live_link': 'https://auth.example.com',
                'image': 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&h=600&fit=crop',
                'is_featured': False,
                'status': 'completed',
                'my_role': 'Backend Developer',
                'tech_stack_names': ['PHP', 'MySQL', 'JWT Authentication']
            }
        ]

        # Create remaining projects
        for project_data in remaining_projects:
            tech_stack_names = project_data.pop('tech_stack_names', [])
            project = Project.objects.create(**project_data)

            # Add tech stack relationships
            for tech_name in tech_stack_names:
                try:
                    tech = TechStack.objects.get(name=tech_name)
                    project.tech_stack.add(tech)
                except TechStack.DoesNotExist:
                    pass

        self.stdout.write(f'Created {len(projects_data) + len(remaining_projects)} total projects')
