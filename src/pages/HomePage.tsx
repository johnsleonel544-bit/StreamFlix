import { useEffect, useState } from 'react';
import { Play, ListPlus, Info, Star, ChevronLeft, ChevronRight, Flame, TrendingUp } from 'lucide-react';
import {
  getTrendingMovies,
  getTrendingTv,
  getTrendingAll,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTv,
  getTopRatedTv,
  getOnTheAirTv,
  getAiringTodayTv,
  discoverMovies,
  discoverTv,
  discoverMoviesByRegion,
  discoverTvByRegion,
  getPopularThisWeek,
  getHiddenGems,
  getShortMovies,
  getRandomPick,
  GENRE_IDS,
  REGION_CODES,
} from '@/lib/tmdb';
import { backdropUrl, imageUrl } from '@/lib/tmdb-config';
import type { TmdbMovie, TmdbTv } from '@/lib/tmdb-types';
import { PosterRow, RankedPosterRow, SkeletonRow, ContinueWatchingRow } from '@/components/Cards';
import { useWatchlist, useWatchHistory } from '@/lib/hooks';
import { navigate } from '@/lib/router';

type MediaItem = TmdbMovie | TmdbTv;

const GENRE_ROWS: { label: string; genreId: number }[] = [
  { label: 'Action', genreId: GENRE_IDS.action },
  { label: 'Comedy', genreId: GENRE_IDS.comedy },
  { label: 'Horror', genreId: GENRE_IDS.horror },
  { label: 'Romance', genreId: GENRE_IDS.romance },
  { label: 'Thriller', genreId: GENRE_IDS.thriller },
  { label: 'Sci-Fi', genreId: GENRE_IDS.scifi },
  { label: 'Fantasy', genreId: GENRE_IDS.fantasy },
  { label: 'Crime', genreId: GENRE_IDS.crime },
  { label: 'Adventure', genreId: GENRE_IDS.adventure },
  { label: 'Animation', genreId: GENRE_IDS.animation },
];

const REGION_ROWS: { label: string; region: string }[] = [
  { label: 'Made in Africa', region: 'KE|NG|ZA|GH' },
  { label: 'Kenyan Movies', region: REGION_CODES.kenya },
  { label: 'African TV Shows', region: 'KE|NG|ZA|GH' },
  { label: 'K-Drama', region: REGION_CODES.korea },
  { label: 'Korean Movies', region: REGION_CODES.korea },
  { label: 'Bollywood', region: REGION_CODES.india },
  { label: 'Nollywood', region: REGION_CODES.nigeria },
  { label: 'Turkish Series', region: REGION_CODES.turkey },
  { label: 'Anime & Animation', region: REGION_CODES.japan },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_ROWS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3, CURRENT_YEAR - 4].map((y) => ({
  label: `Popular Movies ${y}`,
  year: y,
}));

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { continueWatching } = useWatchHistory();

  // All section state
  const [trendingDay, setTrendingDay] = useState<MediaItem[]>([]);
  const [trendingWeek, setTrendingWeek] = useState<TmdbMovie[]>([]);
  const [trendingTv, setTrendingTv] = useState<TmdbTv[]>([]);
  const [popularThisWeek, setPopularThisWeek] = useState<MediaItem[]>([]);
  const [newReleases, setNewReleases] = useState<TmdbMovie[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<TmdbMovie[]>([]);
  const [comingSoon, setComingSoon] = useState<TmdbMovie[]>([]);
  const [popularMovies, setPopularMovies] = useState<TmdbMovie[]>([]);
  const [popularTv, setPopularTv] = useState<TmdbTv[]>([]);
  const [topRated, setTopRated] = useState<TmdbMovie[]>([]);
  const [topRatedTv, setTopRatedTv] = useState<TmdbTv[]>([]);
  const [nowPlaying, setNowPlaying] = useState<TmdbMovie[]>([]);
  const [onAir, setOnAir] = useState<TmdbTv[]>([]);
  const [airingToday, setAiringToday] = useState<TmdbTv[]>([]);
  const [hiddenGems, setHiddenGems] = useState<TmdbMovie[]>([]);
  const [shortMovies, setShortMovies] = useState<TmdbMovie[]>([]);
  const [randomPick, setRandomPick] = useState<TmdbMovie[]>([]);
  const [genreData, setGenreData] = useState<Record<string, TmdbMovie[]>>({});
  const [regionData, setRegionData] = useState<Record<string, TmdbMovie[] | TmdbTv[]>>({});
  const [yearData, setYearData] = useState<Record<number, TmdbMovie[]>>({});

  useEffect(() => {
    const promises: Promise<void>[] = [];

    // Core data
    promises.push(
      Promise.all([
        getTrendingAll('day'),
        getTrendingMovies('week'),
        getTrendingTv('week'),
        getPopularThisWeek(),
        getNowPlayingMovies(),
        getPopularMovies(2),
        getUpcomingMovies(),
        getPopularMovies(),
        getPopularTv(),
        getTopRatedMovies(),
        getTopRatedTv(),
        getOnTheAirTv(),
        getAiringTodayTv(),
        getHiddenGems(),
        getShortMovies(),
        getRandomPick(),
      ]).then(([td, tw, tt, pw, np, p2, up, pm, ptv, tr, trtv, oa, at, hg, sm, rp]) => {
        setTrendingDay(td.results as MediaItem[]);
        setTrendingWeek(tw.results.slice(0, 20));
        setTrendingTv(tt.results.slice(0, 20));
        setPopularThisWeek(pw.results);
        setNewReleases(np.results.slice(0, 20));
        setRecentlyAdded(p2.results.slice(0, 20));
        setComingSoon(up.results.slice(0, 20));
        setPopularMovies(pm.results);
        setPopularTv(ptv.results);
        setTopRated(tr.results);
        setTopRatedTv(trtv.results);
        setOnAir(oa.results);
        setAiringToday(at.results);
        setHiddenGems(hg.results.slice(0, 20));
        setShortMovies(sm.results.slice(0, 20));
        setRandomPick(rp.results.slice(0, 20));
      }).catch(() => {}),
    );

    // Genre rows
    for (const { label, genreId } of GENRE_ROWS) {
      promises.push(
        discoverMovies({ genreId, voteCountGte: 20 })
          .then((d) => setGenreData((prev) => ({ ...prev, [label]: d.results.slice(0, 20) })))
          .catch(() => {}),
      );
    }

    // Region rows
    for (const { label, region } of REGION_ROWS) {
      const isTv = label.includes('TV') || label.includes('Drama') || label.includes('Series');
      const fetchFn = isTv ? discoverTvByRegion : discoverMoviesByRegion;
      promises.push(
        fetchFn(region)
          .then((d) => setRegionData((prev) => ({ ...prev, [label]: d.results.slice(0, 20) })))
          .catch(() => {}),
      );
    }

    // Year rows
    for (const { year } of YEAR_ROWS) {
      promises.push(
        discoverMovies({ year, voteCountGte: 20 })
          .then((d) => setYearData((prev) => ({ ...prev, [year]: d.results.slice(0, 20) })))
          .catch(() => {}),
      );
    }

    Promise.all(promises).then(() => setLoading(false));
  }, []);

  const heroItems = trendingDay.slice(0, 5);
  const hero = heroItems[heroIndex] as TmdbMovie | undefined;

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroItems.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const playItem = (tmdbId: number, mediaType: 'movie' | 'tv') => navigate(`/player/${mediaType}/${tmdbId}`);

  if (loading) {
    return (
      <div>
        <div className="h-[400px] animate-pulse bg-white/5 lg:h-[500px]" />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div>
      {/* 1. HERO / FEATURED */}
      {hero && (
        <section className="hero relative mx-3 mt-[72px] h-[500px] overflow-hidden rounded-b-[3px] sm:mx-5 lg:mx-0 lg:mt-0 lg:h-[560px] lg:rounded-none">
          <img
            className="absolute inset-0 h-full w-full object-cover object-[64%_center] transition-opacity duration-700"
            src={backdropUrl(hero.backdrop_path, 'w1280')}
            alt={hero.title}
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="relative z-10 flex h-full max-w-[560px] flex-col justify-end px-6 pb-12 sm:px-10 lg:justify-center lg:px-9 lg:pb-0">
            <span className="mb-4 w-fit rounded-sm bg-[#b31823] px-3 py-1 text-[11px] font-bold uppercase tracking-wide">Featured</span>
            <h1 className="hero-title">{hero.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {hero.release_date && <span>{hero.release_date.slice(0, 4)}</span>}
              {hero.runtime != null && hero.runtime > 0 && <><i /><span>{hero.runtime} min</span></>}
              {hero.vote_average > 0 && (
                <><i /><span className="flex items-center gap-1"><Star size={11} fill="currentColor" className="text-yellow-400" /> {hero.vote_average.toFixed(1)}</span></>
              )}
              {hero.genres?.slice(0, 3).map((g) => (
                <span key={g.id} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">{g.name}</span>
              ))}
            </div>
            <p className="mt-4 max-w-[470px] text-[13px] leading-6 text-slate-300 line-clamp-3">{hero.overview}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => playItem(hero.id, 'movie')} className="primary-button">
                <Play size={16} fill="currentColor" /> Watch Now
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
                <ListPlus size={17} /> {isInWatchlist(hero.id, 'movie') ? 'Added' : 'Add to Watchlist'}
              </button>
              {hero.videos?.results?.[0] && (
                <button
                  onClick={() => {
                    const key = hero.videos!.results[0].key;
                    window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
                  }}
                  className="secondary-button"
                >
                  <Info size={17} /> Trailer
                </button>
              )}
            </div>
          </div>
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
      )}

      {/* 2. CONTINUE WATCHING */}
      {continueWatching.length > 0 && (
        <ContinueWatchingRow items={continueWatching} onPlay={playItem} />
      )}

      {/* 3. TRENDING TODAY (ranked) */}
      <RankedPosterRow title="Trending Today" items={trendingDay.slice(0, 20)} mediaType="movie" />

      {/* 4. POPULAR THIS WEEK (movie + TV mix) */}
      <PosterRow title="Popular This Week" items={popularThisWeek} mediaType="movie" />

      {/* 5. NEW RELEASES */}
      <PosterRow title="New Releases" items={newReleases} mediaType="movie" />

      {/* 6. RECENTLY ADDED */}
      <PosterRow title="Recently Added" items={recentlyAdded} mediaType="movie" />

      {/* 7. COMING SOON */}
      <PosterRow title="Coming Soon" items={comingSoon} mediaType="movie" />

      {/* 8. POPULAR MOVIES BY YEAR */}
      {YEAR_ROWS.map(({ label, year }) =>
        yearData[year] && yearData[year].length > 0 ? (
          <PosterRow key={year} title={label} items={yearData[year]} mediaType="movie"
            onViewAll={() => navigate(`/movies?year=${year}`)} />
        ) : null,
      )}

      {/* 9. POPULAR TV SHOWS */}
      <PosterRow title="Popular TV Shows" items={popularTv} mediaType="tv" />

      {/* 10. TOP RATED */}
      <PosterRow title="Top Rated Movies" items={topRated} mediaType="movie" />
      <PosterRow title="Top Rated TV Shows" items={topRatedTv} mediaType="tv" />

      {/* 11. MOST WATCHED (using trending as proxy) */}
      <RankedPosterRow title="Most Watched" items={trendingWeek} mediaType="movie" />

      {/* 12-21. GENRE ROWS */}
      {GENRE_ROWS.map(({ label, genreId }) =>
        genreData[label] && genreData[label]!.length > 0 ? (
          <PosterRow key={label} title={label} items={genreData[label]!} mediaType="movie"
            onViewAll={() => navigate(`/movies?genre=${genreId}`)} />
        ) : null,
      )}

      {/* 22-32. REGIONAL / DISCOVERY SECTIONS */}
      {REGION_ROWS.map(({ label, region }) => {
        const data = regionData[label];
        if (!data || data.length === 0) return null;
        const isTv = label.includes('TV') || label.includes('Drama') || label.includes('Series') || label.includes('Anime');
        return (
          <PosterRow key={label} title={label} items={data} mediaType={isTv ? 'tv' : 'movie'}
            onViewAll={() => navigate(isTv ? `/tv?region=${region}` : `/movies?region=${region}`)} />
        );
      })}

      {/* 33. POPULAR RIGHT NOW */}
      <PosterRow title="Popular Right Now" items={trendingDay.slice(0, 20)} mediaType="movie" />

      {/* 34. WHAT EVERYONE IS WATCHING */}
      <RankedPosterRow title="What Everyone Is Watching" items={trendingWeek} mediaType="movie" />

      {/* 35. HIDDEN GEMS */}
      <PosterRow title="Hidden Gems" items={hiddenGems} mediaType="movie" />

      {/* 37. MOVIES YOU MIGHT LIKE (random pick) */}
      <PosterRow title="Movies You Might Like" items={randomPick} mediaType="movie" />

      {/* 41. SHORT TV / SHORT MOVIES */}
      <PosterRow title="One-Hour Movies" items={shortMovies} mediaType="movie" />

      {/* 42. RECENTLY WATCHED (from history) */}
      {/* 43. YOUR WATCHLIST */}
      {/* 44. RECOMMENDED FOR YOU */}
      {/* These are personalized and shown on MyListPage */}

      {/* 45. RANDOM PICK */}
      <PosterRow title="Random Pick" items={randomPick} mediaType="movie" />

      {/* 46. STAFF PICKS (using top rated as proxy) */}
      <PosterRow title="Staff Picks" items={topRated.slice(10, 20)} mediaType="movie" />

      {/* 47. WEEKEND WATCH */}
      <PosterRow title="Weekend Watch" items={popularMovies.slice(10, 20)} mediaType="movie" />

      {/* 48. LATE NIGHT PICKS */}
      <PosterRow title="Late Night Picks" items={genreData['Horror'] ?? []} mediaType="movie" />

      {/* 49. FAMILY NIGHT */}
      <PosterRow title="Family Night" items={genreData['Animation'] ?? []} mediaType="movie" />

      {/* TV extras */}
      <PosterRow title="Airing Today" items={airingToday} mediaType="tv" />
      <PosterRow title="On The Air" items={onAir} mediaType="tv" />
      <PosterRow title="Trending TV Shows" items={trendingTv} mediaType="tv" />
    </div>
  );
}
