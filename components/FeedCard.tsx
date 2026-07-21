"use client";

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

export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-950/40">
      <img
        src={item.photo_url}
        alt="Flash"
        className="aspect-[4/3] w-full object-cover"
      />
      <div className="p-4">
        <p className="text-xs font-bold uppercase text-pink-400">
          {item.missions.hunter.nickname} × {item.missions.target.nickname}
        </p>
        <p className="mt-2 text-sm italic text-purple-100">{item.caption}</p>
        <p className="mt-2 text-xs text-purple-400">
          {new Date(item.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </article>
  );
}

export function FeedList({
  items,
  emptyMessage = "Nenhum flash ainda. Seja o primeiro!",
}: {
  items: FeedItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-purple-300">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
