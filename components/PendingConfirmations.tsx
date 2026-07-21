"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PendingMission {
  id: string;
  status: string;
  hunter: {
    nickname: string;
    songs: { title: string; artist: string } | null;
  };
  encounters: { photo_url: string | null } | null;
}

export function PendingConfirmations() {
  const [pending, setPending] = useState<PendingMission[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/missions");
      if (res.ok) {
        const data = await res.json();
        setPending(data.pendingConfirmations ?? []);
      }
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  if (pending.length === 0) return null;

  return (
    <div className="rounded-2xl border border-yellow-400/50 bg-yellow-500/10 p-4">
      <h2 className="mb-3 font-black uppercase text-yellow-300">
        Confirmações pendentes
      </h2>
      <div className="space-y-3">
        {pending.map((m) => (
          <Link
            key={m.id}
            href={`/missao/${m.id}`}
            className="block rounded-xl bg-purple-900/50 p-3 transition hover:bg-purple-800/50"
          >
            <p className="font-bold text-white">
              {m.status === "awaiting_song"
                ? `${m.hunter.nickname} quer confirmar música`
                : `${m.hunter.nickname} enviou uma foto`}
            </p>
            <p className="text-sm text-purple-300">Toque para confirmar</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
