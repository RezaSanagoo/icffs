
import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import os
import tempfile
from django.core.files import File
from django.core.files.base import ContentFile

from .utils import generate_video_thumbnail


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
    post_count = models.IntegerField(default=0)
    reach_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_post_image = models.ImageField(upload_to='last_post_images/', blank=True, null=True)
    viewvers = models.ImageField(upload_to='last_post_images/', blank=True, null=True)
    viewvers2 = models.ImageField(upload_to='last_post_images/', blank=True, null=True)

    

    class Meta:
        ordering = ['-created_at']
        verbose_name = "پروفایل"
        verbose_name_plural = "پروفایل‌ها"

    def __str__(self):
        return self.username

class Highlight(models.Model):
    """Highlight model for saved stories."""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='highlights')
    title = models.CharField(max_length=255)
    cover_image = models.ImageField(upload_to='highlights/covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "هایلایت"
        verbose_name_plural = "هایلایت‌ها"

    def __str__(self):
        return f"{self.profile.username} - {self.title}"

class Story(models.Model):
    """Story model for uploaded stories."""

    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        'Profile',
        on_delete=models.CASCADE,
        related_name='stories'
    )
    media = models.FileField(upload_to='stories/')
    thumbnail = models.ImageField(
        upload_to='stories/thumbnails/',
        blank=True,
        null=True
    )
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    duration = models.PositiveIntegerField(
        default=0,
        help_text="Duration in seconds"
    )
    viewcount = models.PositiveIntegerField(
        default=0,
        help_text="Number of views"
    )
    tag = models.CharField(max_length=24, blank=True)
    sticker_taps = models.BooleanField(default=False)
    link_clicks = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-expires_at']),
            models.Index(fields=['profile', '-created_at']),
        ]
        verbose_name = "استوری"
        verbose_name_plural = "استوری‌ها"

    def __str__(self):
        return f"{self.profile.username} - {self.media_type} - {self.created_at}"

    def is_expired(self):
        """Check if story has expired."""
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        """Set expiration time and generate thumbnail for video stories."""
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(
                hours=getattr(settings, 'STORY_EXPIRATION_HOURS', 24)
            )

        should_generate_thumbnail = False

        if self.pk:
            old_story = Story.objects.filter(pk=self.pk).first()
            if old_story and old_story.media != self.media:
                should_generate_thumbnail = True
        else:
            should_generate_thumbnail = True

        super().save(*args, **kwargs)

        if (
            self.media
            and self.media_type == 'video'
            and (should_generate_thumbnail or not self.thumbnail)
        ):
            thumbnail_file = generate_video_thumbnail(self.media)

            if thumbnail_file:
                self.thumbnail.save(
                    thumbnail_file.name,
                    thumbnail_file,
                    save=False
                )
                super().save(update_fields=['thumbnail'])


class StoryMentionTarget(models.Model):
    """
    Reusable mention targets for stories.
    Admin can create/select these targets for story mention popup.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=80, unique=True)
    display_name = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(
        upload_to='story/mention-targets/',
        blank=True,
        null=True
    )
    url = models.URLField(
        blank=True,
        help_text="Optional external/profile URL"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['username']
        verbose_name = "هدف منشن"
        verbose_name_plural = "اهداف منشن"

    def __str__(self):
        if self.display_name:
            return f"{self.display_name} (@{self.username})"
        return f"@{self.username}"


class StoryInteractiveElement(models.Model):
    """
    Clickable interactive element on story.

    Backend only stores element position.
    Hitbox size and popup position are handled by frontend.
    """

    TYPE_LINK = 'link'
    TYPE_MENTION = 'mention'

    ELEMENT_TYPE_CHOICES = [
        (TYPE_LINK, 'Visit Link'),
        (TYPE_MENTION, 'Mention/Profile'),
    ]

    POSITION_CUSTOM = 'custom'
    POSITION_TOP = 'top'
    POSITION_CENTER = 'center'
    POSITION_BOTTOM = 'bottom'

    POSITION_PRESET_CHOICES = [
        (POSITION_CUSTOM, 'Custom'),
        (POSITION_TOP, 'Top'),
        (POSITION_CENTER, 'Center'),
        (POSITION_BOTTOM, 'Bottom'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='interactive_elements'
    )

    element_type = models.CharField(
        max_length=20,
        choices=ELEMENT_TYPE_CHOICES
    )

    is_active = models.BooleanField(default=True)

    title = models.CharField(
        max_length=80,
        blank=True,
        help_text="Optional custom title. For link defaults to Visit Link."
    )

    url = models.URLField(
        blank=True,
        help_text="Required for Visit Link type."
    )

    mention_target = models.ForeignKey(
        StoryMentionTarget,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='story_elements',
        help_text="Required for Mention/Profile type."
    )

    position_preset = models.CharField(
        max_length=30,
        choices=POSITION_PRESET_CHOICES,
        default=POSITION_CUSTOM
    )

    # Top-left position of fixed-size hitbox, in percentage
    x = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=12,
        help_text="Hitbox left position in percent. Example: 12"
    )

    y = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=63,
        help_text="Hitbox top position in percent. Example: 63"
    )

    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "عنصر تعاملی"
        verbose_name_plural = "عناصر تعاملی"

    def __str__(self):
        return f"{self.story_id} - {self.element_type}"

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.element_type == self.TYPE_LINK and not self.url:
            raise ValidationError({
                'url': 'URL is required for Visit Link elements.'
            })

        if self.element_type == self.TYPE_MENTION and not self.mention_target:
            raise ValidationError({
                'mention_target': 'Mention target is required for Mention elements.'
            })

    def save(self, *args, **kwargs):
        if self.position_preset != self.POSITION_CUSTOM:
            self.apply_position_preset()

        super().save(*args, **kwargs)

    def apply_position_preset(self):
        """
        Only position is controlled by backend.
        Size is fixed in frontend.
        """
        presets = {
            self.POSITION_TOP: {
                'x': 20,
                'y': 15,
            },
            self.POSITION_CENTER: {
                'x': 20,
                'y': 44,
            },
            self.POSITION_BOTTOM: {
                'x': 15,
                'y': 72,
            },
        }

        selected = presets.get(self.position_preset)

        if not selected:
            return

        self.x = selected['x']
        self.y = selected['y']

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
        verbose_name = "استوری"
        verbose_name_plural = "استوری‌ها"

    def __str__(self):
        viewer = self.viewer_name or 'anonymous'
        return f"{self.story.id} - {viewer} - {self.created_at}"

class Viewer(models.Model):
    name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='viewers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
