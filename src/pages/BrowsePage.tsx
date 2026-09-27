import { useEffect, useState } from 'react';
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTv,
  getTopRatedTv,
  getAiringTodayTv,
  getOnTheAirTv,
} from '@/lib/tmdb';
import type { TmdbMovie, TmdbTv } from '@/lib/tmdb-types';
import { PosterCard, SkeletonGrid } from '@/components/Cards';

export function BrowsePage({ mediaType }: { mediaType: 'movie' | 'tv' }) {
  const [items, setItems] = useState<(TmdbMovie | TmdbTv)[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(mediaType === 'movie' ? 'popular' : 'popular');

  useEffect(() => {
    setLoading(true);
    const fetcher = mediaType === 'movie'
      ? {
          popular: getPopularMovies,
          'top_rated': getTopRatedMovies,
          'now_playing': getNowPlayingMovies,
          upcoming: getUpcomingMovies,
        }
      : {
          popular: getPopularTv,
          'top_rated': getTopRatedTv,
          'airing_today': getAiringTodayTv,
          'on_the_air': getOnTheAirTv,
        };

    const fn = fetcher[category as keyof typeof fetcher];
    if (fn) {
      fn(1)
        .then((data) => {
          setItems(data.results);
          setLoading(false);
        })
        .catch(() => {
          setItems([]);
          setLoading(false);
        });
    }
  }, [mediaType, category]);

  const categories = mediaType === 'movie'
    ? [
        { key: 'popular', label: 'Popular' },
        { key: 'top_rated', label: 'Top Rated' },
        { key: 'now_playing', label: 'Now Playing' },
        { key: 'upcoming', label: 'Upcoming' },
      ]
    : [
        { key: 'popular', label: 'Popular' },
        { key: 'top_rated', label: 'Top Rated' },
        { key: 'airing_today', label: 'Airing Today' },
        { key: 'on_the_air', label: 'On The Air' },
      ];

  return (
    <div className="content-section pt-8">
      <h1 className="mb-4 text-2xl font-bold text-white">
        {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
      </h1>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat.key
                ? 'bg-white text-black'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {loading ? (
        <SkeletonGrid count={18} />
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No content available.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <PosterCard key={item.id} item={item} mediaType={mediaType} />
          ))}
        </div>
      )}
    </div>
  );
}
