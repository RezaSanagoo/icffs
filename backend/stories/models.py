
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings

# --- Viewer model ---
class Viewer(models.Model):
    name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='viewers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# --- StoryInsightsOption model for customizable analytics fields ---
class StoryInsightsOption(models.Model):
    """Customizable analytics option for story insights."""
    FIELD_CHOICES = [
        ('impressions', 'Impressions'),
        ('reach', 'Reach'),
        ('likes', 'Likes'),
        ('replies', 'Replies'),
        ('shares', 'Shares'),
        ('navigation_total', 'Navigation Total'),
        ('forward', 'Forward'),
        ('next_story', 'Next Story'),
        ('exited', 'Exited'),
        ('profile_activity', 'Profile Activity'),
        ('follows', 'Follows'),
    ]
    name = models.CharField(max_length=64, help_text="نمایش در داشبورد")
    key = models.CharField(max_length=32, choices=FIELD_CHOICES, unique=True)
    percent_of_views = models.PositiveIntegerField(default=100, help_text="درصد نسبت به ویو")
    order = models.PositiveIntegerField(default=0, help_text="ترتیب نمایش")
    enabled = models.BooleanField(default=True, help_text="فعال باشد؟")

    class Meta:
        ordering = ['order']
        verbose_name = 'Story Insights Option'
        verbose_name_plural = 'Story Insights Options'

    def __str__(self):
        return f"{self.name} ({self.key})"

# --- StoryInsightsOption model for customizable analytics fields ---
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings


class Profile(models.Model):
    """Profile model representing the page owner."""
    username = models.CharField(max_length=150, unique=True)
    display_name = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True)
    followers_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def posts_count(self):
        """Calculate posts count from stories."""
        return self.stories.count()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.username


class Story(models.Model):
    """Story model for uploaded stories."""
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='stories')
    media = models.FileField(upload_to='stories/')
    thumbnail = models.ImageField(upload_to='stories/thumbnails/', blank=True, null=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-expires_at']),
            models.Index(fields=['profile', '-created_at']),
        ]

    def __str__(self):
        return f"{self.profile.username} - {self.media_type} - {self.created_at}"

    def is_expired(self):
        """Check if story has expired."""
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        """Set expiration time on save if not set."""
        if not self.expires_at:
            from django.utils import timezone
            from datetime import timedelta
            from django.conf import settings
            self.expires_at = timezone.now() + timedelta(
                hours=getattr(settings, 'STORY_EXPIRATION_HOURS', 24)
            )
        super().save(*args, **kwargs)


class StoryView(models.Model):
    """Story view tracking model."""
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='views')
    viewer_name = models.CharField(max_length=255, null=True, blank=True, default='anonymous')
    viewer_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['story', '-created_at']),
            models.Index(fields=['story', 'viewer_ip', 'viewer_name']),
        ]

    def __str__(self):
        viewer = self.viewer_name or 'anonymous'
        return f"{self.story.id} - {viewer} - {self.created_at}"

