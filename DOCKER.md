# Docker Setup Guide

## Prerequisites
- Docker
- Docker Compose

## Running with Docker

### Build and Start Services
```bash
docker-compose up --build
```

### In Development Mode
```bash
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## Services

### Backend
- Python 3.12 + Django
- SQLite database (persistent)
- Debug mode: **ENABLED**
- Port: 8000

### Frontend
- Node.js + React + Vite
- Hot reload enabled
- Port: 5173

## Database
- SQLite file: `backend/db.sqlite3`
- Automatically migrated on container start
- Data persists across container restarts

## Logs
```bash
# View all logs
docker-compose logs

# View specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

## Notes
- Debug mode is enabled for development
- CSRF tokens properly configured for localhost
- API calls use environment variable `VITE_API_BASE_URL`
- Media files stored in `backend/media/`
