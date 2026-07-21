"use client";

import { useEffect, useState } from "react";
import { LeaderboardMini } from "./Leaderboard";

interface FeedItem {
  id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  missions: {
    hunter: { nickname: string };
    target: { nickname: string };
  };
}

interface LeaderboardEntry {
  id: string;
  nickname: string;
  hunter_count: number;
  hunted_count: number;
}

export function LiveMosaic({ eventCode }: { eventCode: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [featured, setFeatured] = useState<FeedItem | null>(null);
  const [hunters, setHunters] = useState<LeaderboardEntry[]>([]);
  const [hunted, setHunted] = useState<LeaderboardEntry[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  async function load() {
    const [feedRes, rankRes] = await Promise.all([
      fetch(`/api/feed?event=${eventCode}&live=true`),
      fetch(`/api/ranking?event=${eventCode}`),
    ]);

    if (feedRes.ok) {
      const data = await feedRes.json();
      setItems(data.items ?? []);
      if (data.items?.length) {
        setFeatured(data.items[featuredIndex % data.items.length]);
      }
    }

    if (rankRes.ok) {
      const data = await rankRes.json();
      setHunters(data.hunters ?? []);
      setHunted(data.hunted ?? []);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [eventCode]);

  useEffect(() => {
    if (items.length === 0) return;
    const rotate = setInterval(() => {
      setFeaturedIndex((i) => {
        const next = (i + 1) % items.length;
        setFeatured(items[next]);
        return next;
      });
    }, 8000);
    return () => clearInterval(rotate);
  }, [items]);

  return (
    <div className="flex h-screen flex-col bg-[#0d0221] p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-purple-400">
            Flash Brega
          </h1>
          <p className="text-purple-300">#FlashBrega — Ao vivo</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-yellow-300">{items.length}</p>
          <p className="text-xs uppercase text-purple-400">flashes</p>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-950/30 p-2">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-2xl font-bold text-purple-400 animate-pulse">
                A caçada começou... aguardando flashes!
              </p>
            </div>
          ) : (
            <div className="grid h-full grid-cols-4 grid-rows-3 gap-1 auto-rows-fr">
              {items.slice(0, 12).map((item, i) => (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-lg ${
                    featured?.id === item.id ? "ring-2 ring-yellow-400" : ""
                  }`}
                  style={{
                    gridColumn: i === 0 && items.length < 5 ? "span 2" : undefined,
                    gridRow: i === 0 && items.length < 5 ? "span 2" : undefined,
                  }}
                >
                  <img
                    src={item.photo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="flex w-80 flex-col gap-4">
          {featured && (
            <div className="rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-purple-900 to-pink-900 p-4">
              {featured.photo_url && (
                <img
                  src={featured.photo_url}
                  alt=""
                  className="mb-3 aspect-video w-full rounded-xl object-cover"
                />
              )}
              <p className="text-xs font-bold uppercase text-pink-300">
                {featured.missions.hunter.nickname} ×{" "}
                {featured.missions.target.nickname}
              </p>
              <p className="mt-2 text-lg italic text-white">
                {featured.caption}
              </p>
            </div>
          )}
          <div className="flex-1 overflow-auto rounded-2xl border border-purple-500/30 bg-purple-950/50 p-3">
            <LeaderboardMini hunters={hunters} hunted={hunted} />
          </div>
        </aside>
      </div>
    </div>
  );
}
