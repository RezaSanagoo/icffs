
from rest_framework import serializers
from .models import Viewer, Profile, Story, StoryView

class ViewerSerializer(serializers.ModelSerializer):
    avatarUrl = serializers.SerializerMethodField()

    class Meta:
        model = Viewer
        fields = ['id', 'name', 'avatarUrl']

    def get_avatarUrl(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return ''


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model."""
    avatar = serializers.ImageField(required=False, allow_null=True)
    fullName = serializers.CharField(source='display_name', read_only=True)
    isVerified = serializers.BooleanField(source='is_verified', read_only=True)
    postsCount = serializers.IntegerField(source='posts_count', read_only=True)
    followersCount = serializers.IntegerField(source='followers_count', read_only=True)
    followingCount = serializers.IntegerField(source='following_count', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id',
            'username',
            'fullName',
            'avatar',
            'isVerified',
            'postsCount',
            'followersCount',
            'followingCount',
            'bio',
        ]
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        """Map model fields to API response format."""
        data = super().to_representation(instance)
        # Build full avatar URL
        avatar_url = ''
        if instance.avatar:
            request = self.context.get('request')
            if request:
                avatar_url = request.build_absolute_uri(instance.avatar.url)
            else:
                avatar_url = instance.avatar.url
        
        return {
            'id': str(data['id']),
            'username': data['username'],
            'fullName': data.get('fullName', data['username']),
            'avatar': avatar_url,
            'isVerified': data.get('isVerified', False),
            'postsCount': data.get('postsCount', 0),
            'followersCount': data['followersCount'],
            'followingCount': data['followingCount'],
            'bio': data.get('bio', ''),
        }


class StorySerializer(serializers.ModelSerializer):
    """Serializer for Story model."""
    mediaUrl = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()
    mediaType = serializers.CharField(source='media_type', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    expiresAt = serializers.DateTimeField(source='expires_at', read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id',
            'mediaUrl',
            'thumbnailUrl',
            'mediaType',
            'createdAt',
            'expiresAt',
        ]
        read_only_fields = ['id', 'createdAt', 'expiresAt']
    
    def get_mediaUrl(self, obj):
        """Get full media URL."""
        if obj.media:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.media.url)
            return obj.media.url
        return ''
    
    def get_thumbnailUrl(self, obj):
        """Get thumbnail URL."""
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        # Backward compatibility: for image stories without thumbnail, use media url
        if obj.media and getattr(obj, 'media_type', None) == 'image':
            return self.get_mediaUrl(obj)
        return ''
    
    def to_representation(self, instance):
        """Map model fields to API response format."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'profileId': str(instance.profile.id),
            'mediaUrl': data['mediaUrl'],
            'thumbnailUrl': data['thumbnailUrl'],
            'mediaType': data['mediaType'],
            'createdAt': data['createdAt'],
            'expiresAt': data['expiresAt'],
        }


class StoryListSerializer(serializers.Serializer):
    """Serializer for list of stories."""
    
    def to_representation(self, instance):
        """Return stories list."""
        from django.utils import timezone
        stories = instance.filter(expires_at__gt=timezone.now())
        return {
            'stories': StorySerializer(stories, many=True, context=self.context).data
        }


class StoryViewSerializer(serializers.Serializer):
    """Serializer for story view creation."""
    viewer_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class StoryInsightsSerializer(serializers.Serializer):
    """Serializer for story insights."""
    
    def to_representation(self, instance):
        """Calculate and return insights."""
        import random
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        from django.db.models.functions import TruncHour, TruncDay
        
        story = instance
        views = story.views.all()
        
        # Total views
        total_views = views.count()
        
        # Unique viewers (based on IP + viewer_name combination)
        unique_viewers = views.values('viewer_ip', 'viewer_name').distinct().count()
        
        # Reach = unique viewers
        reach = unique_viewers
        
        # Impressions = total views
        impressions = total_views
        
        # Views timeline (grouped by hour for first 24h, then by day)
        now = timezone.now()
        story_age = now - story.created_at
        
        views_timeline = []
        
        if story_age < timedelta(hours=24):
            # Group by hour for first 24 hours
            hourly_views = (
                views
                .annotate(hour=TruncHour('created_at'))
                .values('hour')
                .annotate(count=Count('id'))
                .order_by('hour')
            )
            views_timeline = [
                {
                    'time': item['hour'].isoformat(),
                    'count': item['count']
                }
                for item in hourly_views
            ]
        else:
            # Group by day for older stories
            daily_views = (
                views
                .annotate(day=TruncDay('created_at'))
                .values('day')
                .annotate(count=Count('id'))
                .order_by('day')
            )
            views_timeline = [
                {
                    'time': item['day'].isoformat(),
                    'count': item['count']
                }
                for item in daily_views
            ]
        
        # Get viewers from story views
        story_viewers = views.values('viewer_name', 'viewer_ip').distinct()[:10]
        
        # Create viewers list with mock avatars for now
        viewers_data = [
            {
                'id': idx,
                'name': v['viewer_name'] or 'Anonymous',
                'avatarUrl': f'https://i.pravatar.cc/150?img={idx}'
            }
            for idx, v in enumerate(story_viewers)
        ]
        
        # Estimate reach breakdown (80% followers, 20% non-followers)
        followers_count = int(reach * 0.8)
        non_followers_count = reach - followers_count

        return {
            'insights': {
                'totalViews': total_views,
                'uniqueViewers': unique_viewers,
                'reach': reach,
                'impressions': impressions,
                'viewsTimeline': views_timeline,
                'viewers': viewers_data,
                'followersReach': followers_count,
                'nonFollowersReach': non_followers_count,
            }
        }

