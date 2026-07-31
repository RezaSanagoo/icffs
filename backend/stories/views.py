from django.db.migrations import serializer
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q
from .models import Highlight, Profile, Story, StoryView, StoryInsightsOption, StoryInteractiveElement
from .serializers import (
    ProfileSerializer,
    StorySerializer,
    StoryListSerializer,
    StoryViewSerializer,
    StoryInsightsSerializer,
    HighlightSerializer,
)
from rest_framework.views import APIView

# Endpoint: لیست گزینه‌های StoryInsightsOption
from rest_framework.permissions import AllowAny

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
    permission_classes = [AllowAny]
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
    
    def get_highlight_queryset(self):
        """Return highlights for the active profile."""
        profile_id = self.request.session.get('active_profile_id')
        if profile_id:
            try:
                return Highlight.objects.filter(profile_id=profile_id)
            except (ValueError, Profile.DoesNotExist):
                pass
        profile = Profile.objects.first()
        if profile:
            return Highlight.objects.filter(profile_id=profile.id)
        return Highlight.objects.none()

    @action(detail=False, methods=['get'])
    def highlights(self, request):
        """Return all highlights for the active profile."""
        queryset = self.get_highlight_queryset()
        serializer = HighlightSerializer(queryset, many=True, context={'request': request})
        return Response({'highlights': serializer.data})

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
    permission_classes = [AllowAny]
    """ViewSet for Story."""
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Return stories. List only non-expired, but insights can access any story."""
        return Story.objects.all().order_by('-created_at')

    def _get_active_profile(self, request):
        """Return the active profile from session or fall back to the first profile."""
        profile_id = request.session.get('active_profile_id')
        if profile_id:
            try:
                return Profile.objects.get(id=profile_id)
            except Profile.DoesNotExist:
                pass
        return Profile.objects.first()
    
    def list(self, request, *args, **kwargs):
        """List stories endpoint - only non-expired."""
        queryset = self.get_queryset().filter(expires_at__gt=timezone.now())
        profile = self._get_active_profile(request)
        if profile is not None:
            queryset = queryset.filter(profile=profile)
        serializer = StorySerializer(queryset, many=True, context={'request': request})
        return Response({'stories': serializer.data})
    
    @action(detail=False, methods=['get'])
    def archive(self, request):
        """Get all stories (including expired) for archive view."""
        queryset = self.get_queryset()
        profile = self._get_active_profile(request)

        if profile is not None:
            queryset = queryset.filter(profile=profile)

        queryset = queryset.order_by('created_at')  # oldest to newest

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
            print("processed_media:", processed_media, type(processed_media), getattr(processed_media, "name", None))
            print("thumbnail:", thumbnail, type(thumbnail), getattr(thumbnail, "name", None), bool(thumbnail))

        except Exception as e:
            return Response(
                {'error': f'Media processing failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create story
        story = Story(
            profile=profile,
            media_type='video',
        )

        if processed_media:
            story.media.save(processed_media.name, processed_media, save=False)

        if thumbnail:
            story.thumbnail.save(thumbnail.name, thumbnail, save=False)

        story.save()

        serializer = self.get_serializer(story)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

        
        serializer = self.get_serializer(story)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='interaction')
    def interaction(self, request, pk=None):
        """Track story interactive element tap/click."""
        story = self.get_object()
        element_id = request.data.get('element_id')

        element = StoryInteractiveElement.objects.filter(
            id=element_id,
            story=story,
            is_active=True,
        ).first()

        if not element:
            return Response(
                {'error': 'Interactive element not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if element.element_type == StoryInteractiveElement.TYPE_LINK:
            story.link_clicks = True
            story.save(update_fields=['link_clicks'])
        else:
            story.sticker_taps = True
            story.save(update_fields=['sticker_taps'])

        return Response({
            'status': 'interaction registered',
            'elementType': element.element_type,
        })
        
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
        serializer = StoryInsightsSerializer(story, context={'request': request})
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

