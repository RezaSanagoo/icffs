"""
Django settings for insta_analytics project.
"""
import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "194.60.231.96",
    "192.168.1.69",
    "be.1nsta.ir",
]

# Application definition
INSTALLED_APPS = [
    'unfold',    
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.import_export',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'stories.apps.StoriesConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]



ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': "dbivmm_db",
        'USER': "root",
        'PASSWORD': "lB9cEYknLU3g9unHhlPg",
        'HOST': "remote.runflare.com",
        'PORT': "31332",
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': (
                "SET sql_mode='STRICT_TRANS_TABLES';"
                "SET default_storage_engine=INNODB;"  # ← جداول جدید همیشه InnoDB میشن
            ),
        }
    }
}

# # --- SQLite config (active) ---
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'fa-ir'

TIME_ZONE = "Asia/Tehran"


USE_I18N = True
USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],

    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,

    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],

    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}


# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://194.60.231.96:5173",
    "http://194.60.231.96:8000",
    "http://192.168.1.69:5173",
    "http://192.168.1.69:8000",
    "https://be.1nsta.ir",
    "https://1nsta.ir",
    "http://be.1nsta.ir",
    "http://1nsta.ir",
]

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Content-Type']




# Media processing settings
MAX_VIDEO_DURATION_SECONDS = config('MAX_VIDEO_DURATION_SECONDS', default=60, cast=int)
STORY_EXPIRATION_HOURS = config('STORY_EXPIRATION_HOURS', default=24, cast=int)
IMAGE_MAX_WIDTH = 1080
IMAGE_JPEG_QUALITY = 70
VIDEO_MAX_RESOLUTION = (1280, 720)  # 720p

CSRF_TRUSTED_ORIGINS = [
    "https://be.1nsta.ir",
    "http://1nsta.ir",
    "https://1nsta.ir",

    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "http://192.168.1.69:5173",
    "http://192.168.1.69:8000",

    "http://194.60.231.96:5173",
    "http://194.60.231.96:8000",
]


STATICFILES_DIRS = [
    BASE_DIR / "stati",
]

UNFOLD = {
    "SITE_TITLE": "پنل اینستا کِلون",
    "SITE_HEADER": "مدیریت اینستا کِلون",
    "SITE_SYMBOL": "insights",
    "SHOW_HISTORY": True,
    "RTL": True,
    "STYLES": [
        "/static/css/unfold-custom.css",
    ],
    "COLORS": {
        "primary": {
            "50": "253 242 248",
            "100": "252 231 243",
            "200": "251 207 232",
            "300": "249 168 212",
            "400": "244 114 182",
            "500": "236 72 153",
            "600": "219 39 119",
            "700": "190 24 93",
            "800": "157 23 77",
            "900": "131 24 67",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "navigation": [
            {
                "title": "مدیریت پیج‌ها",
                "items": [
                    {
                        "title": "پروفایل‌ها",
                        "icon": "person",
                        "link": "/admin/stories/profile/",
                    },
                    {
                        "title": "هایلایت‌ها",
                        "icon": "collections_bookmark",
                        "link": "/admin/stories/highlight/",
                    },
                ],
            },
            {
                "title": "مدیریت استوری",
                "items": [
                    {
                        "title": "استوری‌ها",
                        "icon": "auto_stories",
                        "link": "/admin/stories/story/",
                    },
                    {
                        "title": "اهداف منشن",
                        "icon": "alternate_email",
                        "link": "/admin/stories/storymentiontarget/",
                    },
                ],
            },
        ],
    },
}
