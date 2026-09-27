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
- Owner-scoped CRUD: authenticated users can create, read, update, and delete their own comments.
- All authenticated users can read all comments (public discussion).
- Any authenticated user can like a comment (update likes count).
- Only the comment owner can delete or edit their own comment.
*/