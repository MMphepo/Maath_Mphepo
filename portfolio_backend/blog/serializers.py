from rest_framework import serializers
from .models import Tag, BlogPost, Comment, BlogReaction
from .content_processors import process_blog_content, generate_table_of_contents, extract_content_metadata


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'usage_count']


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'name', 'email', 'content', 'parent', 'replies', 'created_at']
        extra_kwargs = {
            'email': {'write_only': True}
        }
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.get_replies()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []


class BlogPostListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    excerpt = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'description', 'excerpt', 'banner_image',
            'tags', 'views', 'likes', 'read_time', 'comments_count',
            'author', 'created_at', 'updated_at'
        ]
    
    def get_excerpt(self, obj):
        return obj.get_excerpt()
    
    def get_comments_count(self, obj):
        return obj.get_comments_count()
    
    def get_author(self, obj):
        return {
            'name': obj.author_name,
            'bio': obj.author_bio,
            'avatar': obj.author_avatar
        }


class BlogPostDetailSerializer(BlogPostListSerializer):
    comments = serializers.SerializerMethodField()
    processed_content = serializers.SerializerMethodField()
    table_of_contents = serializers.SerializerMethodField()
    content_metadata = serializers.SerializerMethodField()

    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + [
            'content', 'processed_content', 'table_of_contents',
            'content_metadata', 'comments'
        ]

    def get_comments(self, obj):
        top_level_comments = obj.get_top_level_comments()
        return CommentSerializer(top_level_comments, many=True, context=self.context).data

    def get_processed_content(self, obj):
        """Return content processed for frontend compatibility"""
        if not obj.content:
            return ""

        # Check if frontend expects markdown or HTML
        output_format = self.context.get('output_format', 'html')
        return process_blog_content(obj.content, output_format=output_format)

    def get_table_of_contents(self, obj):
        """Generate table of contents from processed content"""
        if not obj.content:
            return []

        processed_content = process_blog_content(obj.content, output_format='html')
        return generate_table_of_contents(processed_content)

    def get_content_metadata(self, obj):
        """Get content metadata and statistics"""
        if not obj.content:
            return {}

        return extract_content_metadata(obj.content)


class BlogPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog posts"""
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = BlogPost
        fields = [
            'title', 'slug', 'description', 'content', 'banner_image',
            'banner_image_alt', 'meta_description', 'meta_keywords',
            'tags', 'is_published', 'is_featured', 'author_name',
            'author_bio', 'author_avatar'
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'meta_description': {'required': False},
            'meta_keywords': {'required': False},
            'banner_image_alt': {'required': False},
            'author_name': {'required': False},
            'author_bio': {'required': False},
            'author_avatar': {'required': False},
        }

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])

        # Create the blog post
        blog_post = BlogPost.objects.create(**validated_data)

        # Handle tags
        if tags_data:
            tag_objects = []
            for tag_name in tags_data:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name.strip(),
                    defaults={'slug': tag_name.strip().lower().replace(' ', '-')}
                )
                tag_objects.append(tag)
            blog_post.tags.set(tag_objects)

        return blog_post

    def validate_content(self, value):
        """Validate content length and format"""
        if not value or len(value.strip()) < 100:
            raise serializers.ValidationError("Content must be at least 100 characters long")
        return value

    def validate_title(self, value):
        """Validate title length"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long")
        return value


class BlogPostUpdateSerializer(BlogPostCreateSerializer):
    """Serializer for updating blog posts"""

    class Meta(BlogPostCreateSerializer.Meta):
        fields = BlogPostCreateSerializer.Meta.fields + ['id']
        extra_kwargs = {
            **BlogPostCreateSerializer.Meta.extra_kwargs,
            'title': {'required': False},
            'description': {'required': False},
            'content': {'required': False},
        }

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)

        # Update the blog post fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Handle tags if provided
        if tags_data is not None:
            tag_objects = []
            for tag_name in tags_data:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name.strip(),
                    defaults={'slug': tag_name.strip().lower().replace(' ', '-')}
                )
                tag_objects.append(tag)
            instance.tags.set(tag_objects)

        return instance


class BlogPostAdminSerializer(BlogPostDetailSerializer):
    """Serializer for admin with additional fields"""

    class Meta(BlogPostDetailSerializer.Meta):
        fields = BlogPostDetailSerializer.Meta.fields + [
            'is_published', 'is_featured', 'meta_description', 'meta_keywords',
            'banner_image_alt', 'published_at'
        ]


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['name', 'email', 'content', 'parent']
    
    def create(self, validated_data):
        # Auto-approve comments for now (can be changed to require approval)
        validated_data['is_approved'] = True
        return super().create(validated_data)


class BlogReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogReaction
        fields = ['id', 'reaction_type', 'created_at']
