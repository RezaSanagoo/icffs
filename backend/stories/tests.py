from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, Story, StoryView, Highlight
from .serializers import ProfileSerializer
import tempfile
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile


def create_test_image():
    """Create a test image file."""
    img = Image.new('RGB', (2000, 2000), color='red')
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return SimpleUploadedFile("test_image.jpg", buffer.read(), content_type="image/jpeg")


class ProfileAPITestCase(TestCase):
    """Test Profile API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.profile = Profile.objects.create(
            username='testuser',
            display_name='Test User',
            followers_count=100,
            following_count=50,
            post_count=33,
            reach_count=44,
        )
    
    def test_get_profile(self):
        """Test getting active profile from the endpoint used by the frontend."""
        response = self.client.get('/api/profile/active/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['fullName'], 'Test User')

    def test_serializer_exposes_frontend_profile_fields(self):
        """Ensure serializer exposes the frontend-friendly field names used by the app."""
        serializer = ProfileSerializer(self.profile)
        data = serializer.data

        self.assertEqual(data['fullName'], 'Test User')
        self.assertEqual(data['postsCount'], 33)
        self.assertEqual(data['followersCount'], 100)
        self.assertEqual(data['followingCount'], 50)
        self.assertEqual(data['postCount'], 33)
        self.assertEqual(data['reachCount'], 44)
        self.assertEqual(data['lastPostImage'], '')

    def test_serializer_exposes_highlights(self):
        """Ensure highlights are serialized for the frontend profile view."""
        Highlight.objects.create(profile=self.profile, title='Summer')

        serializer = ProfileSerializer(self.profile)
        data = serializer.data

        self.assertEqual(len(data['highlights']), 1)
        self.assertEqual(data['highlights'][0]['title'], 'Summer')
        self.assertEqual(data['highlights'][0]['coverImage'], '')


class StoryAPITestCase(TestCase):
    """Test Story API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.profile = Profile.objects.create(
            username='testuser',
            display_name='Test User',
        )
        self.story = Story.objects.create(
            profile=self.profile,
            media=create_test_image(),
            media_type='image',
            expires_at=timezone.now() + timedelta(hours=24),
        )
    
    def test_list_stories(self):
        """Test listing stories."""
        response = self.client.get('/api/stories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stories', response.data)
        self.assertEqual(len(response.data['stories']), 1)

    def test_archive_returns_only_active_profile_stories_with_duration(self):
        """Archive should return only the active profile's stories and include duration."""
        other_profile = Profile.objects.create(username='otheruser', display_name='Other User')
        other_story = Story.objects.create(
            profile=other_profile,
            media=create_test_image(),
            media_type='image',
            expires_at=timezone.now() + timedelta(hours=24),
            duration=15,
        )
        self.story.duration = 7
        self.story.save(update_fields=['duration'])

        self.client.session['active_profile_id'] = str(self.profile.id)
        self.client.session.save()

        response = self.client.get('/api/stories/archive/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stories', response.data)
        story_ids = [s['id'] for s in response.data['stories']]
        self.assertIn(str(self.story.id), story_ids)
        self.assertNotIn(str(other_story.id), story_ids)
        self.assertGreaterEqual(len(response.data['stories']), 1)
        self.assertEqual(response.data['stories'][0]['duration'], 7)
    
    def test_list_expired_stories(self):
        """Test that expired stories are not listed."""
        expired_story = Story.objects.create(
            profile=self.profile,
            media=create_test_image(),
            media_type='image',
            expires_at=timezone.now() - timedelta(hours=1),
        )
        response = self.client.get('/api/stories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        story_ids = [s['id'] for s in response.data['stories']]
        self.assertIn(str(self.story.id), story_ids)
        self.assertNotIn(str(expired_story.id), story_ids)
    
    def test_create_story(self):
        """Test creating a story."""
        image = create_test_image()
        response = self.client.post('/api/stories/', {'media': image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIn('mediaUrl', response.data)
    
    def test_register_view(self):
        """Test registering a story view."""
        response = self.client.post(
            f'/api/stories/{self.story.id}/view/',
            {'viewer_name': 'test_viewer'}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StoryView.objects.count(), 1)
        view = StoryView.objects.first()
        self.assertEqual(view.story, self.story)
        self.assertEqual(view.viewer_name, 'test_viewer')
    
    def test_register_multiple_views(self):
        """Test that multiple views are tracked."""
        # Register multiple views
        self.client.post(f'/api/stories/{self.story.id}/view/', {'viewer_name': 'viewer1'})
        self.client.post(f'/api/stories/{self.story.id}/view/', {'viewer_name': 'viewer2'})
        self.client.post(f'/api/stories/{self.story.id}/view/', {'viewer_name': 'viewer1'})
        
        self.assertEqual(StoryView.objects.count(), 3)
    
    def test_get_insights(self):
        """Test getting story insights."""
        # Create some views
        StoryView.objects.create(
            story=self.story,
            viewer_name='viewer1',
            viewer_ip='192.168.1.1',
        )
        StoryView.objects.create(
            story=self.story,
            viewer_name='viewer2',
            viewer_ip='192.168.1.2',
        )
        StoryView.objects.create(
            story=self.story,
            viewer_name='viewer1',
            viewer_ip='192.168.1.1',
        )
        
        response = self.client.get(f'/api/stories/{self.story.id}/insights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('insights', response.data)
        
        insights = response.data['insights']
        self.assertEqual(insights['total_views'], 3)
        self.assertEqual(insights['unique_viewers'], 2)
        self.assertEqual(insights['reach'], 2)
        self.assertEqual(insights['impressions'], 3)
        self.assertIn('views_timeline', insights)
        self.assertIn('viewers', insights)


class StoryInsightsTestCase(TestCase):
    """Test story insights calculations."""
    
    def setUp(self):
        self.profile = Profile.objects.create(username='testuser')
        self.story = Story.objects.create(
            profile=self.profile,
            media=create_test_image(),
            media_type='image',
            expires_at=timezone.now() + timedelta(hours=24),
        )
    
    def test_unique_viewers_calculation(self):
        """Test unique viewers calculation."""
        # Same IP, different names = 2 unique
        StoryView.objects.create(
            story=self.story,
            viewer_name='user1',
            viewer_ip='192.168.1.1',
        )
        StoryView.objects.create(
            story=self.story,
            viewer_name='user2',
            viewer_ip='192.168.1.1',
        )
        # Same IP and name = not unique
        StoryView.objects.create(
            story=self.story,
            viewer_name='user1',
            viewer_ip='192.168.1.1',
        )
        
        views = StoryView.objects.filter(story=self.story)
        unique_count = views.values('viewer_ip', 'viewer_name').distinct().count()
        self.assertEqual(unique_count, 2)


class SettingsAPITestCase(TestCase):
    """Test Settings API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_get_settings(self):
        """Test getting settings."""
        response = self.client.get('/api/settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('settings', response.data)
        settings = response.data['settings']
        self.assertIn('storyInsightsVisible', settings)
        self.assertIn('storyExpirationDuration', settings)
        self.assertIn('compressionLevel', settings)

