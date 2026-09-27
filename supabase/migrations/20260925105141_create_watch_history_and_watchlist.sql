/*
# Create watch_history and watchlist tables

1. New Tables
- `watch_history`: tracks viewing progress for movies and TV episodes per user
  - id (uuid, primary key)
  - user_id (uuid, owner, defaults to auth.uid())
  - tmdb_id (integer, the TMDb content ID)
  - media_type (text: 'movie' or 'tv')
  - title (text, display title)
  - poster_path (text, TMDb poster path)
  - backdrop_path (text, TMDb backdrop path)
  - season_number (integer, nullable, for TV episodes)
  - episode_number (integer, nullable, for TV episodes)
  - episode_name (text, nullable, for TV episodes)
  - runtime (integer, nullable, total runtime in seconds)
  - position (integer, watched position in seconds, default 0)
  - duration (integer, total duration in seconds, nullable)
  - completed (boolean, default false)
  - updated_at (timestamptz)
  - created_at (timestamptz)
- `watchlist`: user's saved movies/shows to watch later
  - id (uuid, primary key)
  - user_id (uuid, owner, defaults to auth.uid())
  - tmdb_id (integer)
  - media_type (text: 'movie' or 'tv')
  - title (text)
  - poster_path (text)
  - backdrop_path (text)
  - created_at (timestamptz)

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- Unique constraint on (user_id, tmdb_id, media_type, season_number, episode_number) for watch_history
  to allow upsert of progress.
- Unique constraint on (user_id, tmdb_id, media_type) for watchlist to prevent duplicates.

3. Notes
- user_id defaults to auth.uid() so frontend inserts that omit user_id succeed.
- The unique constraints allow upsert (on conflict update) for progress tracking.
*/

CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title text NOT NULL,
  poster_path text,
  backdrop_path text,
  season_number integer,
  episode_number integer,
  episode_name text,
  runtime integer,
  position integer NOT NULL DEFAULT 0,
  duration integer,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title text NOT NULL,
  poster_path text,
  backdrop_path text,
  created_at timestamptz DEFAULT now()
);

-- Unique constraints for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'watch_history_user_content_unique'
  ) THEN
    ALTER TABLE watch_history
    ADD CONSTRAINT watch_history_user_content_unique
    UNIQUE (user_id, tmdb_id, media_type, season_number, episode_number);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'watchlist_user_content_unique'
  ) THEN
    ALTER TABLE watchlist
    ADD CONSTRAINT watchlist_user_content_unique
    UNIQUE (user_id, tmdb_id, media_type);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_completed ON watch_history(completed);
CREATE INDEX IF NOT EXISTS idx_watch_history_updated ON watch_history(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

-- Enable RLS
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- watch_history policies
DROP POLICY IF EXISTS "select_own_watch_history" ON watch_history;
CREATE POLICY "select_own_watch_history" ON watch_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_watch_history" ON watch_history;
CREATE POLICY "insert_own_watch_history" ON watch_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_watch_history" ON watch_history;
CREATE POLICY "update_own_watch_history" ON watch_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_watch_history" ON watch_history;
CREATE POLICY "delete_own_watch_history" ON watch_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- watchlist policies
DROP POLICY IF EXISTS "select_own_watchlist" ON watchlist;
CREATE POLICY "select_own_watchlist" ON watchlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_watchlist" ON watchlist;
CREATE POLICY "insert_own_watchlist" ON watchlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_watchlist" ON watchlist;
CREATE POLICY "update_own_watchlist" ON watchlist FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_watchlist" ON watchlist;
CREATE POLICY "delete_own_watchlist" ON watchlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);