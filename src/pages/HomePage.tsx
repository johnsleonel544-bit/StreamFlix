import { useEffect, useState } from 'react';
import { Play, ListPlus, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getTrendingMovies,
  getTrendingTv,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTv,
  getTopRatedTv,
  getOnTheAirTv,
} from '@/lib/tmdb';
import { backdropUrl, imageUrl } from '@/lib/tmdb-config';
import type { TmdbMovie, TmdbTv } from '@/lib/tmdb-types';
import { PosterRow, SkeletonRow } from '@/components/Cards';
import { useWatchlist } from '@/lib/hooks';
import { navigate } from '@/lib/router';

export function HomePage() {
  const [trending, setTrending] = useState<TmdbMovie[]>([]);
  const [trendingTv, setTrendingTv] = useState<TmdbTv[]>([]);
  const [popular, setPopular] = useState<TmdbMovie[]>([]);
  const [topRated, setTopRated] = useState<TmdbMovie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<TmdbMovie[]>([]);
  const [upcoming, setUpcoming] = useState<TmdbMovie[]>([]);
  const [popularTv, setPopularTv] = useState<TmdbTv[]>([]);
  const [topRatedTv, setTopRatedTv] = useState<TmdbTv[]>([]);
  const [onAir, setOnAir] = useState<TmdbTv[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    Promise.all([
      getTrendingMovies(),
      getTrendingTv(),
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getUpcomingMovies(),
      getPopularTv(),
      getTopRatedTv(),
      getOnTheAirTv(),
    ])
      .then(([tm, tt, pm, tr, np, up, ptv, trtv, oa]) => {
        setTrending(tm.results.slice(0, 10));
        setTrendingTv(tt.results.slice(0, 10));
        setPopular(pm.results);
        setTopRated(tr.results);
        setNowPlaying(np.results);
        setUpcoming(up.results);
        setPopularTv(ptv.results);
        setTopRatedTv(trtv.results);
        setOnAir(oa.results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const heroItems = trending.slice(0, 5);
  const hero = heroItems[heroIndex];

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroItems.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  return (
    <div>
      {/* Hero */}
      {loading ? (
        <div className="h-[400px] animate-pulse bg-white/5 lg:h-[500px]" />
      ) : hero ? (
        <section className="hero relative mx-3 mt-[72px] h-[500px] overflow-hidden rounded-b-[3px] sm:mx-5 lg:mx-0 lg:mt-0 lg:h-[500px] lg:rounded-none">
          <img
            className="absolute inset-0 h-full w-full object-cover object-[64%_center] transition-opacity duration-700"
            src={backdropUrl(hero.backdrop_path, 'w1280')}
            alt={hero.title}
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="relative z-10 flex h-full max-w-[560px] flex-col justify-end px-6 pb-12 sm:px-10 lg:justify-center lg:px-9 lg:pb-0">
            <span className="mb-4 w-fit rounded-sm bg-[#b31823] px-3 py-1 text-[11px] font-bold uppercase tracking-wide">Featured</span>
            <h1 className="hero-title">{hero.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              {hero.release_date && <span>{hero.release_date.slice(0, 4)}</span>}
              {hero.vote_average > 0 && (
                <>
                  <i /> <span className="flex items-center gap-1"><Star size={11} fill="currentColor" className="text-yellow-400" /> {hero.vote_average.toFixed(1)}</span>
                </>
              )}
              <i /> <span>Movie</span>
            </div>
            <p className="mt-4 max-w-[470px] text-[13px] leading-6 text-slate-300 line-clamp-3">{hero.overview}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/player/movie/${hero.id}`)}
                className="primary-button"
              >
                <Play size={16} fill="currentColor" /> Play
              </button>
              <button
                onClick={() => toggleWatchlist({
                  tmdb_id: hero.id,
                  media_type: 'movie',
                  title: hero.title,
                  poster_path: hero.poster_path,
                  backdrop_path: hero.backdrop_path,
                })}
                className="secondary-button"
              >
                <ListPlus size={17} /> {isInWatchlist(hero.id, 'movie') ? 'Added' : 'My List'}
              </button>
            </div>
          </div>
          {/* Hero dots */}
          {heroItems.length > 1 && (
            <div className="absolute bottom-6 right-7 z-10 hidden items-center gap-3 sm:flex">
              <button onClick={() => setHeroIndex((i) => (i - 1 + heroItems.length) % heroItems.length)} aria-label="Previous">
                <ChevronLeft size={19} className="text-slate-300 hover:text-white" />
              </button>
              <div className="flex gap-2">
                {heroItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === heroIndex ? 'w-6 bg-[#f52432]' : 'w-1.5 bg-slate-500'}`}
                  />
                ))}
              </div>
              <button onClick={() => setHeroIndex((i) => (i + 1) % heroItems.length)} aria-label="Next">
                <ChevronRight size={19} className="text-slate-300 hover:text-white" />
              </button>
            </div>
          )}
        </section>
      ) : null}

      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : (
        <>
          <PosterRow title="Trending Now" items={trending} mediaType="movie" />
          <PosterRow title="Popular Movies" items={popular} mediaType="movie" />
          <PosterRow title="Now Playing" items={nowPlaying} mediaType="movie" />
          <PosterRow title="Trending TV Shows" items={trendingTv} mediaType="tv" />
          <PosterRow title="Popular TV Shows" items={popularTv} mediaType="tv" />
          <PosterRow title="Top Rated Movies" items={topRated} mediaType="movie" />
          <PosterRow title="Top Rated TV Shows" items={topRatedTv} mediaType="tv" />
          <PosterRow title="On The Air" items={onAir} mediaType="tv" />
          <PosterRow title="Upcoming Movies" items={upcoming} mediaType="movie" />
        </>
      )}
    </div>
  );
}
