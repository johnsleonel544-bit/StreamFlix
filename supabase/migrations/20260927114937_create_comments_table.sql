/*
# Create comments table for movie/TV discussions

1. New Tables
- `comments`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user)
  - `tmdb_id` (integer, not null - the TMDb movie/TV ID)
  - `media_type` (text, not null - 'movie' or 'tv')
  - `content` (text, not null - the comment text)
  - `is_spoiler` (boolean, default false - spoiler toggle)
  - `parent_id` (uuid, nullable - for replies)
  - `likes` (integer, default 0 - like count)
  - `is_reported` (boolean, default false)
  - `created_at` (timestamp)

2. Security
- Enable RLS on `comments`.
- All authenticated users can read all comments (public discussion).
- Owner-scoped insert: users can only create comments as themselves.
- Owner-scoped update: users can only edit/delete their own comments.
- Any authenticated user can increment likes on any comment.
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  content text NOT NULL,
  is_spoiler boolean NOT NULL DEFAULT false,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  likes integer NOT NULL DEFAULT 0,
  is_reported boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_tmdb_idx ON comments(tmdb_id, media_type);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON comments(parent_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read comments (public discussion)
DROP POLICY IF EXISTS "read_comments" ON comments;
CREATE POLICY "read_comments" ON comments FOR SELECT
  TO authenticated USING (true);

-- Users can only create comments as themselves
DROP POLICY IF EXISTS "insert_own_comment" ON comments;
CREATE POLICY "insert_own_comment" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can only update their own comments (content, is_spoiler)
DROP POLICY IF EXISTS "update_own_comment" ON comments;
CREATE POLICY "update_own_comment" ON comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own comments
DROP POLICY IF EXISTS "delete_own_comment" ON comments;
CREATE POLICY "delete_own_comment" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);