export type ProviderKey = '2embed' | 'vidsrc_me' | 'vidsrc_to' | 'peachify';

export interface ProviderInfo {
  key: ProviderKey;
  label: string;
}

export const PROVIDERS: ProviderInfo[] = [
  { key: '2embed', label: '2Embed' },
  { key: 'vidsrc_me', label: 'VidSrc.me' },
  { key: 'vidsrc_to', label: 'VidSrc.to' },
  { key: 'peachify', label: 'Peachify' },
];

export function getEmbedUrl(
  provider: ProviderKey,
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number,
): string {
  switch (provider) {
    case '2embed':
      if (mediaType === 'movie') {
        return `https://www.2embed.online/2embed.php?id=${tmdbId}`;
      }
      if (season != null && episode != null) {
        return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embedtv/${tmdbId}&s=1&e=1`;

    case 'vidsrc_me':
      if (mediaType === 'movie') {
        return `https://vidsrc.sh/embed/movie?tmdb=${tmdbId}`;
      }
      if (season != null && episode != null) {
        return `https://vidsrc.sh/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `https://vidsrc.sh/embed/tv?tmdb=${tmdbId}`;

    case 'vidsrc_to':
      if (mediaType === 'movie') {
        return `https://vidsrc.to/embed/movie/${tmdbId}`;
      }
      if (season != null && episode != null) {
        return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.to/embed/tv/${tmdbId}`;

    case 'peachify':
      if (mediaType === 'movie') {
        return `https://peachify.pro/embed/movie/${tmdbId}`;
      }
      if (season != null && episode != null) {
        return `https://peachify.pro/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://peachify.pro/embed/tv/${tmdbId}/1/1`;

    default:
      return '';
  }
}

export function getYouTubeEmbedUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}`;
}

export function getYouTubeThumbnail(key: string): string {
  return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
}
