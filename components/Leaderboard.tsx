"use client";

interface LeaderboardEntry {
  id: string;
  nickname: string;
  hunter_count: number;
  hunted_count: number;
}

export function Leaderboard({
  hunters,
  hunted,
  highlightId,
}: {
  hunters: LeaderboardEntry[];
  hunted: LeaderboardEntry[];
  highlightId?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-pink-500/30 bg-purple-950/50 p-4">
        <h3 className="mb-3 text-center font-black uppercase text-pink-400">
          Top Caçadores
        </h3>
        <ol className="space-y-2">
          {hunters.slice(0, 10).map((entry, i) => (
            <li
              key={entry.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                entry.id === highlightId ? "bg-pink-500/30" : "bg-purple-900/30"
              }`}
            >
              <span className="font-bold text-yellow-300">#{i + 1}</span>
              <span className="flex-1 px-2 text-white">{entry.nickname}</span>
              <span className="font-black text-pink-300">
                {entry.hunter_count}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-2xl border border-yellow-500/30 bg-purple-950/50 p-4">
        <h3 className="mb-3 text-center font-black uppercase text-yellow-400">
          Mais Caçados
        </h3>
        <ol className="space-y-2">
          {hunted.slice(0, 10).map((entry, i) => (
            <li
              key={entry.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                entry.id === highlightId
                  ? "bg-yellow-500/30"
                  : "bg-purple-900/30"
              }`}
            >
              <span className="font-bold text-yellow-300">#{i + 1}</span>
              <span className="flex-1 px-2 text-white">{entry.nickname}</span>
              <span className="font-black text-yellow-300">
                {entry.hunted_count}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function LeaderboardMini({
  hunters,
  hunted,
}: {
  hunters: LeaderboardEntry[];
  hunted: LeaderboardEntry[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="mb-2 font-bold uppercase text-pink-400">Caçadores</p>
        {hunters.slice(0, 5).map((e, i) => (
          <p key={e.id} className="text-purple-100">
            {i + 1}. {e.nickname} ({e.hunter_count})
          </p>
        ))}
      </div>
      <div>
        <p className="mb-2 font-bold uppercase text-yellow-400">Caçados</p>
        {hunted.slice(0, 5).map((e, i) => (
          <p key={e.id} className="text-purple-100">
            {i + 1}. {e.nickname} ({e.hunted_count})
          </p>
        ))}
      </div>
    </div>
  );
}
