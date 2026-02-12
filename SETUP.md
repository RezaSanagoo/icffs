# Instagram Analytics - Setup & Deployment Guide

## Project Structure

```
insta/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Django + DRF
├── public/            # PWA assets (manifest, icons, SW)
├── docker-compose.yml # Multi-container orchestration
└── DOCKER.md         # Docker documentation
```

## Quick Start

### Option 1: Docker (Recommended for Deployment)

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API: http://localhost:8000/api

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
npm install
npm run dev
```

## PWA Features

- ✅ Web App Manifest
- ✅ Service Worker (offline support)
- ✅ App Icons (192x192, 512x512)
- ✅ Apple Web App Support
- ✅ Standalone mode

## Configuration

### Environment Variables

Frontend (`.env`):
```
VITE_API_BASE_URL=http://localhost:8000/api
```

Backend (`.env`):
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Database

- **Type**: SQLite
- **Location**: `backend/db.sqlite3`
- **Auto-migrations**: Enabled on container start
- **Persistent**: Data survives container restarts

## Development Mode

- ✅ Debug: ENABLED
- ✅ Hot Reload: ENABLED
- ✅ Sourcemaps: ENABLED
- ✅ TypeScript Strict: DISABLED
- ✅ ESLint Warnings: DISABLED

## Production Checklist

Before deploying to production:
1. ❌ Set `DEBUG=False` in `.env`
2. ❌ Change `SECRET_KEY` to a secure value
3. ❌ Update `ALLOWED_HOSTS` to your domain
4. ❌ Set up HTTPS
5. ❌ Configure static file serving
6. ❌ Set up a proper database (PostgreSQL)
7. ❌ Enable TypeScript strict mode
8. ❌ Enable ESLint rules

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Persistence

Database file (`backend/db.sqlite3`) is:
- ✅ Included in Git (for development)
- ✅ Mounted as volume in Docker
- ✅ Survives container restarts

## Debugging

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Django Shell
```bash
docker-compose exec backend python manage.py shell
```

### Database Management
```bash
# Migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :8000
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Database Locked
```bash
# Remove lock file
rm backend/db.sqlite3-journal

# Restart containers
docker-compose restart
```

### Module Not Found
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## API Endpoints

- `GET  /api/stories/` - List active stories
- `POST /api/stories/` - Create story
- `GET  /api/stories/archive/` - List all stories
- `GET  /api/stories/{id}/insights/` - Get story insights
- `POST /api/stories/{id}/view/` - Record view
- `GET  /api/profile/` - Get profiles
- `POST /api/profile/set_active/` - Set active profile
- `GET  /api/profile/active/` - Get active profile

## Support

For issues, check:
- Docker logs: `docker-compose logs`
- Django console: Check terminal output
- Browser console: F12 > Console tab
