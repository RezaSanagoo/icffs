
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, StoryViewSet, SettingsAPIView, StoryInsightsOptionListView, CSRFTokenView

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'stories', StoryViewSet, basename='story')


# Settings endpoints
settings_patterns = [
    path('csrf-token/', CSRFTokenView.as_view(), name='csrf-token'),
    path('settings/', SettingsAPIView.as_view(), name='settings'),
    path('story-insights-options/', StoryInsightsOptionListView.as_view(), name='story-insights-options'),
]

urlpatterns = router.urls + settings_patterns

