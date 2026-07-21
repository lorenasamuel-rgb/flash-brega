export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionParticipant } from "@/lib/auth";
import { MissionFlow } from "@/components/MissionFlow";
import { Nav } from "@/components/Nav";

export default async function MissaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionParticipant();
  if (!session) redirect("/e/BREGA2026");

  const { id } = await params;

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-8">
      <MissionFlow
        missionId={id}
        participantId={session.id}
        mySong={{
          title: session.song_title,
          artist: session.song_artist,
        }}
      />
      <Nav />
    </main>
  );
}
