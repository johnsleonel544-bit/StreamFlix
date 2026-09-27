import { Dialog } from './Dialog';
import { getYouTubeEmbedUrl } from '@/lib/providers';
import type { TmdbVideo } from '@/lib/tmdb-types';
import { getYouTubeThumbnail } from '@/lib/providers';

interface VideoDialogProps {
  video: TmdbVideo | null;
  onClose: () => void;
}

export function VideoDialog({ video, onClose }: VideoDialogProps) {
  const open = !!video;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-3xl">
      {video && (
        <div className="overflow-hidden rounded-2xl">
          <div className="relative aspect-video bg-black">
            <iframe
              src={getYouTubeEmbedUrl(video.key)}
              title={video.name}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white">{video.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
              <span className="rounded bg-white/5 px-2 py-0.5 text-xs uppercase">{video.type}</span>
              {video.official && <span className="text-xs text-emerald-400">Official</span>}
              <span>{video.site}</span>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
