# Instagram Story Analytics Backend

Django REST Framework backend for a private Instagram-like story analytics system. This backend supports a single page owner viewing analytics for their own stories.

## Features

- **Story Management**: Upload and manage stories (images/videos)
- **Media Processing**: Automatic compression of images and videos
- **View Tracking**: Track story views with IP and viewer name
- **Analytics**: Instagram-like insights including views, reach, impressions, and timelines
- **Expiration**: Stories automatically expire after 24 hours (configurable)
- **Admin Interface**: Django admin for managing stories and viewing insights

## Tech Stack

- Django 4.2
- Django REST Framework
- PostgreSQL
- Pillow (image processing)
- FFmpeg (video processing)
- Docker & docker-compose

## Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Create `.env` file:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start services:**
```bash
docker-compose up --build
```

4. **Run migrations:**
```bash
docker-compose exec web python manage.py migrate
```

5. **Create superuser:**
```bash
docker-compose exec web python manage.py createsuperuser
```

6. **Create a profile (via admin or API):**
   - Visit http://localhost:8000/admin
   - Create a Profile entry

The API will be available at `http://localhost:8000/api/`

### Local Development (Without Docker)

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install FFmpeg:**
   - macOS: `brew install ffmpeg`
   - Ubuntu: `sudo apt-get install ffmpeg`
   - Windows: Download from https://ffmpeg.org/

3. **Set up PostgreSQL database:**
```bash
createdb insta_analytics
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database settings
```

5. **Run migrations:**
```bash
python manage.py migrate
```

6. **Create superuser:**
```bash
python manage.py createsuperuser
```

7. **Run server:**
```bash
python manage.py runserver
```

## API Endpoints

### Profile

**GET `/api/profile/`**
- Returns profile information
- Response:
```json
{
  "profile": {
    "id": "1",
    "username": "owner",
    "fullName": "Page Owner",
    "avatar": "http://localhost:8000/media/avatars/avatar.jpg",
    "isVerified": false,
    "postsCount": 5,
    "followersCount": 100,
    "followingCount": 50,
    "bio": ""
  }
}
```

### Stories

**GET `/api/stories/`**
- Returns list of active (non-expired) stories
- Response:
```json
{
  "stories": [
    {
      "id": "uuid",
      "mediaUrl": "http://localhost:8000/media/stories/story.jpg",
      "mediaType": "image",
      "createdAt": "2025-01-01T12:00:00Z",
      "expiresAt": "2025-01-02T12:00:00Z"
    }
  ]
}
```

**POST `/api/stories/`**
- Upload a new story
- Content-Type: `multipart/form-data`
- Body: `media` (file)
- Response: Story object

**POST `/api/stories/{id}/view/`**
- Register a story view
- Body (optional):
```json
{
  "viewer_name": "username"
}
```
- Response:
```json
{
  "status": "view registered"
}
```

**GET `/api/stories/{id}/insights/`**
- Get story analytics
- Response:
```json
{
  "insights": {
    "total_views": 1240,
    "unique_viewers": 980,
    "reach": 980,
    "impressions": 1240,
    "views_timeline": [
      {
        "time": "2025-01-01T10:00:00Z",
        "count": 120
      },
      {
        "time": "2025-01-01T11:00:00Z",
        "count": 180
      }
    ],
    "viewers": [
      {
        "name": "user_123",
        "count": 5
      },
      {
        "name": "anonymous",
        "count": 1
      }
    ]
  }
}
```

### Settings

**GET `/api/settings/`**
- Get settings
- Response:
```json
{
  "settings": {
    "storyInsightsVisible": true,
    "storyExpirationDuration": 24,
    "compressionLevel": "medium"
  }
}
```

**PUT `/api/settings/`**
- Update settings
- Body:
```json
{
  "settings": {
    "storyInsightsVisible": true,
    "storyExpirationDuration": 24,
    "compressionLevel": "medium"
  }
}
```

## Media Processing

### Images
- Automatically resized to max width: 1080px
- Converted to JPEG with quality: 70
- Aspect ratio preserved

### Videos
- Max resolution: 720p (1280x720)
- Max duration: 60 seconds (configurable)
- Compressed using FFmpeg (H.264 codec, CRF 23)
- Audio: AAC, 128kbps

Media processing happens automatically on upload.

## Example API Requests

### Upload a Story (Image)
```bash
curl -X POST http://localhost:8000/api/stories/ \
  -F "media=@/path/to/image.jpg"
```

### Upload a Story (Video)
```bash
curl -X POST http://localhost:8000/api/stories/ \
  -F "media=@/path/to/video.mp4"
```

### Register a View
```bash
curl -X POST http://localhost:8000/api/stories/{story-id}/view/ \
  -H "Content-Type: application/json" \
  -d '{"viewer_name": "test_user"}'
```

### Get Insights
```bash
curl http://localhost:8000/api/stories/{story-id}/insights/
```

## Database Models

### Profile
- `username`: Unique username
- `display_name`: Display name
- `avatar`: Profile picture
- `is_verified`: Verification status
- `bio`: Bio text
- `followers_count`: Follower count
- `following_count`: Following count

### Story
- `id`: UUID primary key
- `profile`: Foreign key to Profile
- `media`: Media file (image or video)
- `media_type`: 'image' or 'video'
- `created_at`: Creation timestamp
- `expires_at`: Expiration timestamp (default: 24h after creation)

### StoryView
- `story`: Foreign key to Story
- `viewer_name`: Viewer name (nullable, default: 'anonymous')
- `viewer_ip`: Viewer IP address
- `created_at`: View timestamp

## Insights Logic

- **Total Views**: Count of all StoryView records for a story
- **Unique Viewers**: Count of distinct (viewer_ip, viewer_name) combinations
- **Reach**: Same as unique viewers
- **Impressions**: Same as total views
- **Views Timeline**: 
  - First 24 hours: Grouped by hour
  - After 24 hours: Grouped by day
- **Viewers List**: Aggregated by viewer_name with view counts

## Testing

Run tests:
```bash
python manage.py test
```

Or with Docker:
```bash
docker-compose exec web python manage.py test
```

## Admin Interface

Access admin at `http://localhost:8000/admin/`

Features:
- Upload stories via admin
- Preview media (images/videos)
- View story insights
- Manage profiles
- View all story views

## Configuration

Environment variables (`.env`):
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `DATABASE_URL`: PostgreSQL connection string (optional)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Database settings
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `MAX_VIDEO_DURATION_SECONDS`: Max video duration (default: 60)
- `STORY_EXPIRATION_HOURS`: Story expiration in hours (default: 24)

## Performance

- Database indexes on:
  - `Story.expires_at`
  - `Story.profile, created_at`
  - `StoryView.story, created_at`
  - `StoryView.story, viewer_ip, viewer_name`
- Optimized queries for insights aggregation
- Media compression reduces storage usage

## Troubleshooting

### FFmpeg not found
- Ensure FFmpeg is installed and in PATH
- For Docker: FFmpeg is included in the Dockerfile

### Media upload fails
- Check file size limits
- Verify media format is supported (JPEG, PNG, MP4)
- Check disk space

### Database connection errors
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

## License

MIT

