import { Dialog } from './Dialog';
import { getYouTubeEmbedUrl } from '@/lib/providers';
import type { TmdbMovie, TmdbTv } from '@/lib/tmdb-types';
import { backdropUrl, imageUrl } from '@/lib/tmdb-config';

interface DetailsDialogProps {
  open: boolean;
  onClose: () => void;
  data: TmdbMovie | TmdbTv | null;
  mediaType: 'movie' | 'tv';
}

export function DetailsDialog({ open, onClose, data, mediaType }: DetailsDialogProps) {
  if (!data) return null;

  const isMovie = mediaType === 'movie';
  const title = isMovie ? (data as TmdbMovie).title : (data as TmdbTv).name;
  const originalTitle = isMovie ? (data as TmdbMovie).original_title : (data as TmdbTv).original_name;
  const releaseDate = isMovie ? (data as TmdbMovie).release_date : (data as TmdbTv).first_air_date;
  const lastAirDate = !isMovie ? (data as TmdbTv).last_air_date : undefined;
  const runtime = isMovie ? (data as TmdbMovie).runtime : (data as TmdbTv).episode_run_time?.[0];
  const seasons = !isMovie ? (data as TmdbTv).number_of_seasons : undefined;
  const episodes = !isMovie ? (data as TmdbTv).number_of_episodes : undefined;
  const budget = isMovie ? (data as TmdbMovie).budget : undefined;
  const revenue = isMovie ? (data as TmdbMovie).revenue : undefined;
  const imdbId = isMovie ? (data as TmdbMovie).imdb_id : (data as TmdbTv).external_ids?.imdb_id;
  const collection = isMovie ? (data as TmdbMovie).belongs_to_collection : undefined;
  const networks = !isMovie ? (data as TmdbTv).networks : undefined;
  const externalIds = data.external_ids;
  const genres = data.genres ?? [];
  const keywords = isMovie
    ? (data as TmdbMovie).keywords?.keywords ?? []
    : (data as TmdbTv).keywords?.results ?? [];
  const productionCompanies = data.production_companies ?? [];
  const productionCountries = data.production_countries ?? [];
  const spokenLanguages = data.spoken_languages ?? [];
  const originCountries = data.origin_country ?? [];

  const formatMoney = (n: number) =>
    n > 0 ? `$${n.toLocaleString('en-US')}` : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-3xl">
      <div className="max-h-[85vh] overflow-y-auto">
        {/* Backdrop header */}
        <div className="relative h-44 overflow-hidden sm:h-56">
          {data.backdrop_path ? (
            <img
              src={backdropUrl(data.backdrop_path, 'w780')}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-[#1a1f2e] to-[#0d1117]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {originalTitle && originalTitle !== title && (
              <p className="text-sm text-slate-400">{originalTitle}</p>
            )}
            {data.tagline && <p className="mt-1 text-sm italic text-slate-500">"{data.tagline}"</p>}
          </div>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-4">
          {/* Quick facts */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            {data.status && (
              <div><span className="text-slate-500">Status: </span><span className="text-white">{data.status}</span></div>
            )}
            {releaseDate && (
              <div>
                <span className="text-slate-500">{isMovie ? 'Release: ' : 'First Air: '}</span>
                <span className="text-white">{releaseDate}</span>
              </div>
            )}
            {lastAirDate && (
              <div><span className="text-slate-500">Last Air: </span><span className="text-white">{lastAirDate}</span></div>
            )}
            {runtime != null && runtime > 0 && (
              <div><span className="text-slate-500">Runtime: </span><span className="text-white">{runtime} min</span></div>
            )}
            {seasons != null && (
              <div><span className="text-slate-500">Seasons: </span><span className="text-white">{seasons}</span></div>
            )}
            {episodes != null && (
              <div><span className="text-slate-500">Episodes: </span><span className="text-white">{episodes}</span></div>
            )}
            <div><span className="text-slate-500">Rating: </span><span className="text-white">{data.vote_average?.toFixed(1)}/10</span></div>
            <div><span className="text-slate-500">Votes: </span><span className="text-white">{data.vote_count?.toLocaleString()}</span></div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g.id} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{g.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {keywords.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.slice(0, 15).map((k) => (
                  <span key={k.id} className="rounded bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-500">{k.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Production */}
          {productionCompanies.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Production</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                {productionCompanies.map((c) => (
                  <span key={c.id}>{c.name}</span>
                ))}
              </div>
            </div>
          )}

          {networks && networks.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Networks</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                {networks.map((n) => (
                  <span key={n.id}>{n.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Countries & Languages */}
          {(productionCountries.length > 0 || spokenLanguages.length > 0 || originCountries.length > 0) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              {productionCountries.length > 0 && (
                <div>
                  <span className="text-slate-500">Countries: </span>
                  <span className="text-white">{productionCountries.map((c) => c.name).join(', ')}</span>
                </div>
              )}
              {spokenLanguages.length > 0 && (
                <div>
                  <span className="text-slate-500">Languages: </span>
                  <span className="text-white">{spokenLanguages.map((l) => l.english_name).join(', ')}</span>
                </div>
              )}
              {originCountries.length > 0 && (
                <div>
                  <span className="text-slate-500">Origin: </span>
                  <span className="text-white">{originCountries.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Budget & Revenue (movies only) */}
          {(budget != null || revenue != null) && (budget! > 0 || revenue! > 0) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              {budget != null && budget > 0 && (
                <div><span className="text-slate-500">Budget: </span><span className="text-white">{formatMoney(budget)}</span></div>
              )}
              {revenue != null && revenue > 0 && (
                <div><span className="text-slate-500">Revenue: </span><span className="text-white">{formatMoney(revenue)}</span></div>
              )}
            </div>
          )}

          {/* External IDs */}
          {(imdbId || externalIds) && (
            <div className="flex gap-3 text-sm">
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  IMDb
                </a>
              )}
              {externalIds?.facebook_id && (
                <a
                  href={`https://facebook.com/${externalIds.facebook_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  Facebook
                </a>
              )}
              {externalIds?.instagram_id && (
                <a
                  href={`https://instagram.com/${externalIds.instagram_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  Instagram
                </a>
              )}
              {externalIds?.twitter_id && (
                <a
                  href={`https://twitter.com/${externalIds.twitter_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  Twitter
                </a>
              )}
              {data.homepage && (
                <a
                  href={data.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  Homepage
                </a>
              )}
            </div>
          )}

          {/* Collection */}
          {collection && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white">Part of: {collection.name}</h3>
              {collection.backdrop_path && (
                <img
                  src={backdropUrl(collection.backdrop_path, 'w300')}
                  alt={collection.name}
                  className="mt-2 h-20 w-full rounded-md object-cover"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
