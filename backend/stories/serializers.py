
from rest_framework import serializers

from .models import Viewer, Profile, Viewer, Highlight

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


class HighlightSerializer(serializers.ModelSerializer):
    """Serializer for Highlight model."""
    coverImage = serializers.ImageField(source='cover_image', read_only=True, allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Highlight
        fields = ['id', 'title', 'coverImage', 'createdAt']
        read_only_fields = ['id', 'createdAt']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        cover_image_url = ''
        if instance.cover_image:
            request = self.context.get('request')
            if request:
                cover_image_url = request.build_absolute_uri(instance.cover_image.url)
            else:
                cover_image_url = instance.cover_image.url
        return {
            'id': str(data['id']),
            'title': data['title'],
            'coverImage': cover_image_url,
            'createdAt': data['createdAt'],
        }


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for Profile model."""
    avatar = serializers.ImageField(required=False, allow_null=True)
    fullName = serializers.CharField(source='display_name', read_only=True)
    isVerified = serializers.BooleanField(source='is_verified', read_only=True)
    postsCount = serializers.IntegerField(source='post_count', read_only=True)
    followersCount = serializers.IntegerField(source='followers_count', read_only=True)
    followingCount = serializers.IntegerField(source='following_count', read_only=True)
    postCount = serializers.IntegerField(source='post_count', read_only=True)
    reachCount = serializers.IntegerField(source='reach_count', read_only=True)
    lastPostImage = serializers.ImageField(source='last_post_image', read_only=True, allow_null=True, required=False)
    highlights = HighlightSerializer(many=True, read_only=True)
    viewerImage = serializers.ImageField(source='viewvers', read_only=True, allow_null=True, required=False)
    viewerImage2 = serializers.ImageField(source='viewvers2', read_only=True, allow_null=True, required=False)

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
            'postCount',
            'reachCount',
            'lastPostImage',
            'highlights',
            'viewerImage',
            'viewerImage2',
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        """Map model fields to API response format."""
        data = super().to_representation(instance)
        avatar_url = ''
        if instance.avatar:
            request = self.context.get('request')
            if request:
                avatar_url = request.build_absolute_uri(instance.avatar.url)
            else:
                avatar_url = instance.avatar.url

        last_post_image_url = ''
        if instance.last_post_image:
            request = self.context.get('request')
            if request:
                last_post_image_url = request.build_absolute_uri(instance.last_post_image.url)
            else:
                last_post_image_url = instance.last_post_image.url

        viewer_image_url = ''
        if instance.viewvers:
            request = self.context.get('request')
            if request:
                viewer_image_url = request.build_absolute_uri(instance.viewvers.url)
            else:
                viewer_image_url = instance.viewvers.url
        viewer2_image_url = ''
        if instance.viewvers2:
            request = self.context.get('request')
            if request:
                viewer2_image_url = request.build_absolute_uri(instance.viewvers2.url)
            else:
                viewer2_image_url = instance.viewvers2.url

        return {
            'id': str(data['id']),
            'username': data['username'],
            'fullName': data.get('fullName', data['username']),
            'avatar': avatar_url,
            'isVerified': data.get('isVerified', False),
            'postsCount': data.get('postsCount', data.get('postCount', 0)),
            'followersCount': data.get('followersCount', 0),
            'followingCount': data.get('followingCount', 0),
            'bio': data.get('bio', ''),
            'postCount': data.get('postCount', data.get('postsCount', 0)),
            'reachCount': data.get('reachCount', 0),
            'lastPostImage': last_post_image_url,
            'highlights': data.get('highlights', []),
            'viewerImage': viewer_image_url,
            'viewerImage2': viewer2_image_url,
        }


from rest_framework import serializers

from .models import Story, StoryInteractiveElement, StoryMentionTarget


class StoryMentionTargetSerializer(serializers.ModelSerializer):
    avatarUrl = serializers.SerializerMethodField()

    class Meta:
        model = StoryMentionTarget
        fields = [
            'id',
            'username',
            'display_name',
            'avatarUrl',
            'url',
        ]

    def get_avatarUrl(self, obj):
        if not obj.avatar:
            return ''

        request = self.context.get('request')

        if request:
            return request.build_absolute_uri(obj.avatar.url)

        return obj.avatar.url


class StoryInteractiveElementSerializer(serializers.ModelSerializer):
    mentionTarget = StoryMentionTargetSerializer(
        source='mention_target',
        read_only=True
    )

    elementType = serializers.CharField(source='element_type', read_only=True)

    class Meta:
        model = StoryInteractiveElement
        fields = [
            'id',
            'elementType',
            'title',
            'url',
            'mentionTarget',
            'x',
            'y',
            'order',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        return {
            'id': str(instance.id),
            'elementType': data['elementType'],
            'title': data['title'],
            'url': data['url'],
            'mentionTarget': data['mentionTarget'],
            'x': float(instance.x),
            'y': float(instance.y),
            'order': instance.order,
        }


class StorySerializer(serializers.ModelSerializer):
    """Serializer for Story model."""

    mediaUrl = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()
    mediaType = serializers.CharField(source='media_type', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    expiresAt = serializers.DateTimeField(source='expires_at', read_only=True)
    duration = serializers.IntegerField(read_only=True)
    viewcount = serializers.IntegerField(read_only=True)
    tag = serializers.CharField(read_only=True)
    stickerTaps = serializers.BooleanField(source='sticker_taps', read_only=True)
    LinkClicks = serializers.BooleanField(source='link_clicks', read_only=True)
    interactiveElements = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id',
            'mediaUrl',
            'thumbnailUrl',
            'mediaType',
            'createdAt',
            'expiresAt',
            'duration',
            'viewcount',
            'tag',
            'stickerTaps',
            'LinkClicks',
            'interactiveElements',
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

        if obj.media and getattr(obj, 'media_type', None) == 'image':
            return self.get_mediaUrl(obj)

        return ''

    def get_interactiveElements(self, obj):
        queryset = obj.interactive_elements.filter(is_active=True).order_by(
            'order',
            'created_at'
        )

        return StoryInteractiveElementSerializer(
            queryset,
            many=True,
            context=self.context
        ).data

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
            'duration': getattr(instance, 'duration', None),
            'viewcount': data['viewcount'],
            'tag': data.get('tag', ''),
            'stickerTaps': data['stickerTaps'],
            'LinkClicks': data['LinkClicks'],
            'interactiveElements': data.get('interactiveElements', []),
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
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        from django.db.models.functions import TruncHour, TruncDay
        
        story = instance
        request = self.context.get('request')
        views = story.views.all()
        
        total_views = views.count()
        
        unique_viewers = views.values('viewer_ip', 'viewer_name').distinct().count()
        
        reach = unique_viewers
        impressions = total_views
        
        now = timezone.now()
        story_age = now - story.created_at
        
        views_timeline = []
        
        if story_age < timedelta(hours=24):
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

        # Random viewers from Viewer table
        viewers_limit = 10

        if total_views > 0:
            viewers_limit = min(total_views, 10)

        random_viewers = Viewer.objects.order_by('?')[:viewers_limit]

        viewers_data = []
        for viewer in random_viewers:
            avatar_url = ''

            if viewer.avatar:
                if request:
                    avatar_url = request.build_absolute_uri(viewer.avatar.url)
                else:
                    avatar_url = viewer.avatar.url

            viewers_data.append({
                'id': viewer.id,
                'name': viewer.name,
                'avatarUrl': avatar_url,
            })
        
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

