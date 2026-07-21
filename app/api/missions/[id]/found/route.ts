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

    if (mission.hunter_id !== session.id) {
      return NextResponse.json({ error: "Só o caçador pode iniciar" }, { status: 403 });
    }

    if (mission.status !== "pending") {
      return NextResponse.json(
        { error: "Missão já iniciada", status: mission.status },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("missions")
      .update({ status: "awaiting_song" })
      .eq("id", id);

    if (updateError) throw updateError;

    const { error: encError } = await supabase.from("encounters").upsert(
      { mission_id: id },
      { onConflict: "mission_id" },
    );

    if (encError) throw encError;

    return NextResponse.json({ ok: true, status: "awaiting_song" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao iniciar encontro" }, { status: 500 });
  }
}
