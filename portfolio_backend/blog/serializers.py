from rest_framework import serializers
from .models import Tag, BlogPost, Comment, BlogReaction


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
    
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ['content', 'comments']
    
    def get_comments(self, obj):
        top_level_comments = obj.get_top_level_comments()
        return CommentSerializer(top_level_comments, many=True, context=self.context).data


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
