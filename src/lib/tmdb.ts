import { TMDB_API_KEY, TMDB_BASE_URL } from './tmdb-config';
import type {
  TmdbMovie,
  TmdbTv,
  TmdbSeason,
  TmdbPerson,
  TmdbSearchResults,
  TmdbCollection,
} from './tmdb-types';

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T;
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDb API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json() as T;
  cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

// ─── Trending ──────────────────────────────────────────────
export function getTrendingMovies(window: 'day' | 'week' = 'week'): Promise<{ results: TmdbMovie[] }> {
  return tmdbFetch(`/trending/movie/${window}`);
}

export function getTrendingTv(window: 'day' | 'week' = 'week'): Promise<{ results: TmdbTv[] }> {
  return tmdbFetch(`/trending/tv/${window}`);
}

export function getTrendingAll(window: 'day' | 'week' = 'day'): Promise<{ results: (TmdbMovie | TmdbTv)[] }> {
  return tmdbFetch(`/trending/all/${window}`);
}

// ─── Movies ────────────────────────────────────────────────
export function getPopularMovies(page = 1): Promise<{ results: TmdbMovie[]; total_pages: number; page: number }> {
  return tmdbFetch('/movie/popular', { page: String(page) });
}

export function getTopRatedMovies(page = 1): Promise<{ results: TmdbMovie[]; total_pages: number; page: number }> {
  return tmdbFetch('/movie/top_rated', { page: String(page) });
}

export function getNowPlayingMovies(page = 1): Promise<{ results: TmdbMovie[]; total_pages: number; page: number }> {
  return tmdbFetch('/movie/now_playing', { page: String(page) });
}

export function getUpcomingMovies(page = 1): Promise<{ results: TmdbMovie[]; total_pages: number; page: number }> {
  return tmdbFetch('/movie/upcoming', { page: String(page) });
}

export function getMovieDetails(id: number): Promise<TmdbMovie> {
  return tmdbFetch(`/movie/${id}`, {
    append_to_response: 'alternative_titles,credits,external_ids,images,keywords,recommendations,reviews,similar,videos,watch_providers,release_dates',
  });
}

export function getMovieCollection(id: number): Promise<TmdbCollection> {
  return tmdbFetch(`/collection/${id}`);
}

// ─── TV ────────────────────────────────────────────────────
export function getPopularTv(page = 1): Promise<{ results: TmdbTv[]; total_pages: number; page: number }> {
  return tmdbFetch('/tv/popular', { page: String(page) });
}

export function getTopRatedTv(page = 1): Promise<{ results: TmdbTv[]; total_pages: number; page: number }> {
  return tmdbFetch('/tv/top_rated', { page: String(page) });
}

export function getAiringTodayTv(page = 1): Promise<{ results: TmdbTv[]; total_pages: number; page: number }> {
  return tmdbFetch('/tv/airing_today', { page: String(page) });
}

export function getOnTheAirTv(page = 1): Promise<{ results: TmdbTv[]; total_pages: number; page: number }> {
  return tmdbFetch('/tv/on_the_air', { page: String(page) });
}

export function getTvDetails(id: number): Promise<TmdbTv> {
  return tmdbFetch(`/tv/${id}`, {
    append_to_response: 'alternative_titles,credits,external_ids,images,keywords,recommendations,reviews,similar,videos,watch_providers',
  });
}

export function getTvSeason(tvId: number, seasonNumber: number): Promise<TmdbSeason> {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
}

// ─── People ────────────────────────────────────────────────
export function getPersonDetails(personId: number): Promise<TmdbPerson> {
  return tmdbFetch(`/person/${personId}`, {
    append_to_response: 'movie_credits,tv_credits,combined_credits,images,external_ids',
  });
}

// ─── Search ─────────────────────────────────────────────────
export function searchMulti(query: string, page = 1): Promise<TmdbSearchResults> {
  return tmdbFetch('/search/multi', { query, page: String(page) });
}

export function searchMovies(query: string, page = 1): Promise<TmdbSearchResults> {
  return tmdbFetch('/search/movie', { query, page: String(page) });
}

export function searchTv(query: string, page = 1): Promise<TmdbSearchResults> {
  return tmdbFetch('/search/tv', { query, page: String(page) });
}

// ─── Discover ──────────────────────────────────────────────
export function discoverMovies(opts: {
  genreId?: number;
  page?: number;
  sortBy?: string;
  year?: number;
  withRuntimeLte?: number;
  voteCountGte?: number;
  withOriginCountry?: string;
  withKeywords?: number;
}): Promise<{ results: TmdbMovie[]; total_pages: number; page: number }> {
  const params: Record<string, string> = {
    sort_by: opts.sortBy ?? 'popularity.desc',
    page: String(opts.page ?? 1),
    'vote_count.gte': String(opts.voteCountGte ?? 0),
    include_adult: 'false',
  };
  if (opts.genreId) params.with_genres = String(opts.genreId);
  if (opts.year) params.primary_release_year = String(opts.year);
  if (opts.withRuntimeLte) params['with_runtime.lte'] = String(opts.withRuntimeLte);
  if (opts.withOriginCountry) params.with_origin_country = opts.withOriginCountry;
  if (opts.withKeywords) params.with_keywords = String(opts.withKeywords);
  return tmdbFetch('/discover/movie', params);
}

export function discoverTv(opts: {
  genreId?: number;
  page?: number;
  sortBy?: string;
  year?: number;
  voteCountGte?: number;
  withOriginCountry?: string;
}): Promise<{ results: TmdbTv[]; total_pages: number; page: number }> {
  const params: Record<string, string> = {
    sort_by: opts.sortBy ?? 'popularity.desc',
    page: String(opts.page ?? 1),
    'vote_count.gte': String(opts.voteCountGte ?? 0),
    include_adult: 'false',
  };
  if (opts.genreId) params.with_genres = String(opts.genreId);
  if (opts.year) params.first_air_date_year = String(opts.year);
  if (opts.withOriginCountry) params.with_origin_country = opts.withOriginCountry;
  return tmdbFetch('/discover/tv', params);
}

// ─── Genres ────────────────────────────────────────────────
export function getMovieGenres(): Promise<{ genres: { id: number; name: string }[] }> {
  return tmdbFetch('/genre/movie/list');
}

export function getTvGenres(): Promise<{ genres: { id: number; name: string }[] }> {
  return tmdbFetch('/genre/tv/list');
}

// ─── Mixed / Curated ───────────────────────────────────────
export async function getPopularThisWeek(): Promise<{ results: (TmdbMovie | TmdbTv)[] }> {
  const [movies, tv] = await Promise.all([getPopularMovies(), getPopularTv()]);
  const mixed = [...movies.results.slice(0, 10), ...tv.results.slice(0, 10)];
  mixed.sort((a, b) => b.popularity - a.popularity);
  return { results: mixed };
}

export async function getHiddenGems(): Promise<{ results: TmdbMovie[] }> {
  return discoverMovies({ voteCountGte: 50, sortBy: 'vote_average.desc' });
}

export async function getShortMovies(): Promise<{ results: TmdbMovie[] }> {
  return discoverMovies({ withRuntimeLte: 90, voteCountGte: 20, sortBy: 'popularity.desc' });
}

export async function getRandomPick(): Promise<{ results: TmdbMovie[] }> {
  const page = Math.floor(Math.random() * 50) + 1;
  return getPopularMovies(page);
}

// ─── TMDb genre IDs ─────────────────────────────────────────
export const GENRE_IDS = {
  action: 28,
  comedy: 35,
  horror: 27,
  romance: 10749,
  thriller: 53,
  scifi: 878,
  fantasy: 14,
  crime: 80,
  adventure: 12,
  animation: 16,
  documentary: 99,
  history: 36,
  war: 10752,
  western: 37,
  family: 10751,
  music: 10402,
  mystery: 9648,
  tvMovie: 10770,
} as const;

export const REGION_CODES = {
  kenya: 'KE',
  nigeria: 'NG',
  southAfrica: 'ZA',
  ghana: 'GH',
  korea: 'KR',
  india: 'IN',
  turkey: 'TR',
  japan: 'JP',
} as const;
