import { useMemo, useState } from 'react';
import BottomPlayer from './components/BottomPlayer';
import Sidebar from './components/Sidebar';
import TrackCard from './components/TrackCard';
import { genres, mockTracks } from './data/mockTracks';

export default function App() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const visibleTracks = useMemo(() => {
    if (activeGenre === 'All') return mockTracks;
    return mockTracks.filter((track) => track.genre === activeGenre);
  }, [activeGenre]);

  const currentTrack = visibleTracks[currentIndex % visibleTracks.length] ?? mockTracks[0];

  const selectTrack = (trackId: string) => {
    const idx = visibleTracks.findIndex((track) => track.id === trackId);
    if (idx >= 0) {
      setCurrentIndex(idx);
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleTracks.length);
  };

  const prevTrack = () => {
    setCurrentIndex((prev) => (prev - 1 + visibleTracks.length) % visibleTracks.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar activeGenre={activeGenre} genres={genres} onGenreChange={setActiveGenre} />

        <main className="flex-1 pb-32">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 px-4 py-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div className="hidden items-center gap-2 md:flex">
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10">Discover</button>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10">Trending</button>
              </div>

              <div className="flex-1 px-2 md:px-10">
                <label className="relative block">
                  <span className="sr-only">Search</span>
                  <input
                    aria-label="Search music"
                    placeholder="Search tracks, artists, albums, PLAYLISTS"
                    className="w-full rounded-full border border-white/10 bg-slate-900/80 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="absolute right-4 top-2.5 text-lg text-slate-400">⌕</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Upgrade</button>
                <button className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">Guest</button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-4 py-8">
            <section className="mb-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Trending today</h2>
                <button className="text-sm text-emerald-300 hover:text-emerald-200">See all</button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {mockTracks.slice(0, 3).map((track) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(track.id)}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg shadow-slate-950/25 hover:border-emerald-400/30"
                  >
                    <div className="relative">
                      <img src={track.cover} alt={track.title} className="h-40 w-full object-cover transition duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-left">
                        <p className="text-sm font-semibold text-white">{track.title}</p>
                        <p className="text-xs text-slate-300">{track.artist}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Editors' picks</h2>
                <button className="text-sm text-slate-300 hover:text-white">More</button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visibleTracks.map((track) => (
                  <TrackCard key={track.id} track={track} onPlay={selectTrack} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Genre stations</h2>
                <button className="text-sm text-slate-300 hover:text-white">Explore all</button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: 'Electronic', gradient: 'from-cyan-500 to-blue-500' },
                  { name: 'Ambient', gradient: 'from-violet-500 to-fuchsia-500' },
                  { name: 'Lo-fi', gradient: 'from-rose-500 to-orange-500' },
                  { name: 'Classical', gradient: 'from-amber-400 to-yellow-400' },
                ].map((station) => (
                  <button key={station.name} className={`rounded-2xl bg-gradient-to-br ${station.gradient} p-5 text-left shadow-lg`}>
                    <p className="text-lg font-semibold">{station.name}</p>
                    <p className="mt-2 text-xs text-white/80">Curated free & legal streams</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      <BottomPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onPrev={prevTrack}
        onNext={nextTrack}
      />
    </div>
  );
}
