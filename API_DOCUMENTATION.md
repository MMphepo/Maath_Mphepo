# Portfolio Backend API Documentation

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Endpoint Categories](#endpoint-categories)
4. [Database Models](#database-models)
5. [Security Features](#security-features)
6. [Environment Configuration](#environment-configuration)
7. [Deployment Notes](#deployment-notes)
8. [Integration with Frontend](#integration-with-frontend)
9. [Error Handling](#error-handling)

## API Overview

The Portfolio Backend is a Django REST API that powers the Maath Mphepo portfolio website. It provides a comprehensive content management system with a focus on blog functionality, contact management, and project showcasing.

### Architecture
- **Framework**: Django 4.2.7 with Django REST Framework 3.14.0
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT-based authentication using Simple JWT
- **Caching**: Redis for performance optimization
- **File Storage**: Django's default file storage with Pillow for image processing
- **Content Processing**: Rich text content with CKEditor integration

### Base URL
- **Production**: `https://maath-mphepo.onrender.com`
- **Development**: `http://localhost:8000`

## Authentication

### JWT Authentication System

The API uses JSON Web Tokens (JWT) for authentication, implemented with `djangorestframework-simplejwt`.

#### Login Endpoint
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
    "username": "admin",
    "password": "your_password"
}
```

**Response (Success):**
```json
{
    "success": true,
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@example.com",
            "is_staff": true
        }
    }
}
```

**Response (Error):**
```json
{
    "success": false,
    "error": "Invalid credentials"
}
```

#### Token Refresh
```http
POST /api/auth/refresh/
```

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Token Verification
```http
POST /api/auth/verify/
```

**Request Body:**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Logout
```http
POST /api/auth/logout/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Security Features
- **Rate Limiting**: 5 login attempts per minute per IP
- **Brute Force Protection**: Account lockout after 5 failed attempts
- **IP Tracking**: Failed login attempts are logged and monitored
- **Token Expiration**: Access tokens expire after 1 hour, refresh tokens after 7 days

## Endpoint Categories

### 1. Blog System API

The blog system is the most comprehensive part of the API, providing full CRUD operations for blog posts, comments, and related functionality.

#### Public Blog Endpoints

##### Get Blog Posts
```http
GET /api/blog/
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Posts per page (default: 6, max: 20)
- `search`: Search in title, description, content
- `tags__slug`: Filter by tag slug
- `ordering`: Sort order (`-created_at`, `views`, `likes`)

**Response:**
```json
{
    "success": true,
    "data": {
        "posts": [
            {
                "id": 1,
                "title": "Getting Started with Django",
                "slug": "getting-started-with-django",
                "description": "A comprehensive guide to Django development",
                "banner_image": "https://example.com/media/blog/images/banner.jpg",
                "tags": [
                    {"id": 1, "name": "Django", "slug": "django"},
                    {"id": 2, "name": "Python", "slug": "python"}
                ],
                "views": 150,
                "likes": 25,
                "read_time": 8,
                "created_at": "2024-01-15T10:30:00Z",
                "author": {
                    "name": "Maath Mphepo",
                    "bio": "Backend Developer & Software Engineer"
                }
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalPosts": 28,
            "hasNext": true,
            "hasPrev": false
        },
        "filters": {
            "availableTags": [
                {"id": 1, "name": "Django", "slug": "django", "usage_count": 5},
                {"id": 2, "name": "Python", "slug": "python", "usage_count": 8}
            ],
            "currentTag": null,
            "currentSort": "newest",
            "searchQuery": ""
        }
    }
}
```

##### Get Single Blog Post
```http
GET /api/blog/{slug}/
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Getting Started with Django",
        "slug": "getting-started-with-django",
        "description": "A comprehensive guide to Django development",
        "content": "<h2>Introduction</h2><p>Django is a powerful web framework...</p>",
        "processed_content": "<h2 id=\"introduction\">Introduction</h2><p>Django is a powerful web framework...</p>",
        "banner_image": "https://example.com/media/blog/images/banner.jpg",
        "banner_image_alt": "Django logo with code in background",
        "meta_description": "Learn Django web development from scratch",
        "meta_keywords": "django, python, web development, tutorial",
        "tags": [
            {"id": 1, "name": "Django", "slug": "django"},
            {"id": 2, "name": "Python", "slug": "python"}
        ],
        "is_published": true,
        "is_featured": false,
        "views": 150,
        "likes": 25,
        "read_time": 8,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-16T14:20:00Z",
        "published_at": "2024-01-15T12:00:00Z",
        "author": {
            "name": "Maath Mphepo",
            "bio": "Backend Developer & Software Engineer",
            "avatar": "https://example.com/media/avatars/maath.jpg"
        },
        "content_metadata": {
            "word_count": 1250,
            "reading_time": 8,
            "image_count": 3,
            "link_count": 5,
            "heading_count": 6
        },
        "table_of_contents": [
            {"level": 2, "id": "introduction", "title": "Introduction"},
            {"level": 2, "id": "installation", "title": "Installation"},
            {"level": 3, "id": "virtual-environment", "title": "Virtual Environment"}
        ],
        "comments": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "content": "Great tutorial! Very helpful.",
                "is_approved": true,
                "parent": null,
                "replies": [],
                "created_at": "2024-01-16T09:15:00Z"
            }
        ]
    }
}
```

##### Like/Unlike Blog Post
```http
POST /api/blog/{slug}/like/
```

**Request Body:**
```json
{
    "action": "like"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "liked": true,
        "likes": 26
    }
}
```

##### Get Blog Tags
```http
GET /api/blog/tags/
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Django",
            "slug": "django",
            "usage_count": 5
        },
        {
            "id": 2,
            "name": "Python",
            "slug": "python",
            "usage_count": 8
        }
    ]
}
```

##### Add Comment
```http
POST /api/blog/{slug}/comments/
```

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "content": "Great article! Thanks for sharing.",
    "parent": null
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 15,
        "name": "John Doe",
        "content": "Great article! Thanks for sharing.",
        "is_approved": false,
        "created_at": "2024-01-20T15:30:00Z",
        "message": "Comment submitted successfully and is pending approval."
    }
}
```

#### Admin Blog Endpoints

All admin endpoints require JWT authentication with staff privileges.

##### Get Admin Blog Posts
```http
GET /api/blog/admin/posts/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Query Parameters:**
- `page`: Page number
- `search`: Search query
- `status`: Filter by status (`published`, `draft`, `featured`)
- `ordering`: Sort order

**Response:**
```json
{
    "success": true,
    "results": [
        {
            "id": 1,
            "title": "Getting Started with Django",
            "slug": "getting-started-with-django",
            "description": "A comprehensive guide to Django development",
            "is_published": true,
            "is_featured": false,
            "views": 150,
            "likes": 25,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-16T14:20:00Z",
            "author_name": "Maath Mphepo"
        }
    ],
    "count": 28,
    "next": "http://localhost:8000/api/blog/admin/posts/?page=2",
    "previous": null
}
```

##### Create Blog Post
```http
POST /api/blog/admin/posts/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
    "title": "New Blog Post",
    "description": "This is a new blog post about Django development",
    "content": "<h2>Introduction</h2><p>This is the content...</p>",
    "meta_description": "Learn about Django development",
    "meta_keywords": "django, python, web development",
    "tags": ["django", "python"],
    "is_published": false,
    "is_featured": false,
    "banner_image_alt": "Django tutorial screenshot"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 29,
        "title": "New Blog Post",
        "slug": "new-blog-post",
        "created_at": "2024-01-20T16:45:00Z",
        "message": "Blog post created successfully"
    }
}
```

##### Update Blog Post
```http
PUT /api/blog/admin/posts/{id}/
PATCH /api/blog/admin/posts/{id}/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

**Request Body (PATCH example):**
```json
{
    "title": "Updated Blog Post Title",
    "is_published": true
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Updated Blog Post Title",
        "updated_at": "2024-01-20T17:30:00Z",
        "message": "Blog post updated successfully"
    }
}
```

##### Delete Blog Post
```http
DELETE /api/blog/admin/posts/{id}/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response:**
```json
{
    "success": true,
    "message": "Blog post deleted successfully"
}
```

##### Toggle Publish Status
```http
POST /api/blog/admin/posts/{id}/toggle_publish/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response:**
```json
{
    "success": true,
    "data": {
        "is_published": true,
        "published_at": "2024-01-20T18:00:00Z"
    }
}
```

##### Toggle Featured Status
```http
POST /api/blog/admin/posts/{id}/toggle_featured/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response:**
```json
{
    "success": true,
    "data": {
        "is_featured": true
    }
}
```

##### Upload Image
```http
POST /api/blog/admin/upload-image/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: multipart/form-data
```

**Request Body:**
```
image: [binary file data]
```

**Response:**
```json
{
    "success": true,
    "data": {
        "url": "https://maath-mphepo.onrender.com/media/blog/images/2024/01/20/image_abc123.jpg",
        "filename": "image_abc123.jpg",
        "size": 245760
    }
}
```

##### Get Dashboard Stats
```http
GET /api/blog/admin/dashboard-stats/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response:**
```json
{
    "success": true,
    "data": {
        "stats": {
            "total_posts": 28,
            "published_posts": 22,
            "draft_posts": 6,
            "featured_posts": 4,
            "total_views": 15420,
            "total_likes": 892,
            "total_comments": 156
        },
        "recent_posts": [
            {
                "id": 28,
                "title": "Latest Blog Post",
                "created_at": "2024-01-20T10:00:00Z",
                "views": 45,
                "likes": 8
            }
        ],
        "popular_tags": [
            {"name": "Django", "usage_count": 12},
            {"name": "Python", "usage_count": 18}
        ]
    }
}
```

### 2. Contact System API

##### Submit Contact Form
```http
POST /api/contact/
```

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a potential project...",
    "phone": "+1234567890"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 15,
        "message": "Thank you for your message! I'll get back to you soon."
    }
}
```

##### Get Contact Messages (Admin)
```http
GET /api/contact/admin/messages/
```

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response:**
```json
{
    "success": true,
    "results": [
        {
            "id": 15,
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Project Inquiry",
            "message": "I would like to discuss a potential project...",
            "phone": "+1234567890",
            "is_read": false,
            "created_at": "2024-01-20T14:30:00Z"
        }
    ]
}
```

### 3. Projects API

##### Get Projects
```http
GET /api/projects/
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Portfolio Website",
            "description": "A modern portfolio website built with Next.js and Django",
            "technologies": ["Next.js", "Django", "PostgreSQL", "Tailwind CSS"],
            "github_url": "https://github.com/MMphepo/portfolio",
            "live_url": "https://maathmphepo.com",
            "image": "https://example.com/media/projects/portfolio.jpg",
            "is_featured": true,
            "created_at": "2024-01-10T12:00:00Z"
        }
    ]
}
```

### 4. Skills API

##### Get Skills
```http
GET /api/skills/
```

**Response:**
```json
{
    "success": true,
    "data": {
        "categories": [
            {
                "name": "Backend Development",
                "skills": [
                    {"name": "Django", "proficiency": 90, "icon": "django-icon.svg"},
                    {"name": "Python", "proficiency": 95, "icon": "python-icon.svg"}
                ]
            },
            {
                "name": "Frontend Development",
                "skills": [
                    {"name": "React", "proficiency": 85, "icon": "react-icon.svg"},
                    {"name": "Next.js", "proficiency": 80, "icon": "nextjs-icon.svg"}
                ]
            }
        ]
    }
}
```

## Database Models

### Blog Models

#### BlogPost Model
```python
class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    content = models.TextField()
    processed_content = models.TextField(blank=True)
    banner_image = models.ImageField(upload_to='blog/images/', blank=True, null=True)
    banner_image_alt = models.CharField(max_length=200, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=200, blank=True)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    read_time = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    tags = models.ManyToManyField('Tag', blank=True)
```

#### Tag Model
```python
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Comment Model
```python
class Comment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
```

#### BlogLike Model
```python
class BlogLike(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'ip_address']
```

### Contact Models

#### ContactMessage Model
```python
class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    phone = models.CharField(max_length=20, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
```

### Project Models

#### Project Model
```python
class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    technologies = models.JSONField(default=list)
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Skill Models

#### SkillCategory Model
```python
class SkillCategory(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Skill Model
```python
class Skill(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE)
    proficiency = models.PositiveIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    icon = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

## Security Features

### Content Sanitization
- **HTML Sanitization**: All user-generated content is sanitized using DOMPurify
- **XSS Protection**: Malicious scripts are stripped from content
- **SQL Injection Prevention**: Django ORM provides built-in protection
- **CSRF Protection**: Cross-Site Request Forgery tokens required for state-changing operations

### Rate Limiting
- **Login Attempts**: 5 attempts per minute per IP address
- **API Requests**: 100 requests per 15 minutes for general endpoints
- **Contact Form**: 3 submissions per hour per IP
- **Comment Submission**: 5 comments per 5 minutes per IP
- **Image Upload**: 20 uploads per hour for authenticated users

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "https://maathmphepo.com",
    "https://www.maathmphepo.com",
    "http://localhost:3000",  # Development
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Production setting
```

### Content Security Policy
- **Image Sources**: Restricted to trusted domains
- **Script Sources**: Only allow same-origin and trusted CDNs
- **Style Sources**: Inline styles allowed for dynamic content
- **Frame Ancestors**: Prevent clickjacking attacks

### Input Validation
- **Email Validation**: RFC-compliant email validation
- **File Upload Validation**: File type, size, and content validation
- **Content Length Limits**: Maximum content length enforced
- **Character Encoding**: UTF-8 encoding enforced

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the `portfolio_backend` directory with the following variables:

```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=maath-mphepo.onrender.com,localhost,127.0.0.1

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# Redis Configuration (for caching and rate limiting)
REDIS_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=3600  # 1 hour in seconds
JWT_REFRESH_TOKEN_LIFETIME=604800  # 7 days in seconds

# File Storage
MEDIA_URL=/media/
STATIC_URL=/static/

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
X_FRAME_OPTIONS=DENY

# API Configuration
API_RATE_LIMIT_PER_MINUTE=60
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes

# Blog Configuration
BLOG_POSTS_PER_PAGE=6
MAX_COMMENT_LENGTH=1000
COMMENT_MODERATION=True

# Contact Configuration
CONTACT_EMAIL=maathmphepo80@gmail.com
MAX_CONTACT_MESSAGE_LENGTH=2000
```

### Development vs Production Settings

#### Development Settings
```python
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
CORS_ALLOW_ALL_ORIGINS = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### Production Settings
```python
DEBUG = False
ALLOWED_HOSTS = ['maath-mphepo.onrender.com']
CORS_ALLOW_ALL_ORIGINS = False
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
SECURE_SSL_REDIRECT = True
```

## Deployment Notes

### Render Deployment Configuration

The Django backend is deployed on Render with the following configuration:

#### Build Command
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

#### Start Command
```bash
gunicorn portfolio_backend.wsgi:application
```

#### Environment Variables on Render
- `PYTHON_VERSION`: 3.11.0
- `DATABASE_URL`: Automatically provided by Render PostgreSQL
- `SECRET_KEY`: Generated secure key
- `DEBUG`: False
- `ALLOWED_HOSTS`: maath-mphepo.onrender.com

#### Static Files Configuration
```python
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# WhiteNoise for static file serving
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... other middleware
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### Media Files Configuration
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# For production, consider using cloud storage like AWS S3
if not DEBUG:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
```

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Performance Optimizations
- **Database Indexing**: Indexes on frequently queried fields
- **Query Optimization**: Select_related and prefetch_related for complex queries
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **CDN**: Static files served through CDN in production

## Integration with Frontend

### Next.js Frontend Integration

The Next.js frontend communicates with the Django backend through the API client located in `src/lib/api/blog.ts`.

#### API Client Configuration
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://maath-mphepo.onrender.com'

const createHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (includeAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return headers
}
```

#### Authentication Flow
1. **Login**: User credentials sent to `/api/auth/login/`
2. **Token Storage**: JWT tokens stored in localStorage
3. **Request Headers**: Access token included in Authorization header
4. **Token Refresh**: Automatic token refresh when expired
5. **Logout**: Token removed from localStorage

#### Data Fetching Patterns
```typescript
// Public data (no auth required)
const posts = await blogAPI.getPosts({ page: 1, limit: 6 })

// Admin data (auth required)
const adminPosts = await adminBlogAPI.getPosts()

// Error handling
try {
  const response = await blogAPI.getPost(slug)
  if (response.success) {
    setPost(response.data)
  }
} catch (error) {
  console.error('Failed to fetch post:', error)
}
```

#### Real-time Updates
- **Optimistic Updates**: UI updates immediately, reverts on error
- **Cache Invalidation**: Refresh data after mutations
- **Loading States**: Show loading indicators during API calls
- **Error Boundaries**: Graceful error handling and recovery

### CORS Configuration for Frontend
```python
CORS_ALLOWED_ORIGINS = [
    "https://maathmphepo.com",
    "https://www.maathmphepo.com",
    "http://localhost:3000",
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

## Error Handling

### Standard Error Response Format

All API endpoints return errors in a consistent format:

```json
{
    "success": false,
    "error": "Error message description",
    "code": "ERROR_CODE",
    "details": {
        "field": ["Specific field error message"]
    }
}
```

### HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 405 | Method Not Allowed | HTTP method not supported |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Common Error Responses

#### Authentication Errors
```json
{
    "success": false,
    "error": "Authentication credentials were not provided",
    "code": "AUTHENTICATION_REQUIRED"
}
```

```json
{
    "success": false,
    "error": "Invalid token",
    "code": "INVALID_TOKEN"
}
```

#### Validation Errors
```json
{
    "success": false,
    "error": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
        "title": ["This field is required."],
        "email": ["Enter a valid email address."]
    }
}
```

#### Rate Limiting Errors
```json
{
    "success": false,
    "error": "Rate limit exceeded. Try again in 60 seconds.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retry_after": 60
}
```

#### File Upload Errors
```json
{
    "success": false,
    "error": "File size exceeds maximum allowed size of 10MB",
    "code": "FILE_TOO_LARGE"
}
```

```json
{
    "success": false,
    "error": "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
    "code": "INVALID_FILE_TYPE"
}
```

#### Permission Errors
```json
{
    "success": false,
    "error": "You do not have permission to perform this action",
    "code": "PERMISSION_DENIED"
}
```

### Troubleshooting Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't access API due to CORS policy
**Solution**:
- Ensure frontend domain is in `CORS_ALLOWED_ORIGINS`
- Check that credentials are included in requests
- Verify preflight requests are handled correctly

#### 2. Authentication Issues
**Problem**: 401 Unauthorized errors
**Solutions**:
- Check token is included in Authorization header
- Verify token hasn't expired
- Ensure token format is `Bearer <token>`
- Check user has required permissions

#### 3. File Upload Issues
**Problem**: Image uploads failing
**Solutions**:
- Verify file size is under 10MB limit
- Check file type is supported (JPEG, PNG, WebP)
- Ensure proper Content-Type header for multipart/form-data
- Check media directory permissions

#### 4. Rate Limiting
**Problem**: Too many requests error
**Solutions**:
- Implement exponential backoff in frontend
- Cache responses to reduce API calls
- Use pagination for large datasets
- Monitor request patterns

#### 5. Database Connection Issues
**Problem**: 500 errors related to database
**Solutions**:
- Check DATABASE_URL environment variable
- Verify database server is running
- Check connection pool settings
- Monitor database performance

### Logging and Monitoring

#### Error Logging
```python
import logging

logger = logging.getLogger(__name__)

try:
    # API operation
    pass
except Exception as e:
    logger.error(f"API Error: {str(e)}", exc_info=True)
    return Response({
        "success": False,
        "error": "An unexpected error occurred"
    }, status=500)
```

#### Performance Monitoring
- **Response Times**: Monitor API endpoint response times
- **Error Rates**: Track error frequency by endpoint
- **Database Queries**: Monitor slow queries and N+1 problems
- **Memory Usage**: Track memory consumption patterns
- **Rate Limiting**: Monitor rate limit hit rates

### API Testing

#### Using curl
```bash
# Test authentication
curl -X POST https://maath-mphepo.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Test authenticated endpoint
curl -X GET https://maath-mphepo.onrender.com/api/blog/admin/posts/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test file upload
curl -X POST https://maath-mphepo.onrender.com/api/blog/admin/upload-image/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/image.jpg"
```

#### Using Postman
1. Create environment variables for base URL and token
2. Set up authentication collection with login request
3. Use collection variables for consistent testing
4. Create test suites for different API endpoints

---

## API Versioning

The current API is version 1.0. Future versions will maintain backward compatibility where possible.

**Current Version**: v1.0
**Base URL**: `https://maath-mphepo.onrender.com/api/`
**Documentation Version**: 1.0.0
**Last Updated**: January 2024

For questions or issues with the API, please contact: maathmphepo80@gmail.com
