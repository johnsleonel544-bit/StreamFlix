import { useCallback, useEffect, useState } from 'react';
import { supabase, type WatchHistoryEntry, type WatchlistEntry } from './supabase';
import { useAuth } from './auth';

export function useWatchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('watch_history')
      .select('*')
      .order('updated_at', { ascending: false });
    setHistory((data as WatchHistoryEntry[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const upsertProgress = useCallback(
    async (entry: {
      tmdb_id: number;
      media_type: 'movie' | 'tv';
      title: string;
      poster_path: string | null;
      backdrop_path: string | null;
      season_number?: number | null;
      episode_number?: number | null;
      episode_name?: string | null;
      runtime?: number | null;
      position: number;
      duration?: number | null;
      completed?: boolean;
    }) => {
      if (!user) return;
      const payload = {
        user_id: user.id,
        tmdb_id: entry.tmdb_id,
        media_type: entry.media_type,
        title: entry.title,
        poster_path: entry.poster_path,
        backdrop_path: entry.backdrop_path,
        season_number: entry.season_number ?? null,
        episode_number: entry.episode_number ?? null,
        episode_name: entry.episode_name ?? null,
        runtime: entry.runtime ?? null,
        position: entry.position,
        duration: entry.duration ?? null,
        completed: entry.completed ?? false,
        updated_at: new Date().toISOString(),
      };
      await supabase
        .from('watch_history')
        .upsert(payload, {
          onConflict: 'watch_history_user_content_unique',
        });
      fetchHistory();
    },
    [user, fetchHistory],
  );

  const removeFromHistory = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from('watch_history').delete().eq('id', id);
      fetchHistory();
    },
    [user, fetchHistory],
  );

  const continueWatching = history.filter((h) => !h.completed && h.position > 0);

  return { history, loading, continueWatching, upsertProgress, removeFromHistory, refetch: fetchHistory };
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });
    setWatchlist((data as WatchlistEntry[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const isInWatchlist = useCallback(
    (tmdbId: number, mediaType: string) =>
      watchlist.some((w) => w.tmdb_id === tmdbId && w.media_type === mediaType),
    [watchlist],
  );

  const toggleWatchlist = useCallback(
    async (entry: {
      tmdb_id: number;
      media_type: 'movie' | 'tv';
      title: string;
      poster_path: string | null;
      backdrop_path: string | null;
    }) => {
      if (!user) return;
      const existing = watchlist.find(
        (w) => w.tmdb_id === entry.tmdb_id && w.media_type === entry.media_type,
      );
      if (existing) {
        await supabase.from('watchlist').delete().eq('id', existing.id);
      } else {
        await supabase.from('watchlist').upsert(
          { user_id: user.id, ...entry },
          { onConflict: 'watchlist_user_content_unique' },
        );
      }
      fetchWatchlist();
    },
    [user, watchlist, fetchWatchlist],
  );

  return { watchlist, loading, isInWatchlist, toggleWatchlist, refetch: fetchWatchlist };
}
