from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Viewer

@admin.register(Viewer)
class ViewerAdmin(admin.ModelAdmin):
    list_display = ['name', 'avatar', 'created_at']
    search_fields = ['name']
from .models import Profile, Story, StoryView, StoryInsightsOption

@admin.register(StoryInsightsOption)
class StoryInsightsOptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'percent_of_views', 'order', 'enabled']
    list_editable = ['percent_of_views', 'order', 'enabled']
    ordering = ['order']
    search_fields = ['name', 'key']
    list_filter = ['enabled']


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['username', 'display_name', 'followers_count', 'following_count', 'is_verified']
    list_editable = ['is_verified', 'followers_count', 'following_count']
    search_fields = ['username', 'display_name']


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile', 'media_type', 'media_preview', 'created_at', 'expires_at', 'is_expired', 'view_count', 'insights_link']
    list_filter = ['media_type', 'created_at', 'expires_at']
    readonly_fields = ['id', 'created_at', 'expires_at', 'media_preview']
    search_fields = ['id', 'profile__username']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Story Information', {
            'fields': ('id', 'profile', 'media_type', 'media', 'media_preview')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at')
        }),
    )
    
    def media_preview(self, obj):
        """Display media preview in admin."""
        if obj.media:
            if obj.media_type == 'image':
                return format_html(
                    '<img src="{}" style="max-width: 200px; max-height: 200px;" />',
                    obj.media.url
                )
            else:
                return format_html(
                    '<video width="200" controls><source src="{}" type="video/mp4"></video>',
                    obj.media.url
                )
        return "No media"
    media_preview.short_description = 'Preview'
    
    def is_expired(self, obj):
        """Show if story is expired."""
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'
    
    def view_count(self, obj):
        """Show total view count."""
        return obj.views.count()
    view_count.short_description = 'Views'
    
    def insights_link(self, obj):
        """Link to insights API endpoint."""
        url = f'/api/stories/{obj.pk}/insights/'
        return format_html('<a href="{}" target="_blank">View Insights</a>', url)
    insights_link.short_description = 'Insights'


@admin.register(StoryView)
class StoryViewAdmin(admin.ModelAdmin):
    list_display = ['story', 'viewer_name', 'viewer_ip', 'created_at']
    list_filter = ['created_at', 'viewer_name']
    search_fields = ['story__id', 'viewer_name', 'viewer_ip']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

