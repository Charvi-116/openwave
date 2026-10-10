type SidebarProps = {
  activeGenre: string;
  genres: string[];
  onGenreChange: (genre: string) => void;
};

export default function Sidebar({ activeGenre, genres, onGenreChange }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-900/80 p-6 xl:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">
          O
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">OpenWave</div>
          <div className="text-xl font-bold">Free music</div>
        </div>
      </div>

      <nav className="space-y-2 text-sm">
        {['Home', 'Browse', 'Radio', 'Library', 'Liked Songs', 'Recently Played'].map((item) => (
          <button
            key={item}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left ${
              item === 'Home' ? 'bg-white/5 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{item}</span>
            {item === 'Library' && <span className="text-xs text-slate-400">12</span>}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">Browse genres</p>
        <div className="space-y-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                activeGenre === genre
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{genre}</span>
              <span className="text-[10px] text-slate-500">{genre === 'All' ? '24' : '8'}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
