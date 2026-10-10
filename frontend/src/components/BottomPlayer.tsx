import { useEffect, useRef, useState } from 'react';
import type { Track } from '../data/mockTracks';

type BottomPlayerProps = {
  track: Track | null;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function BottomPlayer({ track, isPlaying, setIsPlaying, onPrev, onNext }: BottomPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    if (!audioRef.current || !track) return;

    audioRef.current.src = track.streamUrl;
    audioRef.current.volume = volume;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [track, isPlaying, setIsPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => onNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onNext, onPrev, setIsPlaying]);

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  if (!track) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <audio ref={audioRef} preload="metadata" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img src={track.cover} alt={track.title} className="h-14 w-14 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{track.title}</p>
            <p className="truncate text-xs text-slate-400">{track.artist}</p>
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-col items-center gap-2">
          <div className="flex items-center gap-5 text-slate-200">
            <button aria-label="Shuffle" className="text-slate-400 hover:text-white">⤮</button>
            <button aria-label="Previous" onClick={onPrev} className="text-xl hover:text-white">⏮</button>
            <button
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-105"
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button aria-label="Next" onClick={onNext} className="text-xl hover:text-white">⏭</button>
            <button aria-label="Repeat" className="text-slate-400 hover:text-white">↻</button>
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="w-10 text-right text-[11px] text-slate-400">{formatTime(progress)}</span>
            <input
              aria-label="Seek"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-emerald-400"
            />
            <span className="w-10 text-left text-[11px] text-slate-400">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex w-48 items-center justify-end gap-2">
          <span className="text-sm text-slate-400">🔊</span>
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const nextVolume = Number(e.target.value);
              setVolume(nextVolume);
              if (audioRef.current) audioRef.current.volume = nextVolume;
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
