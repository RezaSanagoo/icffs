from django import forms
from django.contrib import admin
from django.db import transaction
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from .models import (
    Highlight,
    Profile,
    Story,
    StoryInteractiveElement,
    StoryInsightsOption,
    StoryLinkTarget,
    StoryMentionTarget,
    Viewer,
)


admin.site.site_header = "پنل مدیریت اینستا آنالیتیکس"
admin.site.site_title = "مدیریت اینستا آنالیتیکس"
admin.site.index_title = "داشبورد مدیریت"


class HighlightAdminForm(forms.ModelForm):
    class Meta:
        model = Highlight
        fields = "__all__"
        labels = {
            "profile": "پروفایل",
            "title": "عنوان",
        }


class ProfileAdminForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = "__all__"
        labels = {
            "username": "نام کاربری",
            "display_name": "نام نمایشی",
            "followers_count": "تعداد دنبال‌کنندگان",
            "following_count": "تعداد دنبال‌شوندگان",
            "is_verified": "تأیید شده",
            "viewvers": "تصویر بازدیدکننده اول",
            "viewvers2": "تصویر بازدیدکننده دوم",
            "viewvers3": "تصویر بازدیدکننده سوم",
        }


class StoryMentionTargetAdminForm(forms.ModelForm):
    class Meta:
        model = StoryMentionTarget
        fields = "__all__"
        labels = {
            "username": "نام کاربری",
            "display_name": "نام نمایشی",
            "avatar": "تصویر پروفایل",
            "url": "آدرس",
            "is_active": "فعال",
        }


class StoryLinkTargetAdminForm(forms.ModelForm):
    class Meta:
        model = StoryLinkTarget
        fields = "__all__"
        labels = {
            "title": "عنوان لینک",
            "url": "آدرس لینک",
            "is_active": "فعال",
            "created_at": "تاریخ ایجاد",
        }


class StoryAdminForm(forms.ModelForm):
    class Meta:
        model = Story
        fields = "__all__"
        labels = {
            "id": "شناسه",
            "profile": "پروفایل",
            "media": "رسانه",
            "thumbnail": "تصویر بندانگشتی",
            "media_type": "نوع رسانه",
            "duration": "مدت زمان",
            "viewcount": "تعداد بازدید",
            "tag": "برچسب",
            "sticker_taps": "تعداد لمس استیکر",
            "link_clicks": "تعداد کلیک لینک",
            "created_at": "تاریخ ایجاد",
            "expires_at": "تاریخ انقضا",
        }


class BulkStoryRowForm(forms.Form):
    """Per-story fields shown in the bulk uploader."""

    media = forms.FileField(
        label="Media",
        required=False,
        widget=forms.ClearableFileInput(attrs={"accept": "image/*,video/*"}),
    )
    media_type = forms.ChoiceField(
        label="Media type",
        choices=Story.MEDIA_TYPE_CHOICES,
        required=False,
        initial="image",
    )
    duration = forms.IntegerField(
        label="Duration (seconds)", min_value=0, required=False, initial=5,
    )
    viewcount = forms.IntegerField(
        label="Views", min_value=0, required=False, initial=0,
    )

    def clean(self):
        cleaned_data = super().clean()
        if not self.has_changed():
            return {}
        if not cleaned_data.get("media"):
            self.add_error("media", "Select media for this row.")
        return cleaned_data


class StoryInteractiveElementAdminForm(forms.ModelForm):
    class Meta:
        model = StoryInteractiveElement
        fields = "__all__"
        labels = {
            "element_type": "نوع عنصر",
            "title": "عنوان",
            "url": "آدرس",
            "link_target": "لینک ذخیره‌شده",
            "mention_target": "هدف منشن",
            "position_preset": "جایگاه آماده",
            "x": "مختصات افقی",
            "y": "مختصات عمودی",
            "order": "ترتیب",
            "is_active": "فعال",
        }

    def clean(self):
        cleaned_data = super().clean()

        element_type = cleaned_data.get("element_type")
        url = cleaned_data.get("url")
        link_target = cleaned_data.get("link_target")

        link_element_type = getattr(
            StoryInteractiveElement,
            "TYPE_LINK",
            "link",
        )

        if element_type == link_element_type:
            if link_target:
                cleaned_data["url"] = link_target.url
            elif not url:
                self.add_error(
                    "url",
                    "برای نوع لینک، انتخاب لینک ذخیره‌شده یا وارد کردن آدرس الزامی است.",
                )

        return cleaned_data


@admin.register(Highlight)
class HighlightAdmin(ModelAdmin):
    form = HighlightAdminForm

    list_display = [
        "profile",
        "title",
        "order",
        "created_at",
    ]

    list_editable = [
        "order",
    ]

    search_fields = [
        "profile__username",
        "title",
    ]

    list_filter = [
        "created_at",
        "profile",
    ]

    ordering = [
        "order",
        "-created_at",
    ]

    readonly_fields = [
        "created_at",
    ]

    fieldsets = (
        (
            "اطلاعات هایلایت",
            {
                "fields": (
                    "profile",
                    "title",
                    "cover_image",
                    "order",
                    "created_at",
                )
            },
        ),
    )


@admin.register(Profile)
class ProfileAdmin(ModelAdmin):
    form = ProfileAdminForm

    list_display = [
        "username",
        "display_name",
        "followers_count",
        "following_count",
        "post_count",
        "reach_count",
        "is_verified",
        "created_at",
        "updated_at",
    ]

    list_editable = [
        "display_name",
        "followers_count",
        "following_count",
        "post_count",
        "reach_count",
        "is_verified",
    ]

    search_fields = [
        "username",
        "display_name",
        "bio",
    ]

    ordering = [
        "username",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    fieldsets = (
        (
            "اطلاعات اصلی پروفایل",
            {
                "fields": (
                    "username",
                    "display_name",
                    "bio",
                    "is_verified",
                )
            },
        ),
        (
            "آمار پیج",
            {
                "fields": (
                    "followers_count",
                    "following_count",
                    "post_count",
                    "reach_count",
                )
            },
        ),
        (
            "تصاویر",
            {
                "fields": (
                    "avatar",
                    "last_post_image",
                    "viewvers",
                    "viewvers2",
                    "viewvers3",
                )
            },
        ),
        (
            "اطلاعات سیستمی",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(StoryMentionTarget)
class StoryMentionTargetAdmin(ModelAdmin):
    form = StoryMentionTargetAdminForm

    list_display = [
        "avatar_preview",
        "username_display",
        "display_name_display",
        "url_link",
        "is_active_display",
        "created_at_display",
    ]

    list_filter = [
        "is_active",
        "created_at",
    ]

    search_fields = [
        "username",
        "display_name",
        "url",
    ]

    readonly_fields = [
        "avatar_preview_large",
        "created_at",
    ]

    ordering = [
        "-created_at",
    ]

    fieldsets = (
        (
            "اطلاعات پروفایل",
            {
                "fields": (
                    "username",
                    "display_name",
                    "avatar",
                    "avatar_preview_large",
                    "url",
                    "is_active",
                )
            },
        ),
        (
            "اطلاعات سیستمی",
            {
                "fields": (
                    "created_at",
                )
            },
        ),
    )

    @admin.display(description="آواتار")
    def avatar_preview(self, obj):
        if not obj.avatar:
            return "-"

        return format_html(
            '<img src="{}" style="width:36px;height:36px;border-radius:999px;object-fit:cover;" />',
            obj.avatar.url,
        )

    @admin.display(description="پیش‌نمایش آواتار")
    def avatar_preview_large(self, obj):
        if not obj.avatar:
            return "-"

        return format_html(
            '<img src="{}" style="width:96px;height:96px;border-radius:999px;object-fit:cover;" />',
            obj.avatar.url,
        )

    @admin.display(description="نام کاربری", ordering="username")
    def username_display(self, obj):
        return obj.username

    @admin.display(description="نام نمایشی", ordering="display_name")
    def display_name_display(self, obj):
        return obj.display_name or "-"

    @admin.display(description="آدرس")
    def url_link(self, obj):
        if not obj.url:
            return "-"

        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">{}</a>',
            obj.url,
            obj.url,
        )

    @admin.display(description="فعال", ordering="is_active", boolean=True)
    def is_active_display(self, obj):
        return obj.is_active

    @admin.display(description="تاریخ ایجاد", ordering="created_at")
    def created_at_display(self, obj):
        return obj.created_at


@admin.register(StoryLinkTarget)
class StoryLinkTargetAdmin(ModelAdmin):
    form = StoryLinkTargetAdminForm

    list_display = [
        "title",
        "url_link",
        "is_active",
        "created_at",
    ]

    list_filter = [
        "is_active",
        "created_at",
    ]

    search_fields = [
        "title",
        "url",
    ]

    list_editable = [
        "is_active",
    ]

    readonly_fields = [
        "created_at",
    ]

    ordering = [
        "title",
    ]

    fieldsets = (
        (
            "اطلاعات لینک",
            {
                "fields": (
                    "title",
                    "url",
                    "is_active",
                )
            },
        ),
        (
            "اطلاعات سیستمی",
            {
                "fields": (
                    "created_at",
                )
            },
        ),
    )

    @admin.display(description="آدرس لینک")
    def url_link(self, obj):
        if not obj.url:
            return "-"

        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">{}</a>',
            obj.url,
            obj.url,
        )


class StoryInteractiveElementInline(TabularInline):
    model = StoryInteractiveElement
    form = StoryInteractiveElementAdminForm
    extra = 0

    autocomplete_fields = [
        "link_target",
        "mention_target",
    ]

    fields = [
        "element_type",
        "title",
        "url",
        "link_target",
        "mention_target",
        "position_preset",
        "x",
        "y",
        "order",
        "is_active",
    ]

    verbose_name = "عنصر تعاملی"
    verbose_name_plural = "عناصر تعاملی"


@admin.register(Story)
class StoryAdmin(ModelAdmin):
    form = StoryAdminForm
    change_list_template = "admin/stories/story/change_list.html"

    list_display = [
        "preview",
        "profile_display",
        "media_type_display",
        "viewcount_display",
        "created_at_display",
    ]

    list_filter = [
        "media_type",
        "created_at",
    ]

    search_fields = [
        "profile__username",
        "tag",
    ]

    readonly_fields = [
        "id",
        "preview_large",
        "thumbnail_preview",
    ]

    inlines = [
        StoryInteractiveElementInline,
    ]

    ordering = [
        "-created_at",
    ]

    fieldsets = (
        (
            "اطلاعات استوری",
            {
                "fields": (
                    "id",
                    "profile",
                    "media",
                    "preview_large",
                    "thumbnail",
                    "thumbnail_preview",
                    "media_type",
                )
            },
        ),
        (
            "آمار و اطلاعات تکمیلی",
            {
                "fields": (
                    "duration",
                    "viewcount",
                    "tag",
                    "sticker_taps",
                    "link_clicks",
                    "created_at",
                )
            },
        ),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "bulk-add/",
                self.admin_site.admin_view(self.bulk_add_view),
                name="stories_story_bulk_add",
            ),
        ]
        return custom_urls + urls

    def bulk_add_view(self, request):
        from django.forms import formset_factory

        BulkStoryFormSet = formset_factory(
            BulkStoryRowForm,
            extra=2,
            min_num=1,
            validate_min=True,
        )

        if request.method == "POST":
            profile_id = request.POST.get("profile")
            profile = Profile.objects.filter(pk=profile_id).first()
            formset = BulkStoryFormSet(request.POST, request.FILES, prefix="stories")

            if profile and formset.is_valid():
                created_count = sum(
                    1 for row in formset.cleaned_data if row.get("media")
                )
                with transaction.atomic():
                    for row in formset.cleaned_data:
                        if not row.get("media"):
                            continue
                        story = Story(
                            profile=profile,
                            media=row["media"],
                            media_type=row.get("media_type") or "image",
                            duration=(
                                row.get("duration")
                                if row.get("duration") is not None
                                else 5
                            ),
                            viewcount=row.get("viewcount") or 0,
                            tag="",
                            sticker_taps=False,
                            link_clicks=False,
                        )
                        story.save()

                self.message_user(
                    request,
                    f"{created_count} استوری برای «{profile}» با موفقیت اضافه شد.",
                )
                return HttpResponseRedirect(
                    reverse("admin:stories_story_changelist")
                )
        else:
            formset = BulkStoryFormSet(prefix="stories")

        context = {
            **self.admin_site.each_context(request),
            "title": "افزودن گروهی استوری",
            "opts": self.model._meta,
            "formset": formset,
            "profiles": Profile.objects.all(),
            "selected_profile": request.POST.get("profile", ""),
            "profile_error": "انتخاب پروفایل الزامی است." if request.method == "POST" and not request.POST.get("profile") else "",
            "media_url": formset.media,
        }
        return TemplateResponse(
            request,
            "admin/stories/story/bulk_add.html",
            context,
        )

    @admin.display(description="پیش‌نمایش")
    def preview(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" style="width:44px;height:70px;border-radius:8px;object-fit:cover;background:#000;" />',
                obj.thumbnail.url,
            )

        if obj.media and obj.media_type == "image":
            return format_html(
                '<img src="{}" style="width:44px;height:70px;border-radius:8px;object-fit:cover;background:#000;" />',
                obj.media.url,
            )

        return "-"

    @admin.display(description="پیش‌نمایش بزرگ")
    def preview_large(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" style="width:180px;height:320px;border-radius:16px;object-fit:cover;background:#000;" />',
                obj.thumbnail.url,
            )

        if obj.media and obj.media_type == "image":
            return format_html(
                '<img src="{}" style="width:180px;height:320px;border-radius:16px;object-fit:cover;background:#000;" />',
                obj.media.url,
            )

        return "-"

    @admin.display(description="پیش‌نمایش بندانگشتی")
    def thumbnail_preview(self, obj):
        if not obj.thumbnail:
            return "-"

        return format_html(
            '<img src="{}" style="width:120px;height:180px;border-radius:12px;object-fit:cover;background:#000;" />',
            obj.thumbnail.url,
        )

    @admin.display(description="پروفایل", ordering="profile")
    def profile_display(self, obj):
        return obj.profile

    @admin.display(description="نوع رسانه", ordering="media_type")
    def media_type_display(self, obj):
        mapping = {
            "image": "تصویر",
            "video": "ویدیو",
        }

        return mapping.get(
            obj.media_type,
            obj.media_type or "-",
        )

    @admin.display(description="برچسب", ordering="tag")
    def tag_display(self, obj):
        return f"#{obj.tag}" if obj.tag else "-"

    @admin.display(description="تعداد عناصر")
    def interactive_elements_count(self, obj):
        return obj.interactive_elements.count()

    @admin.display(description="تعداد بازدید", ordering="viewcount")
    def viewcount_display(self, obj):
        return obj.viewcount

    @admin.display(description="تاریخ ایجاد", ordering="created_at")
    def created_at_display(self, obj):
        return obj.created_at

    @admin.display(description="تاریخ انقضا", ordering="expires_at")
    def expires_at_display(self, obj):
        return obj.expires_at or "-"
