import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
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
      .select("id, hunter_id, target_id, status")
      .eq("id", id)
      .single();

    if (!mission) {
      return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
    }

    if (mission.target_id !== session.id) {
      return NextResponse.json(
        { error: "Só o alvo pode confirmar a música" },
        { status: 403 },
      );
    }

    if (mission.status !== "awaiting_song") {
      return NextResponse.json(
        { error: "Música já confirmada ou missão inválida" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const { error: missionError } = await supabase
      .from("missions")
      .update({ status: "song_confirmed" })
      .eq("id", id);

    if (missionError) throw missionError;

    const { error: encError } = await supabase.from("encounters").upsert(
      { mission_id: id, song_confirmed_at: now },
      { onConflict: "mission_id" },
    );

    if (encError) throw encError;

    return NextResponse.json({ ok: true, status: "song_confirmed" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao confirmar música" },
      { status: 500 },
    );
  }
}
