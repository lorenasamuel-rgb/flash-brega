export function SongCard({
  title,
  artist,
  label = "Sua música brega",
}: {
  title: string;
  artist: string;
  label?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-yellow-400/60 bg-gradient-to-br from-purple-900/80 to-pink-900/80 p-5 text-center shadow-lg shadow-pink-500/20">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-yellow-300">
        {label}
      </p>
      <p className="text-2xl font-black uppercase text-white">{title}</p>
      <p className="mt-1 text-sm text-purple-200">{artist}</p>
    </div>
  );
}
