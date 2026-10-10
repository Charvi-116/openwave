import type { Track } from '../data/mockTracks';

type TrackCardProps = {
  track: Track;
  onPlay: (trackId: string) => void;
};

export default function TrackCard({ track, onPlay }: TrackCardProps) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-slate-900 p-3 shadow-lg shadow-slate-950/25 hover:border-emerald-400/30">
      <div className="relative">
        <img src={track.cover} alt={track.title} className="h-44 w-full rounded-xl object-cover" />
        <button
          onClick={() => onPlay(track.id)}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-slate-950 shadow-lg hover:scale-105"
          aria-label={`Play ${track.title}`}
        >
          ▶
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">{track.title}</p>
          <p className="truncate text-sm text-slate-400">{track.artist}</p>
        </div>
        <button aria-label="Like track" className="text-lg text-slate-400 hover:text-pink-400">♥</button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{track.genre}</span>
        <span>{track.license}</span>
      </div>
    </div>
  );
}
