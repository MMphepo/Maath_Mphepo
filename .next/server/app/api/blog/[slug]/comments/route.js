"use strict";(()=>{var e={};e.id=807,e.ids=[807],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4074:(e,a,t)=>{t.r(a),t.d(a,{headerHooks:()=>f,originalPathname:()=>w,patchFetch:()=>v,requestAsyncStorage:()=>m,routeModule:()=>u,serverHooks:()=>h,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>b});var i={};t.r(i),t.d(i,{GET:()=>d,POST:()=>p});var o=t(5419),n=t(9108),r=t(9678),s=t(8070),l=t(6197),c=t(7048);async function d(e,{params:a}){try{let{slug:e}=a,t=l.Qw.find(a=>a.slug===e);if(!t)return s.Z.json({success:!1,error:"Blog post not found"},{status:404});let i=l._A.filter(e=>e.blogId===t.id&&e.isApproved),o=(0,c.T9)(i);return s.Z.json({success:!0,data:o})}catch(e){return console.error("Error fetching comments:",e),s.Z.json({success:!1,error:"Failed to fetch comments"},{status:500})}}async function p(e,{params:a}){try{let{slug:t}=a,{name:i,email:o,content:n,parentId:r}=await e.json();if(!i||!o||!n)return s.Z.json({success:!1,error:"Missing required fields"},{status:400});if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o))return s.Z.json({success:!1,error:"Invalid email format"},{status:400});let c=l.Qw.find(e=>e.slug===t);if(!c)return s.Z.json({success:!1,error:"Blog post not found"},{status:404});if(r){let e=l._A.find(e=>e.id===r);if(!e||e.blogId!==c.id)return s.Z.json({success:!1,error:"Parent comment not found"},{status:400})}let d={id:Date.now().toString(),blogId:c.id,name:i.trim(),email:o.trim().toLowerCase(),content:n.trim(),parentId:r||void 0,isApproved:!0,createdAt:new Date().toISOString()};return l._A.push(d),s.Z.json({success:!0,data:d,message:"Comment added successfully"},{status:201})}catch(e){return console.error("Error adding comment:",e),s.Z.json({success:!1,error:"Failed to add comment"},{status:500})}}let u=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/blog/[slug]/comments/route",pathname:"/api/blog/[slug]/comments",filename:"route",bundlePath:"app/api/blog/[slug]/comments/route"},resolvedPagePath:"D:\\PROJ\\Maath_Mphepo\\src\\app\\api\\blog\\[slug]\\comments\\route.ts",nextConfigOutput:"standalone",userland:i}),{requestAsyncStorage:m,staticGenerationAsyncStorage:g,serverHooks:h,headerHooks:f,staticGenerationBailout:b}=u,w="/api/blog/[slug]/comments/route";function v(){return(0,r.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:g})}},6197:(e,a,t)=>{t.d(a,{Qw:()=>i,TV:()=>r,V0:()=>n,_A:()=>o});let i=[{id:"1",title:"Building Scalable APIs with Django REST Framework",slug:"building-scalable-apis-django-rest-framework",description:"Learn how to create robust, scalable APIs using Django REST Framework with best practices for authentication, serialization, and performance optimization.",content:`# Building Scalable APIs with Django REST Framework

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

Following these database design best practices will help you build robust, scalable applications that can grow with your business needs.`,tags:["Database","SQL","Performance","Backend"],bannerImage:"/images/blog/database-design-banner.jpg",views:890,likes:67,createdAt:"2024-01-05T09:15:00Z",updatedAt:"2024-01-05T09:15:00Z",isPublished:!0,readTime:10,author:{name:"Maath Mphepo",avatar:"/images/hero-profile.png",bio:"Backend Developer specializing in Django and Laravel"}}],o=[{id:"1",blogId:"1",name:"John Developer",email:"john@example.com",content:"Great article! The Django REST Framework examples are very helpful. I've been struggling with API authentication, and your explanation cleared things up.",isApproved:!0,createdAt:"2024-01-16T08:30:00Z"},{id:"2",blogId:"1",name:"Sarah Smith",email:"sarah@example.com",content:"Thanks for sharing this. Could you write a follow-up article about implementing JWT authentication with DRF?",isApproved:!0,createdAt:"2024-01-17T14:20:00Z"},{id:"3",blogId:"1",name:"Maath Mphepo",email:"maath@example.com",content:"Thanks for the suggestion, Sarah! JWT authentication with DRF is definitely on my list for upcoming articles.",parentId:"2",isApproved:!0,createdAt:"2024-01-17T15:45:00Z"}],n=[{id:"1",blogId:"1",type:"like",userIdentifier:"user1",createdAt:"2024-01-16T10:00:00Z"},{id:"2",blogId:"1",type:"clap",userIdentifier:"user2",createdAt:"2024-01-16T11:00:00Z"},{id:"3",blogId:"2",type:"like",userIdentifier:"user1",createdAt:"2024-01-11T09:00:00Z"}],r=[{id:"1",name:"Django",slug:"django",count:2},{id:"2",name:"Laravel",slug:"laravel",count:1},{id:"3",name:"Python",slug:"python",count:2},{id:"4",name:"PHP",slug:"php",count:1},{id:"5",name:"API",slug:"api",count:1},{id:"6",name:"Backend",slug:"backend",count:3},{id:"7",name:"Database",slug:"database",count:1}]},7048:(e,a,t)=>{function i(e){let a=new Map,t=[];return e.forEach(e=>{a.set(e.id,{...e,replies:[]})}),e.forEach(e=>{let i=a.get(e.id);if(e.parentId){let t=a.get(e.parentId);t&&(t.replies=t.replies||[],t.replies.push(i))}else t.push(i)}),t}function o(e,a){if(!a.trim())return e;let t=a.toLowerCase();return e.filter(e=>e.title.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)||e.tags.some(e=>e.toLowerCase().includes(t))||e.content.toLowerCase().includes(t))}function n(e,a){return a?e.filter(e=>e.tags.some(e=>e.toLowerCase()===a.toLowerCase())):e}function r(e,a,t="desc"){return[...e].sort((e,i)=>{let o=0;switch(a){case"createdAt":o=new Date(e.createdAt).getTime()-new Date(i.createdAt).getTime();break;case"views":o=e.views-i.views;break;case"likes":o=e.likes-i.likes}return"desc"===t?-o:o})}function s(e,a,t){let i=(a-1)*t,o=i+t;return{items:e.slice(i,o),totalCount:e.length,currentPage:a,totalPages:Math.ceil(e.length/t),hasNextPage:o<e.length,hasPrevPage:a>1}}t.d(a,{B7:()=>n,IY:()=>r,J$:()=>o,T9:()=>i,fI:()=>s})}};var a=require("../../../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),i=a.X(0,[638,206],()=>t(4074));module.exports=i})();