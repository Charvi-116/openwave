# OpenWave Database Schema

Complete PostgreSQL schema for user accounts, music metadata, playlists, and recommendations.

## Tables

### Users

Store user account information and authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Artists

Artist metadata and profiles.

```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  image_url VARCHAR(512),
  source_api VARCHAR(50), -- 'jamendo', 'internet_archive', 'custom'
  external_id VARCHAR(255), -- ID from source API
  genres TEXT[], -- ARRAY of genre strings
  follower_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artists_name ON artists(name);
CREATE INDEX idx_artists_source ON artists(source_api, external_id);
```

### Genres

Genre catalog and metadata.

```sql
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(512),
  color_hex VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_genres_name ON genres(name);
```

### Tracks

Music tracks with metadata and streaming information.

```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  duration_ms INT NOT NULL,
  
  -- Audio source
  stream_url VARCHAR(512) NOT NULL,
  source_api VARCHAR(50), -- 'jamendo', 'internet_archive', 'custom'
  external_id VARCHAR(255), -- ID from source API
  
  -- Licensing information
  license_type VARCHAR(100), -- 'CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'public-domain', 'custom'
  license_url VARCHAR(512),
  copyright_holder VARCHAR(255),
  attribution_required BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  genres TEXT[], -- ARRAY of genre names
  mood VARCHAR(50),
  bpm INT,
  release_date DATE,
  
  -- Counts
  play_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracks_title ON tracks(title);
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_tracks_source ON tracks(source_api, external_id);
CREATE INDEX idx_tracks_license ON tracks(license_type);
```

### Albums

Album collections.

```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  cover_url VARCHAR(512),
  description TEXT,
  release_date DATE,
  genres TEXT[], -- ARRAY of genre strings
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_albums_title ON albums(title);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
```

### Playlists

User-created playlists.

```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url VARCHAR(512),
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_share_token ON playlists(share_token);
```

### Playlist Tracks

Membership of tracks in playlists (ordered).

```sql
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INT NOT NULL, -- Sort order
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
```

### Likes

User favorites.

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, track_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_track_id ON likes(track_id);
```

### Listening History

Track play events for personalization.

```sql
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_played_ms INT, -- How much of the track was played
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX idx_listening_history_played_at ON listening_history(played_at);
```

### User Preferences

Genre preferences and listening profile.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_genres TEXT[], -- ARRAY of genre names
  mood_preference VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

### Recommendations

Precomputed recommendations for faster serving.

```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommended_track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  score FLOAT, -- Recommendation confidence (0-1)
  reason VARCHAR(100), -- 'collaborative', 'content-based', 'genre-match', etc.
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_score ON recommendations(score DESC);
```

### Sessions

Optional: track user sessions for analytics and debugging.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Key Design Decisions

### License Tracking
- Every track stores its license type, URL, and copyright holder
- `attribution_required` flag to show when source must be credited
- Used to filter content by license and display proper attribution in UI

### Source API Tracking
- `source_api` and `external_id` enable updates from upstream APIs
- Easy to refresh metadata or validate links are still live
- Supports multiple sources simultaneously

### Full-Text Search
- Title, artist name, genres stored in searchable fields
- Index on `tracks.title`, `artists.name` for fast queries
- PostgreSQL full-text search or external search engine (Elasticsearch) for scale

### Recommendations
- Separate table to support multiple algorithms
- `score` field for ranking results
- `reason` field to explain recommendation to user (transparency)

### Playlist Ordering
- `position` field in `playlist_tracks` to maintain user-defined order
- Avoids relying on insertion order or timestamps

## Growth Considerations

- Add caching layer (Redis) for popular tracks and playlists
- Partition large tables (`listening_history`, `recommendations`) by date/user
- Archive old listening history beyond retention period
- Use materialized views for genre statistics and recommendations
- Consider read replicas for high traffic

## Migration Strategy

1. Create all tables in order (users → artists → tracks → playlists → etc.)
2. Add foreign key constraints only after parent tables exist
3. Create indexes after initial data load for performance
4. Use migrations tool (Flyway, Knex, TypeORM) for version control
