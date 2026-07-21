"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { FeedList } from "@/components/FeedCard";

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

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/feed?event=BREGA2026");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-6 text-2xl font-black text-white">Feed</h1>
      <FeedList items={items} />
      <Nav />
    </main>
  );
}
