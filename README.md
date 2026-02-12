# Instagram Analytics App

A mobile-only Instagram-like profile analytics application built with React, TypeScript, and TailwindCSS. This app provides a private analytics viewer that visually resembles Instagram but focuses on profile, stories, and insights functionality.

## Features

- **Profile Page**: View profile information, stats, and story highlights
- **Story Viewer**: Fullscreen story viewer with auto-progress, tap navigation, and view tracking
- **Story Insights**: Detailed analytics including views, unique viewers, reach, impressions, and time-based charts
- **Settings**: Configure story insights visibility, expiration duration, and compression level
- **Mobile-First Design**: Instagram-like UI optimized for mobile devices

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching and caching
- **Recharts** - Chart library for insights
- **Lucide React** - Icons

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (or mock data)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd insta
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env` file (optional):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

If not set, the app defaults to `http://localhost:8000/api`.

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── BottomNav.tsx
│   ├── StoryRing.tsx
│   ├── StoryViewer.tsx
│   └── Skeleton.tsx
├── pages/           # Page components
│   ├── Feed.tsx
│   ├── Profile.tsx
│   ├── Stories.tsx
│   ├── StoryInsights.tsx
│   ├── Settings.tsx
│   ├── Search.tsx
│   └── Activity.tsx
├── hooks/           # Custom React hooks
│   ├── useProfile.ts
│   ├── useStories.ts
│   └── useSettings.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   └── api.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## API Endpoints

The app expects the following backend endpoints:

- `GET /api/profile/` - Get profile information
- `GET /api/stories/` - List active stories
- `POST /api/stories/{id}/view/` - Register a story view
- `GET /api/stories/{id}/insights/` - Get story analytics
- `GET /api/settings/` - Get settings
- `PUT /api/settings/` - Update settings

### API Response Formats

**Profile:**
```json
{
  "profile": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "avatar": "string",
    "isVerified": boolean,
    "postsCount": number,
    "followersCount": number,
    "followingCount": number,
    "bio": "string (optional)"
  }
}
```

**Stories:**
```json
{
  "stories": [
    {
      "id": "string",
      "mediaUrl": "string",
      "mediaType": "image" | "video",
      "createdAt": "ISO string",
      "expiresAt": "ISO string"
    }
  ]
}
```

**Story Insights:**
```json
{
  "insights": {
    "total_views": number,
    "unique_viewers": number,
    "reach": number,
    "impressions": number,
    "views_timeline": [
      {
        "time": "ISO string",
        "count": number
      }
    ],
    "viewers": [
      {
        "name": "string",
        "count": number
      }
    ]
  }
}
```

## Routes

- `/` - Mock Feed (UI only)
- `/profile` - Profile page (functional)
- `/stories?story={id}` - Story viewer (functional)
- `/insights/story/:id` - Story insights page (functional)
- `/settings` - Settings page (functional, local state)
- `/search` - Search page (UI only)
- `/activity` - Activity feed (UI only)

## Features Details

### Profile Page
- Displays avatar, username, verification badge
- Shows post, follower, and following counts
- Story highlights with animated gradient rings
- Button to view story insights

### Story Viewer
- Fullscreen mobile modal
- Auto-progress with 5-second duration
- Progress bar segments for each story
- Tap left/right to navigate
- Long press to pause (touch and hold)
- Automatically registers views via API

### Story Insights
- Total views, unique viewers, reach, and impressions
- Time-based chart showing views over time
- Viewer list with username or anonymous labels
- Mobile-optimized charts using Recharts

### Settings
- Toggle story insights visibility
- Set story expiration duration (12h, 24h, 48h)
- Choose compression level (low, medium, high)
- Settings saved to localStorage (with API fallback)

## Mobile Optimization

- Touch-friendly interactions
- Swipe gestures for navigation
- Safe area support for notched devices
- Prevent pull-to-refresh
- Mobile-first responsive design
- Smooth animations and transitions

## Code Quality

- TypeScript strict mode enabled
- ESLint configured
- Modular component architecture
- Reusable custom hooks
- Clean separation of concerns

## Browser Support

- Modern mobile browsers (iOS Safari, Chrome Mobile)
- Optimized for mobile viewport only

## License

MIT

