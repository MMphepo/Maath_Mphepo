from rest_framework import serializers
from .models import SkillCategory, Skill, SkillEndorsement, Certification


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'slug', 'description', 'icon_class', 'order']


class SkillEndorsementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillEndorsement
        fields = [
            'id', 'endorser_name', 'endorser_position', 'endorser_company',
            'endorser_avatar', 'endorsement_text', 'created_at'
        ]


class SkillSerializer(serializers.ModelSerializer):
    category = SkillCategorySerializer(read_only=True)
    endorsements = serializers.SerializerMethodField()
    
    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'category', 'icon_class', 'description',
            'proficiency', 'proficiency_percentage', 'years_experience',
            'is_featured', 'endorsements', 'created_at'
        ]
    
    def get_endorsements(self, obj):
        endorsements = obj.endorsements.filter(is_featured=True)[:2]
        return SkillEndorsementSerializer(endorsements, many=True).data


class CertificationSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization', 'description',
            'issue_date', 'expiry_date', 'is_expired', 'credential_id',
            'credential_url', 'badge_image', 'skills', 'created_at'
        ]


class SkillsByCategorySerializer(serializers.Serializer):
    category = SkillCategorySerializer()
    skills = SkillSerializer(many=True)
