import { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { searchMulti } from '@/lib/tmdb';
import { profileUrl } from '@/lib/tmdb-config';
import { PosterCard, SkeletonGrid } from '@/components/Cards';
import { navigate } from '@/lib/router';
import type { TmdbMovie, TmdbTv } from '@/lib/tmdb-types';

type SearchResult = {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
};

export function SearchPage({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv' | 'person'>('all');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchMulti(query)
      .then((data) => {
        setResults(data.results as unknown as SearchResult[]);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  }, [query]);

  const filtered = results.filter((r) => {
    if (activeTab === 'all') return r.media_type === 'movie' || r.media_type === 'tv' || r.media_type === 'person';
    return r.media_type === activeTab;
  });

  const movies = filtered.filter((r) => r.media_type === 'movie');
  const tvShows = filtered.filter((r) => r.media_type === 'tv');
  const people = filtered.filter((r) => r.media_type === 'person');

  return (
    <div className="content-section pt-8">
      <h1 className="mb-2 text-2xl font-bold text-white">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>
      {!query && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <SearchIcon size={48} className="text-slate-700" />
          <p className="mt-4 text-slate-500">Search for movies, TV shows, and people</p>
        </div>
      )}
      {query && (
        <>
          <div className="mb-6 flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'movie', label: 'Movies' },
              { key: 'tv', label: 'TV Shows' },
              { key: 'person', label: 'People' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'all' | 'movie' | 'tv' | 'person')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonGrid count={12} />
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500">No results found.</div>
          ) : (
            <>
              {activeTab !== 'tv' && activeTab !== 'person' && movies.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-lg font-bold text-white">Movies</h2>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {movies.map((m) => (
                      <PosterCard key={m.id} item={m as unknown as TmdbMovie} mediaType="movie" />
                    ))}
                  </div>
                </div>
              )}
              {activeTab !== 'movie' && activeTab !== 'person' && tvShows.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-lg font-bold text-white">TV Shows</h2>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {tvShows.map((t) => (
                      <PosterCard key={t.id} item={t as unknown as TmdbTv} mediaType="tv" />
                    ))}
                  </div>
                </div>
              )}
              {activeTab !== 'movie' && activeTab !== 'tv' && people.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 text-lg font-bold text-white">People</h2>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {people.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/search?q=${encodeURIComponent(p.name ?? '')}`)}
                        className="group text-left"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
                          {p.profile_path ? (
                            <img
                              src={profileUrl(p.profile_path, 'w185')}
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-2xl text-slate-700">{p.name?.[0] ?? '?'}</div>
                          )}
                        </div>
                        <p className="mt-1.5 truncate text-xs font-semibold text-white">{p.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
