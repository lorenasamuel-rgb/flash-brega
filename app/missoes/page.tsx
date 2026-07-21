export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionParticipant } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeRelation } from "@/lib/supabase/helpers";
import { Nav } from "@/components/Nav";
import { ParticipantAvatar } from "@/components/ParticipantAvatar";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  awaiting_song: "Aguardando música",
  song_confirmed: "Tirar foto",
  photo_pending: "Aguardando confirmação",
  completed: "Concluída",
};

const statusColor: Record<string, string> = {
  pending: "text-purple-300",
  awaiting_song: "text-yellow-300",
  song_confirmed: "text-pink-300",
  photo_pending: "text-orange-300",
  completed: "text-green-300",
};

export default async function MissoesPage() {
  const session = await getSessionParticipant();
  if (!session) redirect("/e/BREGA2026");

  const supabase = createAdminClient();
  const { data: missions } = await supabase
    .from("missions")
    .select(
      "id, status, target:participants!missions_target_id_fkey(nickname, avatar_url)",
    )
    .eq("hunter_id", session.id)
    .order("status")
    .order("created_at");

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-8">
      <h1 className="mb-6 text-2xl font-black text-white">Minhas missões</h1>

      {!missions?.length ? (
        <p className="text-center text-purple-300 py-12">
          Missões ainda não geradas. Aguarde o organizador!
        </p>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const target = normalizeRelation(m.target);
            if (!target) return null;
            return (
              <Link
                key={m.id}
                href={`/missao/${m.id}`}
                className="flex items-center gap-4 rounded-2xl border border-purple-500/30 bg-purple-950/40 px-4 py-4 transition hover:border-pink-400/50"
              >
                <ParticipantAvatar
                  url={target.avatar_url}
                  nickname={target.nickname}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="font-bold text-white">{target.nickname}</p>
                  <p
                    className={`text-sm ${statusColor[m.status] ?? "text-purple-300"}`}
                  >
                    {statusLabel[m.status] ?? m.status}
                  </p>
                </div>
                <span className="text-pink-400">→</span>
              </Link>
            );
          })}
        </div>
      )}

      <Nav />
    </main>
  );
}
