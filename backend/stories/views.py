from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q
from django.middleware.csrf import get_token
from .models import Profile, Story, StoryView, StoryInsightsOption
from .serializers import (
    ProfileSerializer,
    StorySerializer,
    StoryListSerializer,
    StoryViewSerializer,
    StoryInsightsSerializer,
)
from rest_framework.views import APIView

# Endpoint: لیست گزینه‌های StoryInsightsOption
from rest_framework.permissions import AllowAny

class CSRFTokenView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get CSRF token for POST requests."""
        token = get_token(request)
        return Response({'csrfToken': token})

class StoryInsightsOptionListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        options = StoryInsightsOption.objects.all()
        data = [
            {
                'id': o.id,
                'name': o.name,
                'key': o.key,
                'percent_of_views': o.percent_of_views,
                'order': o.order,
                'enabled': o.enabled,
            }
            for o in options
        ]
        return Response({'options': data})
from .utils import process_video_with_thumbnail



class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Profile."""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get the current user's profile. Adjust logic as needed."""
        # For demonstration, return the first profile (customize as needed)
        profile = Profile.objects.first()
        serializer = self.get_serializer(profile)
        return Response({'profile': serializer.data})
    

    def get_queryset(self):
        """Return all profiles for admin and selection."""
        return Profile.objects.all()

    @action(detail=False, methods=['get'])
    def list_profiles(self, request):
        """Get all profiles (for multi-page support)."""
        queryset = Profile.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'profiles': serializer.data})

    @action(detail=False, methods=['post'])
    def set_active(self, request):
        """Set active profile in session."""
        profile_id = request.data.get('profile_id')
        try:
            profile = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)
        request.session['active_profile_id'] = str(profile.id)
        return Response({'status': 'active profile set', 'profile_id': profile.id})

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active profile from session."""
        profile_id = request.session.get('active_profile_id')
        if profile_id:
            try:
                profile = Profile.objects.get(id=profile_id)
            except Profile.DoesNotExist:
                profile = Profile.objects.first()
        else:
            profile = Profile.objects.first()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class StoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Story."""
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Return stories. List only non-expired, but insights can access any story."""
        return Story.objects.all().order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """List stories endpoint - only non-expired."""
        queryset = self.get_queryset().filter(expires_at__gt=timezone.now())
        serializer = StorySerializer(queryset, many=True, context={'request': request})
        return Response({'stories': serializer.data})
    
    @action(detail=False, methods=['get'])
    def archive(self, request):
        """Get all stories (including expired) for archive view."""
        queryset = self.get_queryset()
        serializer = StorySerializer(queryset, many=True, context={'request': request})
        return Response({'stories': serializer.data})
    
    def create(self, request, *args, **kwargs):
        """Create a new story for active profile with media processing."""
        profile_id = request.session.get('active_profile_id')
        if profile_id:
            try:
                profile = Profile.objects.get(id=profile_id)
            except Profile.DoesNotExist:
                profile = Profile.objects.first()
        else:
            profile = Profile.objects.first()
        if not profile:
            profile = Profile.objects.create(
                username='owner',
                display_name='Page Owner',
            )
        
        # Get media file
        media_file = request.FILES.get('media')
        if not media_file:
            return Response(
                {'error': 'Media file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only video stories are supported
        if not media_file.content_type or not media_file.content_type.startswith('video/'):
            return Response(
                {'error': 'Only video stories are supported'},
                status=status.HTTP_400_BAD_REQUEST
            )
        media_type = 'video'
        
        # Process media
        try:
            processed_media, thumbnail = process_video_with_thumbnail(media_file)
        except Exception as e:
            return Response(
                {'error': f'Media processing failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create story
        story = Story.objects.create(
            profile=profile,
            media=processed_media,
            thumbnail=thumbnail,
            media_type=media_type,
        )
        
        serializer = self.get_serializer(story)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """Register a story view."""
        story = self.get_object()
        
        # Get viewer info
        viewer_name = request.data.get('viewer_name', 'anonymous')
        viewer_ip = self._get_client_ip(request)
        
        # Create view (or update if exists - but we track all views)
        StoryView.objects.create(
            story=story,
            viewer_name=viewer_name if viewer_name else 'anonymous',
            viewer_ip=viewer_ip,
        )
        
        return Response({'status': 'view registered'}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def insights(self, request, pk=None):
        """Get story insights (only if story belongs to active profile)."""
        profile_id = request.session.get('active_profile_id')
        story = self.get_object()
        if profile_id and str(story.profile_id) != str(profile_id):
            return Response({'error': 'Access denied: story does not belong to active profile.'}, status=403)
        serializer = StoryInsightsSerializer(story)
        return Response(serializer.data)
    
    def _get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


from rest_framework.views import APIView

class SettingsAPIView(APIView):
    """API view for settings."""
    def get(self, request):
        from django.conf import settings as django_settings
        return Response({
            'settings': {
                'storyInsightsVisible': True,
                'storyExpirationDuration': getattr(
                    django_settings, 'STORY_EXPIRATION_HOURS', 24
                ),
                'compressionLevel': 'medium',
            }
        })

    def put(self, request):
        return Response({
            'settings': request.data.get('settings', {})
        })

