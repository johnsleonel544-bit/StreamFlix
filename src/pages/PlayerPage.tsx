import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Play,
  ListPlus,
  Star,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  Share2,
  MessageCircle,
} from 'lucide-react';
import {
  getMovieDetails,
  getTvDetails,
  getTvSeason,
  getMovieCollection,
} from '@/lib/tmdb';
import { PROVIDERS, getEmbedUrl, type ProviderKey } from '@/lib/providers';
import { imageUrl, backdropUrl, profileUrl, stillUrl } from '@/lib/tmdb-config';
import type {
  TmdbMovie,
  TmdbTv,
  TmdbSeason,
  TmdbVideo,
  TmdbReview,
  TmdbCollection,
} from '@/lib/tmdb-types';
import { useWatchHistory, useWatchlist } from '@/lib/hooks';
import { navigate } from '@/lib/router';
import { CastDialog } from '@/components/CastDialog';
import { DetailsDialog } from '@/components/DetailsDialog';
import { VideoDialog } from '@/components/VideoDialog';
import { CastCard, VideoCard, ReviewCard, PosterCard } from '@/components/Cards';

export function PlayerPage({ mediaType, tmdbId }: { mediaType: 'movie' | 'tv'; tmdbId: number }) {
  const [data, setData] = useState<TmdbMovie | TmdbTv | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderKey>('vidsrc_to');
  const [season, setSeason] = useState<TmdbSeason | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [collection, setCollection] = useState<TmdbCollection | null>(null);
  const [castDialog, setCastDialog] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [videoDialog, setVideoDialog] = useState<TmdbVideo | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const { upsertProgress, continueWatching } = useWatchHistory();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Fetch main content
  useEffect(() => {
    setLoading(true);
    setData(null);
    if (mediaType === 'movie') {
      getMovieDetails(tmdbId)
        .then((d) => {
          setData(d);
          if (d.belongs_to_collection) {
            getMovieCollection(d.belongs_to_collection.id).then(setCollection).catch(() => {});
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      getTvDetails(tmdbId)
        .then((d) => {
          setData(d);
          setLoading(false);
          // Fetch first season episodes
          if (d.seasons && d.seasons.length > 0) {
            const firstRealSeason = d.seasons.find((s) => s.season_number > 0) || d.seasons[0];
            setSelectedSeason(firstRealSeason.season_number);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [tmdbId, mediaType]);

  // Fetch season episodes when season changes
  useEffect(() => {
    if (mediaType !== 'tv' || !tmdbId) return;
    getTvSeason(tmdbId, selectedSeason)
      .then(setSeason)
      .catch(() => setSeason(null));
  }, [tmdbId, selectedSeason, mediaType]);

  // Scroll detection for mini-player
  useEffect(() => {
    const handler = () => {
      if (!playerRef.current) return;
      const rect = playerRef.current.getBoundingClientRect();
      setMiniPlayer(rect.bottom < 80);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Track watch progress (simulated via timestamp since iframe doesn't expose it)
  const trackProgress = useCallback(() => {
    if (!data) return;
    const title = mediaType === 'movie' ? (data as TmdbMovie).title : (data as TmdbTv).name;
    const runtime = mediaType === 'movie'
      ? (data as TmdbMovie).runtime
      : (data as TmdbTv).episode_run_time?.[0];
    const duration = runtime ? runtime * 60 : null;

    upsertProgress({
      tmdb_id: tmdbId,
      media_type: mediaType,
      title,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      season_number: mediaType === 'tv' ? selectedSeason : null,
      episode_number: mediaType === 'tv' ? selectedEpisode : null,
      episode_name: mediaType === 'tv' ? season?.episodes?.find((e) => e.episode_number === selectedEpisode)?.name : null,
      runtime,
      position: 1, // Mark as started
      duration,
      completed: false,
    });
  }, [data, mediaType, tmdbId, selectedSeason, selectedEpisode, season, upsertProgress]);

  const isMovie = mediaType === 'movie';
  const title = isMovie ? (data as TmdbMovie)?.title : (data as TmdbTv)?.name;
  const releaseDate = isMovie ? (data as TmdbMovie)?.release_date : (data as TmdbTv)?.first_air_date;
  const year = releaseDate ? releaseDate.slice(0, 4) : '';
  const runtime = isMovie ? (data as TmdbMovie)?.runtime : (data as TmdbTv)?.episode_run_time?.[0];
  const genres = data?.genres ?? [];
  const cast = data?.credits?.cast ?? [];
  const videos = data?.videos?.results ?? [];
  const reviews = data?.reviews?.results ?? [];
  const recommendations = data?.recommendations?.results ?? [];
  const similar = data?.similar?.results ?? [];

  const embedUrl = getEmbedUrl(
    provider,
    tmdbId,
    mediaType,
    mediaType === 'tv' ? selectedSeason : undefined,
    mediaType === 'tv' ? selectedEpisode : undefined,
  );

  if (loading) {
    return (
      <div className="pt-[72px] lg:ml-[184px]">
        <div className="aspect-video w-full animate-pulse bg-white/5" />
        <div className="content-section space-y-4 pt-8">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-4 w-96 rounded" />
          <div className="skeleton h-4 w-full rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="content-section flex flex-col items-center justify-center pt-32 text-center">
        <p className="text-lg text-slate-400">Failed to load content.</p>
        <button onClick={() => navigate('/')} className="mt-4 primary-button">Go Home</button>
      </div>
    );
  }

  const synopsis = data.overview || '';
  const isLongSynopsis = synopsis.length > 200;

  return (
    <div className="pt-[72px] lg:ml-[184px]">
      {/* STICKY PLAYER */}
      <div ref={playerRef} className="relative aspect-video w-full bg-black">
        <iframe
          key={embedUrl}
          src={embedUrl}
          className="h-full w-full"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={trackProgress}
          title={title}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* MINI PLAYER (mobile) */}
      {miniPlayer && (
        <div className="fixed bottom-16 right-3 z-40 w-44 overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl sm:w-56 lg:bottom-3">
          <div className="relative aspect-video">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="autoplay; fullscreen; encrypted-media"
              title={title}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center justify-between p-2">
            <p className="truncate text-[10px] font-semibold text-white">{title}</p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-400 hover:text-white"
              aria-label="Expand player"
            >
              <ChevronDown size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        {/* SOURCE SELECTOR */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Streaming Source</p>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.key}
                onClick={() => setProvider(p.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  provider === p.key
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>

        {/* Rating / Year / Runtime / Genres */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          {data.vote_average > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Star size={14} fill="currentColor" /> {data.vote_average.toFixed(1)}
            </span>
          )}
          {year && <><i /> <span>{year}</span></>}
          {runtime != null && runtime > 0 && <><i /> <span>{runtime} min</span></>}
          {genres.length > 0 && (
            <><i /> <span>{genres.map((g) => g.name).join(' · ')}</span></>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (playerRef.current) {
                playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="primary-button"
          >
            <Play size={16} fill="currentColor" /> Play
          </button>
          <button
            onClick={() => toggleWatchlist({
              tmdb_id: tmdbId,
              media_type: mediaType,
              title: title || '',
              poster_path: data.poster_path,
              backdrop_path: data.backdrop_path,
            })}
            className="secondary-button"
          >
            <ListPlus size={17} /> {isInWatchlist(tmdbId, mediaType) ? 'Added' : 'My List'}
          </button>
          <button
            onClick={() => setDetailsOpen(true)}
            className="secondary-button"
          >
            <Info size={17} /> Details
          </button>
        </div>

        {/* SHORT SYNOPSIS */}
        {synopsis && (
          <div className="mt-5">
            <p className={`text-sm leading-6 text-slate-300 ${!showFullSynopsis && isLongSynopsis ? 'line-clamp-3' : ''}`}>
              {synopsis}
            </p>
            {isLongSynopsis && (
              <button
                onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                className="mt-1 text-xs font-semibold text-[#f52432] hover:text-[#ff3340]"
              >
                {showFullSynopsis ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        {/* TV EPISODES */}
        {mediaType === 'tv' && (data as TmdbTv).seasons && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Episodes</h2>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                  }}
                  className="appearance-none rounded-lg border border-white/10 bg-[#0d1117] px-4 py-1.5 pr-8 text-sm text-white outline-none focus:border-white/20"
                >
                  {(data as TmdbTv).seasons!
                    .filter((s) => s.season_number >= 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`}
                      </option>
                    ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="space-y-3">
              {season?.episodes?.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEpisode(ep.episode_number)}
                  className={`group flex gap-4 rounded-lg border p-3 text-left transition-colors ${
                    selectedEpisode === ep.episode_number
                      ? 'border-[#f52432]/30 bg-[#f52432]/5'
                      : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-md sm:w-44">
                    {ep.still_path ? (
                      <img src={stillUrl(ep.still_path)} alt={ep.name} className="h-full w-full object-cover" />
                    ) : data.backdrop_path ? (
                      <img src={backdropUrl(data.backdrop_path, 'w300')} alt={ep.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-white/5 text-slate-700">
                        <Play size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play size={24} fill="white" className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f52432]">E{ep.episode_number}</span>
                      <p className="truncate text-sm font-semibold text-white">{ep.name}</p>
                    </div>
                    {ep.air_date && (
                      <p className="mt-0.5 text-[11px] text-slate-500">{ep.air_date}</p>
                    )}
                    {ep.runtime != null && ep.runtime > 0 && (
                      <p className="text-[11px] text-slate-500">{ep.runtime} min</p>
                    )}
                    {ep.overview && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{ep.overview}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* UP NEXT (TV) */}
        {mediaType === 'tv' && season?.episodes && selectedEpisode < season.episodes.length && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-white">Up Next</h2>
            {(() => {
              const next = season.episodes.find((e) => e.episode_number === selectedEpisode + 1);
              if (!next) return null;
              return (
                <button
                  onClick={() => setSelectedEpisode(next.episode_number)}
                  className="group flex gap-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-md sm:w-44">
                    {next.still_path ? (
                      <img src={stillUrl(next.still_path)} alt={next.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-white/5 text-slate-700">
                        <Play size={20} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#f52432]">Up Next · E{next.episode_number}</span>
                    <p className="truncate text-sm font-semibold text-white">{next.name}</p>
                    {next.overview && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{next.overview}</p>
                    )}
                  </div>
                </button>
              );
            })()}
          </div>
        )}

        {/* CAST & CREW */}
        {cast.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Cast & Crew</h2>
              {cast.length > 10 && (
                <button
                  onClick={() => setShowAllCast(!showAllCast)}
                  className="text-xs font-semibold text-[#f52432] hover:text-[#ff3340]"
                >
                  {showAllCast ? 'Show Less' : 'View All Cast'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
              {(showAllCast ? cast : cast.slice(0, 8)).map((member) => (
                <CastCard
                  key={member.id}
                  member={member}
                  onClick={() => setCastDialog(member.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TRAILERS & VIDEOS */}
        {videos.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Trailers & Videos</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {videos.slice(0, 9).map((video) => (
                <VideoCard key={video.id} video={video} onClick={() => setVideoDialog(video)} />
              ))}
            </div>
          </div>
        )}

        {/* MORE LIKE THIS */}
        {similar.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">More Like This</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {similar.slice(0, 12).map((item) => (
                <PosterCard key={item.id} item={item} mediaType={mediaType} />
              ))}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {recommendations.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Recommendations</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {recommendations.slice(0, 12).map((item) => (
                <PosterCard key={item.id} item={item} mediaType={mediaType} />
              ))}
            </div>
          </div>
        )}

        {/* COLLECTION / FRANCHISE */}
        {collection && collection.parts.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">{collection.name}</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {collection.parts.map((item) => (
                <PosterCard key={item.id} item={item} mediaType="movie" />
              ))}
            </div>
          </div>
        )}

        {/* RATINGS & REVIEWS */}
        {reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Ratings & Reviews</h2>
            <div className="space-y-3">
              {reviews.slice(0, 4).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* FULL DETAILS */}
        <div className="mt-8">
          <button
            onClick={() => setDetailsOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.05]"
          >
            <span className="flex items-center gap-2"><Info size={16} /> Full Details</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* DIALOGS */}
      <CastDialog
        personId={castDialog}
        characterName={cast.find((c) => c.id === castDialog)?.character}
        onClose={() => setCastDialog(null)}
      />
      <DetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={data}
        mediaType={mediaType}
      />
      <VideoDialog video={videoDialog} onClose={() => setVideoDialog(null)} />
    </div>
  );
}
