"use strict";(()=>{var e={};e.id=108,e.ids=[108],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9112:(e,a,t)=>{t.r(a),t.d(a,{headerHooks:()=>h,originalPathname:()=>b,patchFetch:()=>w,requestAsyncStorage:()=>u,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>f});var i={};t.r(i),t.d(i,{GET:()=>c,POST:()=>d});var o=t(5419),n=t(9108),r=t(9678),s=t(8070),l=t(6197);async function d(e,{params:a}){try{let{slug:t}=a,i=l.Qw.find(e=>e.slug===t);if(!i)return s.Z.json({success:!1,error:"Blog post not found"},{status:404});let o=e.headers.get("x-forwarded-for")||e.headers.get("x-real-ip")||"anonymous",n=`ip_${o.split(",")[0]}`,r=l.V0.find(e=>e.blogId===i.id&&e.userIdentifier===n&&"like"===e.type);if(r){let e=l.V0.findIndex(e=>e.id===r.id);return l.V0.splice(e,1),i.likes=Math.max(0,i.likes-1),s.Z.json({success:!0,data:{liked:!1,likes:i.likes},message:"Post unliked"})}{let e={id:Date.now().toString(),blogId:i.id,type:"like",userIdentifier:n,createdAt:new Date().toISOString()};return l.V0.push(e),i.likes+=1,s.Z.json({success:!0,data:{liked:!0,likes:i.likes},message:"Post liked"})}}catch(e){return console.error("Error handling like:",e),s.Z.json({success:!1,error:"Failed to process like"},{status:500})}}async function c(e,{params:a}){try{let{slug:t}=a,i=l.Qw.find(e=>e.slug===t);if(!i)return s.Z.json({success:!1,error:"Blog post not found"},{status:404});let o=e.headers.get("x-forwarded-for")||e.headers.get("x-real-ip")||"anonymous",n=`ip_${o.split(",")[0]}`,r=l.V0.some(e=>e.blogId===i.id&&e.userIdentifier===n&&"like"===e.type);return s.Z.json({success:!0,data:{liked:r,likes:i.likes}})}catch(e){return console.error("Error checking like status:",e),s.Z.json({success:!1,error:"Failed to check like status"},{status:500})}}let p=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/blog/[slug]/like/route",pathname:"/api/blog/[slug]/like",filename:"route",bundlePath:"app/api/blog/[slug]/like/route"},resolvedPagePath:"D:\\PROJ\\Maath_Mphepo\\src\\app\\api\\blog\\[slug]\\like\\route.ts",nextConfigOutput:"standalone",userland:i}),{requestAsyncStorage:u,staticGenerationAsyncStorage:g,serverHooks:m,headerHooks:h,staticGenerationBailout:f}=p,b="/api/blog/[slug]/like/route";function w(){return(0,r.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:g})}},6197:(e,a,t)=>{t.d(a,{Qw:()=>i,TV:()=>r,V0:()=>n,_A:()=>o});let i=[{id:"1",title:"Building Scalable APIs with Django REST Framework",slug:"building-scalable-apis-django-rest-framework",description:"Learn how to create robust, scalable APIs using Django REST Framework with best practices for authentication, serialization, and performance optimization.",content:`# Building Scalable APIs with Django REST Framework

Django REST Framework (DRF) is a powerful toolkit for building Web APIs in Django. In this comprehensive guide, we'll explore how to create scalable, maintainable APIs that can handle real-world production loads.

## Why Django REST Framework?

DRF provides a rich set of tools and features that make API development efficient and enjoyable:

- **Serialization**: Powerful serialization engine for converting complex data types
- **Authentication & Permissions**: Built-in authentication classes and permission systems
- **ViewSets & Routers**: Automatic URL routing and CRUD operations
- **Browsable API**: Interactive web interface for testing APIs

## Setting Up Your First API

Let's start by creating a simple blog API:

\`\`\`python
# models.py
from django.db import models

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
\`\`\`

## Creating Serializers

Serializers handle the conversion between Django model instances and JSON:

\`\`\`python
# serializers.py
from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'created_at', 'updated_at']
\`\`\`

## Building ViewSets

ViewSets provide the logic for handling HTTP requests:

\`\`\`python
# views.py
from rest_framework import viewsets
from .models import BlogPost
from .serializers import BlogPostSerializer

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
\`\`\`

## Performance Optimization

For scalable APIs, consider these optimization techniques:

1. **Database Optimization**: Use select_related() and prefetch_related()
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Pagination**: Always paginate large datasets
4. **Throttling**: Implement rate limiting to prevent abuse

## Conclusion

Django REST Framework provides all the tools needed to build production-ready APIs. By following these best practices, you can create APIs that scale with your application's growth.`,tags:["Django","Python","API","Backend"],bannerImage:"/images/blog/django-api-banner.jpg",views:1250,likes:89,createdAt:"2024-01-15T10:00:00Z",updatedAt:"2024-01-15T10:00:00Z",isPublished:!0,readTime:8,author:{name:"Maath Mphepo",avatar:"/images/hero-profile.png",bio:"Backend Developer specializing in Django and Laravel"}},{id:"2",title:"Laravel vs Django: A Comprehensive Comparison",slug:"laravel-vs-django-comprehensive-comparison",description:"An in-depth comparison of Laravel and Django frameworks, covering performance, ecosystem, learning curve, and use cases to help you choose the right framework.",content:`# Laravel vs Django: A Comprehensive Comparison

Choosing between Laravel and Django can be challenging. Both are excellent frameworks with their own strengths. Let's dive deep into this comparison.

## Overview

**Laravel** is a PHP web framework known for its elegant syntax and rich feature set.
**Django** is a Python web framework that follows the "batteries included" philosophy.

## Performance Comparison

### Laravel Performance
- PHP 8+ offers significant performance improvements
- Built-in caching mechanisms (Redis, Memcached)
- Queue system for background processing
- Eloquent ORM with lazy loading

### Django Performance
- Python's performance characteristics
- Django ORM with query optimization
- Built-in caching framework
- Celery for asynchronous tasks

## Learning Curve

### Laravel
- More intuitive for developers with PHP background
- Excellent documentation and tutorials
- Artisan CLI for rapid development
- Rich ecosystem with packages

### Django
- Steeper learning curve for beginners
- Comprehensive documentation
- Admin interface out of the box
- Strong community support

## Use Cases

### When to Choose Laravel
- Rapid prototyping and development
- E-commerce applications
- Content management systems
- Applications requiring real-time features

### When to Choose Django
- Data-heavy applications
- Scientific and analytical applications
- Applications requiring high security
- Scalable web applications

## Conclusion

Both frameworks are excellent choices. Your decision should be based on:
- Team expertise
- Project requirements
- Performance needs
- Ecosystem preferences`,tags:["Laravel","Django","PHP","Python","Comparison"],bannerImage:"/images/blog/laravel-django-banner.jpg",views:2100,likes:156,createdAt:"2024-01-10T14:30:00Z",updatedAt:"2024-01-10T14:30:00Z",isPublished:!0,readTime:12,author:{name:"Maath Mphepo",avatar:"/images/hero-profile.png",bio:"Backend Developer specializing in Django and Laravel"}},{id:"3",title:"Database Design Best Practices for Web Applications",slug:"database-design-best-practices-web-applications",description:"Essential database design principles and best practices for building efficient, scalable web applications with proper normalization and indexing strategies.",content:`# Database Design Best Practices for Web Applications

Good database design is the foundation of any successful web application. Let's explore the key principles and best practices.

## Fundamental Principles

### 1. Normalization
Organize data to reduce redundancy and improve data integrity.

### 2. Proper Indexing
Create indexes on frequently queried columns to improve performance.

### 3. Data Types
Choose appropriate data types to optimize storage and performance.

## Design Patterns

### Entity-Relationship Modeling
- Identify entities and their relationships
- Define primary and foreign keys
- Establish cardinality rules

### Naming Conventions
- Use consistent, descriptive names
- Follow standard naming patterns
- Avoid reserved keywords

## Performance Optimization

### Query Optimization
- Use EXPLAIN to analyze query performance
- Avoid N+1 query problems
- Implement proper caching strategies

### Scaling Strategies
- Vertical vs horizontal scaling
- Read replicas for read-heavy workloads
- Sharding for large datasets

## Security Considerations

- Input validation and sanitization
- Proper authentication and authorization
- Encryption for sensitive data
- Regular security audits

## Conclusion

Following these database design best practices will help you build robust, scalable applications that can grow with your business needs.`,tags:["Database","SQL","Performance","Backend"],bannerImage:"/images/blog/database-design-banner.jpg",views:890,likes:67,createdAt:"2024-01-05T09:15:00Z",updatedAt:"2024-01-05T09:15:00Z",isPublished:!0,readTime:10,author:{name:"Maath Mphepo",avatar:"/images/hero-profile.png",bio:"Backend Developer specializing in Django and Laravel"}}],o=[{id:"1",blogId:"1",name:"John Developer",email:"john@example.com",content:"Great article! The Django REST Framework examples are very helpful. I've been struggling with API authentication, and your explanation cleared things up.",isApproved:!0,createdAt:"2024-01-16T08:30:00Z"},{id:"2",blogId:"1",name:"Sarah Smith",email:"sarah@example.com",content:"Thanks for sharing this. Could you write a follow-up article about implementing JWT authentication with DRF?",isApproved:!0,createdAt:"2024-01-17T14:20:00Z"},{id:"3",blogId:"1",name:"Maath Mphepo",email:"maath@example.com",content:"Thanks for the suggestion, Sarah! JWT authentication with DRF is definitely on my list for upcoming articles.",parentId:"2",isApproved:!0,createdAt:"2024-01-17T15:45:00Z"}],n=[{id:"1",blogId:"1",type:"like",userIdentifier:"user1",createdAt:"2024-01-16T10:00:00Z"},{id:"2",blogId:"1",type:"clap",userIdentifier:"user2",createdAt:"2024-01-16T11:00:00Z"},{id:"3",blogId:"2",type:"like",userIdentifier:"user1",createdAt:"2024-01-11T09:00:00Z"}],r=[{id:"1",name:"Django",slug:"django",count:2},{id:"2",name:"Laravel",slug:"laravel",count:1},{id:"3",name:"Python",slug:"python",count:2},{id:"4",name:"PHP",slug:"php",count:1},{id:"5",name:"API",slug:"api",count:1},{id:"6",name:"Backend",slug:"backend",count:3},{id:"7",name:"Database",slug:"database",count:1}]}};var a=require("../../../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),i=a.X(0,[638,206],()=>t(9112));module.exports=i})();