"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { Leaderboard } from "@/components/Leaderboard";

interface LeaderboardEntry {
  id: string;
  nickname: string;
  hunter_count: number;
  hunted_count: number;
}

export default function RankingPage() {
  const [hunters, setHunters] = useState<LeaderboardEntry[]>([]);
  const [hunted, setHunted] = useState<LeaderboardEntry[]>([]);
  const [highlightId, setHighlightId] = useState<string>();
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    async function load() {
      const [rankRes, meRes] = await Promise.all([
        fetch("/api/ranking?event=BREGA2026"),
        fetch("/api/auth/me"),
      ]);
      if (rankRes.ok) {
        const data = await rankRes.json();
        setHunters(data.hunters ?? []);
        setHunted(data.hunted ?? []);
        setFrozen(data.frozen ?? false);
      }
      if (meRes.ok) {
        const data = await meRes.json();
        if (data.participant) setHighlightId(data.participant.id);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-8">
      <h1 className="mb-2 text-2xl font-black text-white">Ranking</h1>
      {frozen && (
        <p className="mb-4 text-center text-sm text-yellow-300">
          Ranking congelado — vencedores definidos!
        </p>
      )}
      <Leaderboard
        hunters={hunters}
        hunted={hunted}
        highlightId={highlightId}
      />
      <Nav />
    </main>
  );
}
