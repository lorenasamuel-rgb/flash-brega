import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: mission, error } = await supabase
      .from("missions")
      .select(
        "*, hunter:participants!missions_hunter_id_fkey(id, nickname, avatar_url, songs(title, artist)), target:participants!missions_target_id_fkey(id, nickname, avatar_url, songs(title, artist)), encounters(*)",
      )
      .eq("id", id)
      .single();

    if (error || !mission) {
      return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
    }

    if (mission.hunter_id !== session.id && mission.target_id !== session.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json({ mission });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
