import { Play, Star } from 'lucide-react';
import { imageUrl, backdropUrl, profileUrl } from '@/lib/tmdb-config';
import type { TmdbMovie, TmdbTv, TmdbCastMember, TmdbVideo, TmdbReview } from '@/lib/tmdb-types';
import { navigate } from '@/lib/router';
import { getYouTubeThumbnail } from '@/lib/providers';
import { useState } from 'react';

type MediaItem = TmdbMovie | TmdbTv;

function getTitle(item: MediaItem): string {
  return 'title' in item ? (item as TmdbMovie).title : (item as TmdbTv).name;
}

function getDate(item: MediaItem): string {
  return 'release_date' in item ? (item as TmdbMovie).release_date : (item as TmdbTv).first_air_date;
}

export function PosterCard({ item, mediaType }: { item: MediaItem; mediaType: 'movie' | 'tv' }) {
  const title = getTitle(item);
  const date = getDate(item);
  const year = date ? date.slice(0, 4) : '';

  return (
    <button
      onClick={() => navigate(`/player/${mediaType}/${item.id}`)}
      className="poster-card group"
    >
      {item.poster_path ? (
        <img src={imageUrl(item.poster_path, 'w342')} alt={title} />
      ) : (
        <div className="grid aspect-[2/3] place-items-center bg-white/5 text-xs text-slate-600">No Image</div>
      )}
      <span className="poster-shade" />
      <span className="poster-name">{title}{year && ` (${year})`}</span>
      {item.vote_average > 0 && (
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
          <Star size={9} fill="currentColor" /> {item.vote_average.toFixed(1)}
        </span>
      )}
    </button>
  );
}

export function PosterRow({
  title,
  items,
  mediaType,
  onViewAll,
}: {
  title: string;
  items: MediaItem[];
  mediaType: 'movie' | 'tv';
  onViewAll?: () => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>{title}</h2>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs font-semibold text-[#f52432] hover:text-[#ff3340]">
            View Full List →
          </button>
        )}
      </div>
      <div className="poster-row">
        {items.map((item) => (
          <PosterCard key={item.id} item={item} mediaType={mediaType} />
        ))}
      </div>
    </section>
  );
}

export function RankedPosterRow({
  title,
  items,
  mediaType,
}: {
  title: string;
  items: MediaItem[];
  mediaType: 'movie' | 'tv';
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="poster-row">
        {items.map((item, idx) => (
          <div key={item.id} className="relative flex-shrink-0">
            <span className="absolute -left-1 -top-2 z-10 text-5xl font-black text-white/15 drop-shadow-lg sm:text-6xl"
              style={{ textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>
              {idx + 1}
            </span>
            <PosterCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContinueWatchingRow({
  items,
  onPlay,
}: {
  items: { tmdb_id: number; media_type: 'movie' | 'tv'; title: string; poster_path: string | null; backdrop_path: string | null; season_number: number | null; episode_number: number | null; position: number; duration: number | null }[];
  onPlay: (tmdbId: number, mediaType: 'movie' | 'tv') => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>Continue Watching</h2>
      </div>
      <div className="poster-row">
        {items.map((item) => {
          const progress = item.duration && item.duration > 0 ? (item.position / item.duration) * 100 : 0;
          return (
            <button
              key={`${item.tmdb_id}-${item.media_type}`}
              onClick={() => onPlay(item.tmdb_id, item.media_type)}
              className="poster-card group relative"
            >
              {item.backdrop_path ? (
                <img src={backdropUrl(item.backdrop_path, 'w300')} alt={item.title} className="aspect-video w-full object-cover" />
              ) : item.poster_path ? (
                <img src={imageUrl(item.poster_path, 'w342')} alt={item.title} />
              ) : (
                <div className="grid aspect-[2/3] place-items-center bg-white/5 text-xs text-slate-600">No Image</div>
              )}
              <span className="poster-shade" />
              <span className="poster-name">{item.title}</span>
              {item.season_number != null && item.episode_number != null && (
                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  S{item.season_number} E{item.episode_number}
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-[#f52432]" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f52432]/90">
                  <Play size={20} fill="white" className="text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function CastCard({ member, onClick }: { member: TmdbCastMember; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group text-left">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5">
        {member.profile_path ? (
          <img
            src={profileUrl(member.profile_path, 'w185')}
            alt={member.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-2xl text-slate-700">
            {member.name[0]}
          </div>
        )}
      </div>
      <p className="mt-1.5 truncate text-xs font-semibold text-white">{member.name}</p>
      <p className="truncate text-[11px] text-slate-500">{member.character}</p>
    </button>
  );
}

export function VideoCard({ video, onClick }: { video: TmdbVideo; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group relative aspect-video overflow-hidden rounded-lg bg-white/5">
      <img
        src={getYouTubeThumbnail(video.key)}
        alt={video.name}
        className="h-full w-full object-cover opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f52432]/90 transition-transform group-hover:scale-110">
          <Play size={20} fill="white" className="text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="truncate text-xs font-semibold text-white">{video.name}</p>
        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="rounded bg-white/20 px-1 uppercase">{video.type}</span>
          {video.official && <span className="text-emerald-400">Official</span>}
        </div>
      </div>
    </button>
  );
}

export function ReviewCard({ review }: { review: TmdbReview }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content.length > 300;
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-bold text-white">
          {review.author[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{review.author}</p>
          {review.rating != null && (
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={11} fill="currentColor" /> {review.rating}/10
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {expanded ? review.content : isLong ? review.content.slice(0, 300) + '...' : review.content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-semibold text-[#f52432] hover:text-[#ff3340]"
        >
          {expanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
}

export function SkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="content-section">
      <div className="section-heading">
        <div className="skeleton h-5 w-32 rounded" />
      </div>
      <div className="poster-row">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-md bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-md bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}
