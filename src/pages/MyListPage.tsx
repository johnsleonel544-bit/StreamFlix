import { useWatchHistory, useWatchlist } from '@/lib/hooks';
import { imageUrl, backdropUrl } from '@/lib/tmdb-config';
import { PosterCard, SkeletonGrid } from '@/components/Cards';
import { Play, Trash2, History } from 'lucide-react';
import { navigate } from '@/lib/router';
import type { TmdbMovie, TmdbTv } from '@/lib/tmdb-types';
import { useAuth } from '@/lib/auth';

export function MyListPage() {
  const { watchlist, loading } = useWatchlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="content-section flex flex-col items-center justify-center pt-32 text-center">
        <p className="text-lg text-slate-400">Sign in to view your watchlist</p>
        <button onClick={() => navigate('/')} className="mt-4 primary-button">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="content-section pt-8">
      <h1 className="mb-6 text-2xl font-bold text-white">My List</h1>
      {loading ? (
        <SkeletonGrid count={6} />
      ) : watchlist.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          Your list is empty. Add movies and shows to watch later.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {watchlist.map((item) => {
            const movie = {
              id: item.tmdb_id,
              title: item.title,
              name: item.title,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: '',
              release_date: '',
              first_air_date: '',
              vote_average: 0,
              vote_count: 0,
              popularity: 0,
            } as unknown as TmdbMovie & TmdbTv;
            return (
              <PosterCard key={item.id} item={movie} mediaType={item.media_type} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HistoryPage() {
  const { history, loading, removeFromHistory } = useWatchHistory();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="content-section flex flex-col items-center justify-center pt-32 text-center">
        <p className="text-lg text-slate-400">Sign in to view your watch history</p>
        <button onClick={() => navigate('/')} className="mt-4 primary-button">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="content-section pt-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Watch History</h1>
      {loading ? (
        <SkeletonGrid count={6} />
      ) : history.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          No watch history yet. Start watching something!
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]"
            >
              <button
                onClick={() => navigate(`/player/${item.media_type}/${item.tmdb_id}`)}
                className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-md sm:w-40"
              >
                {item.backdrop_path ? (
                  <img src={backdropUrl(item.backdrop_path, 'w300')} alt={item.title} className="h-full w-full object-cover" />
                ) : item.poster_path ? (
                  <img src={imageUrl(item.poster_path, 'w185')} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-white/5 text-slate-700">
                    <Play size={20} />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play size={24} fill="white" className="text-white" />
                </div>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                {item.episode_name && (
                  <p className="truncate text-xs text-slate-500">
                    S{item.season_number} E{item.episode_number} · {item.episode_name}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  {item.completed ? (
                    <span className="text-emerald-400">Completed</span>
                  ) : (
                    <span>{Math.round((item.position / (item.duration || 1)) * 100)}% watched</span>
                  )}
                  <span>·</span>
                  <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
                {item.duration && !item.completed && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#27303a]">
                    <span
                      className="block h-full rounded-full bg-[#ef2835]"
                      style={{ width: `${Math.min((item.position / item.duration) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeFromHistory(item.id)}
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Remove from history"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
