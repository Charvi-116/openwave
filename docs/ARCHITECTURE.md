# OpenWave Architecture

System design, data flow, and component interactions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  Homepage │ Search │ Player │ Playlists │ Artist Pages     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    API Gateway / CORS
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Backend (Node/Express)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │  │ Middleware  │  │ Controllers │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────────────────────────────────────────┐        │
│  │     External API Services (Jamendo, etc.)       │        │
│  └─────────────────────────────────────────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    PostgreSQL          Redis Cache      External APIs
    (Primary DB)        (Sessions, etc.)  (Music Sources)
```

## Component Hierarchy

### Frontend

```
App.tsx
├── Layout/
│   ├── Sidebar (navigation, genres)
│   ├── MainContent (router outlet)
│   └── AudioPlayer (persistent bottom player)
│
├── Pages/
│   ├── HomePage
│   │   ├── TrendingSection
│   │   ├── NewReleasesSection
│   │   ├── GenreStationsGrid
│   │   └── EditorsPicksSection
│   │
│   ├── SearchPage
│   │   ├── SearchBar
│   │   ├── FilterPanel
│   │   └── ResultsList
│   │
│   ├── ArtistPage
│   │   ├── ArtistHero
│   │   ├── TopTracks
│   │   ├── AlbumsGrid
│   │   └── RelatedArtists
│   │
│   ├── PlaylistPage
│   │   ├── PlaylistHeader
│   │   ├── PlaylistTracks
│   │   └── ShareButton
│   │
│   ├── GenrePage
│   │   ├── GenreHero
│   │   ├── TracksList
│   │   └── RelatedGenres
│   │
│   └── ProfilePage
│       ├── UserInfo
│       ├── LibraryTabs (Likes, History, Playlists)
│       └── PreferencesSettings
│
├── Components/
│   ├── TrackCard
│   ├── TrackListItem
│   ├── ArtistCard
│   ├── PlaylistCard
│   ├── AudioPlayer
│   │   ├── PlayerControls
│   │   ├── ProgressBar
│   │   ├── VolumeControl
│   │   └── Queue Display
│   ├── LicenseTag
│   ├── AttributionPopover
│   └── (many more...)
│
├── Hooks/
│   ├── useAuth
│   ├── usePlayer
│   ├── usePlaylist
│   ├── useRecommendations
│   └── useSearch
│
├── Services/
│   ├── api.ts (HTTP client)
│   ├── authService.ts
│   ├── musicService.ts
│   ├── playerService.ts
│   └── (more services...)
│
└── Types/
    ├── user.ts
    ├── track.ts
    ├── artist.ts
    ├── playlist.ts
    └── (more types...)
```

### Backend

```
backend/
├── src/
│   ├── server.ts (Express app setup)
│   │
│   ├── routes/
│   │   ├── auth.ts (login, signup, logout)
│   │   ├── users.ts (profile, preferences)
│   │   ├── tracks.ts (search, metadata)
│   │   ├── artists.ts (artist pages)
│   │   ├── albums.ts (album details)
│   │   ├── playlists.ts (CRUD)
│   │   ├── search.ts (full-text search)
│   │   ├── recommendations.ts (personalized suggestions)
│   │   └── admin.ts (seed data, analytics)
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── trackController.ts
│   │   ├── playlistController.ts
│   │   ├── searchController.ts
│   │   └── recommendationController.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Track.ts
│   │   ├── Artist.ts
│   │   ├── Playlist.ts
│   │   └── (more models...)
│   │
│   ├── middleware/
│   │   ├── auth.ts (JWT verification)
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   ├── cors.ts
│   │   └── rateLimiter.ts
│   │
│   ├── services/
│   │   ├── jamendoService.ts (Jamendo API integration)
│   │   ├── internetArchiveService.ts (IA integration)
│   │   ├── authService.ts (Auth logic)
│   │   ├── playlistService.ts
│   │   ├── recommendationService.ts
│   │   ├── searchService.ts
│   │   └── externalApiManager.ts
│   │
│   ├── db/
│   │   ├── connection.ts (PostgreSQL pool)
│   │   ├── queries.ts (SQL helpers)
│   │   └── migrations/ (schema files)
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts (bcrypt)
│   │   ├── validation.ts
│   │   ├── logger.ts
│   │   └── constants.ts
│   │
│   └── config/
│       └── environment.ts
│
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_artists.sql
│   ├── 003_create_tracks.sql
│   └── (more migrations...)
│
└── seeds/
    ├── seedDatabase.ts (runs all seeders)
    ├── seedGenres.ts
    ├── seedJamendoTracks.ts
    ├── seedPublicDomainTracks.ts
    └── seedSamplePlaylists.ts
```

## Data Flow

### User Authentication Flow

```
1. User enters email + password on signup/login page
2. Frontend sends POST /auth/signup or /auth/login
3. Backend validates email format and checks if user exists
4. Backend hashes password with bcrypt (signup) or verifies (login)
5. Backend creates JWT token and session record
6. Backend returns token + user metadata
7. Frontend stores token in localStorage and sets auth header
8. Frontend redirects to homepage
9. All subsequent requests include Authorization: Bearer <token>
10. Backend middleware verifies token on protected routes
```

### Track Playback Flow

```
1. User clicks play on track card
2. Frontend dispatches playerStore action with track data
3. Player component updates UI (title, artist, progress bar)
4. HTML5 <audio> element loads stream_url
5. Audio plays; player tracks duration and current time
6. On track end, player auto-plays next queued track
7. After 30+ seconds of play, frontend logs to listening_history
8. Backend increments track play_count in database
9. Recommendation engine uses history for suggestions
```

### Search Flow

```
1. User types in search bar (debounced input)
2. Frontend sends GET /search?q=term&filters={genre,license,etc}
3. Backend queries PostgreSQL full-text search on tracks + artists
4. Backend applies license filter (exclude non-streamable)
5. Backend returns paginated results with metadata
6. Frontend displays results (tracks, artists, playlists, genres)
7. Results cached for 5 minutes to reduce DB load
```

### Playlist Management Flow

```
1. User creates new playlist
2. Frontend sends POST /playlists with { title, description }
3. Backend creates playlist record, assigns share_token
4. Backend returns playlist ID
5. User adds tracks by dragging or clicking "Add to Playlist"
6. Frontend sends POST /playlists/{id}/tracks with track_id
7. Backend inserts into playlist_tracks with position
8. Frontend re-fetches playlist to show updated list
9. User shares via public link: /playlists/{share_token}
10. Non-authenticated users can view and listen to shared playlists
```

### Recommendation Flow

```
1. Nightly batch job:
   - Query listening_history for each user
   - Group by genre, extract artist/mood preferences
   - Score all unwithered tracks using similarity formula
   - Insert top N into recommendations table
2. When user visits homepage:
   - Backend queries recommendations for user_id
   - Orders by score, limits to 20
   - Returns track metadata + reason (e.g., "Because you like lo-fi")
3. Recommendation algorithms:
   - Collaborative filtering: users with similar taste
   - Content-based: similar genre/mood/artist/tempo
   - Popularity: trending in user's favorite genres
   - Serendipity: random discovery in related genres
```

## External API Integration

### Jamendo API

- **Endpoint:** https://api.jamendo.com/v3.0
- **Rate Limit:** 100 requests/minute (free tier)
- **Flow:**
  1. Seed job queries `/tracks` with `limit=100, offset=X`
  2. Extract: title, artist, duration, image, audio link
  3. Map license field to our `license_type` enum
  4. Verify stream URL is accessible
  5. Insert into tracks table with source_api='jamendo'
  6. Update weekly to find new tracks

### Internet Archive

- **Endpoint:** https://archive.org/advancedsearch.php
- **Query:** `mediatype:audio AND licenseurl:cc* OR subject:public-domain`
- **Flow:**
  1. Seed job searches for CC-licensed or public-domain audio
  2. Extract metadata from item JSON
  3. Build M3U playback URL for archive.org items
  4. Insert with source_api='internet_archive'

### Wikimedia Commons

- **Endpoint:** https://commons.wikimedia.org/w/api.php
- **Query:** `action=query&list=search&srsearch=audio&srnamespace=6`
- **Flow:**
  1. Search for audio files
  2. Parse license metadata
  3. Download link validation
  4. Insert with source_api='wikimedia'

## Caching Strategy

```
Frontend Cache (React Query):
- Track metadata: 5 minutes
- Playlist contents: 3 minutes
- Search results: 5 minutes
- User profile: 10 minutes
- Recommendations: 1 hour

Backend Cache (Redis):
- Session tokens: 7 days (TTL)
- Search results: 5 minutes
- Genre statistics: 24 hours
- Top 1000 tracks (popular): 1 hour

Browser Cache (Service Worker - future):
- Genre station images
- UI assets
- Offline playlist data
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire after 7 days; refresh token for extension
- Secure HttpOnly cookies for session storage
- CORS limited to openwave.local (or deployment domain)

### API Rate Limiting
- 100 requests/minute per user
- 1000 requests/minute per IP
- Track API quota to respect external API limits

### License Compliance
- Filter tracks by license before serving
- Display attribution on every track
- Audit external API links weekly for validity
- Log all streaming events for rights holders

### Data Privacy
- User passwords never logged or transmitted in plain text
- Listening history encrypted at rest
- Delete user data on account deletion
- GDPR-compliant data export endpoint

## Performance Optimization

### Frontend
- Lazy load components (code splitting with React.lazy)
- Virtual scrolling for long track lists
- Image lazy loading with IntersectionObserver
- Memoize expensive computations (useMemo, useCallback)

### Backend
- Database indexes on frequently queried columns
- Connection pooling to PostgreSQL
- Response compression (gzip)
- Pagination (default 20, max 100 per page)
- Response caching headers (Cache-Control)

### Audio Streaming
- Stream from CDN-hosted URLs where available
- Pre-buffer next track in queue
- Pause stream when tab loses focus
- Respect API bandwidth quotas

## Deployment

```
Development:
- Frontend: http://localhost:3000 (React dev server)
- Backend: http://localhost:5000 (Express server)
- Database: localhost:5432 (PostgreSQL)

Production:
- Frontend: Vercel or Netlify (static + serverless)
- Backend: Render, Railway, or AWS EC2 (Node server)
- Database: Managed PostgreSQL (AWS RDS, Heroku, Supabase)
- CDN: Cloudflare for static assets
- Monitoring: Sentry (error tracking), LogRocket (session replay)
```

## Scalability Roadmap

1. **Current (MVP):** Single server, single DB instance
2. **10K users:** Add Redis cache, database read replicas
3. **100K users:** Microservices (auth, search, recommendations), message queue for jobs
4. **1M+ users:** Distributed cache, data warehouse (Postgres → BigQuery), recommendation ML model
