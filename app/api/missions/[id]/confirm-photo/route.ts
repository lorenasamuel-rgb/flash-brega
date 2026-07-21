import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { generateCaption } from "@/lib/captions";
import { normalizeRelation, normalizeSong } from "@/lib/supabase/helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: mission } = await supabase
      .from("missions")
      .select(
        "id, target_id, status, hunter:participants!missions_hunter_id_fkey(nickname, songs(title)), target:participants!missions_target_id_fkey(nickname, songs(title))",
      )
      .eq("id", id)
      .single();

    if (!mission) {
      return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
    }

    if (mission.target_id !== session.id) {
      return NextResponse.json(
        { error: "Só o alvo pode confirmar a foto" },
        { status: 403 },
      );
    }

    if (mission.status !== "photo_pending") {
      return NextResponse.json(
        { error: "Nenhuma foto pendente de confirmação" },
        { status: 400 },
      );
    }

    const hunterRaw = normalizeRelation(mission.hunter);
    const targetRaw = normalizeRelation(mission.target);

    if (!hunterRaw || !targetRaw) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 500 });
    }

    const hunterSong = normalizeSong(hunterRaw.songs as Parameters<typeof normalizeSong>[0]);
    const targetSong = normalizeSong(targetRaw.songs as Parameters<typeof normalizeSong>[0]);

    const caption = generateCaption({
      hunter: hunterRaw.nickname,
      target: targetRaw.nickname,
      songA: hunterSong?.title ?? "Hit Brega",
      songB: targetSong?.title ?? "Hit Brega",
    });

    const now = new Date().toISOString();

    const { error: missionError } = await supabase
      .from("missions")
      .update({ status: "completed" })
      .eq("id", id);

    if (missionError) throw missionError;

    const { error: encError } = await supabase
      .from("encounters")
      .update({ photo_confirmed_at: now, caption })
      .eq("mission_id", id);

    if (encError) throw encError;

    return NextResponse.json({ ok: true, caption, status: "completed" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao confirmar foto" },
      { status: 500 },
    );
  }
}
