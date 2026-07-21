export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionParticipant } from "@/lib/auth";
import { getLeaderboard } from "@/lib/missions";
import { createAdminClient } from "@/lib/supabase/admin";
import { Nav } from "@/components/Nav";
import { SongCard } from "@/components/SongCard";
import { PendingConfirmations } from "@/components/PendingConfirmations";
import { LogoutButton } from "@/components/LogoutButton";

export default async function HomePage() {
  const session = await getSessionParticipant();
  if (!session) redirect("/e/BREGA2026");

  const supabase = createAdminClient();
  const { data: missions } = await supabase
    .from("missions")
    .select("id, status")
    .eq("hunter_id", session.id);

  const completed =
    missions?.filter((m) => m.status === "completed").length ?? 0;
  const total = missions?.length ?? 0;

  const leaderboard = await getLeaderboard(session.event_id);
  const myHunterRank =
    leaderboard.hunters.findIndex((e) => e.id === session.id) + 1;
  const myHuntedRank =
    leaderboard.hunted.findIndex((e) => e.id === session.id) + 1;
  const myStats = leaderboard.all.find((e) => e.id === session.id);

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-8">
      <header className="mb-6 text-center">
        <p className="text-sm text-pink-400">Olá,</p>
        <h1 className="text-3xl font-black text-white">{session.nickname}</h1>
        <LogoutButton />
      </header>

      <div className="space-y-6">
        <PendingConfirmations />

        <SongCard
          title={session.song_title}
          artist={session.song_artist}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-purple-950/50 p-4 text-center border border-pink-500/20">
            <p className="text-2xl font-black text-pink-300">
              {completed}/{total}
            </p>
            <p className="text-xs uppercase text-purple-400">Missões</p>
          </div>
          <div className="rounded-2xl bg-purple-950/50 p-4 text-center border border-yellow-500/20">
            <p className="text-2xl font-black text-yellow-300">
              {myStats?.hunted_count ?? 0}
            </p>
            <p className="text-xs uppercase text-purple-400">Vezes caçado</p>
          </div>
        </div>

        <div className="rounded-2xl bg-purple-950/50 p-4 border border-purple-500/20">
          <p className="text-sm text-purple-300">
            Ranking caçador:{" "}
            <strong className="text-pink-300">
              {myHunterRank > 0 ? `#${myHunterRank}` : "—"}
            </strong>
          </p>
          <p className="text-sm text-purple-300">
            Ranking caçado:{" "}
            <strong className="text-yellow-300">
              {myHuntedRank > 0 ? `#${myHuntedRank}` : "—"}
            </strong>
          </p>
        </div>
      </div>

      <Nav />
    </main>
  );
}
