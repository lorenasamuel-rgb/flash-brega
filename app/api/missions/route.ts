import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const session = await requireSession();
    const supabase = createAdminClient();

    const { data: asHunter } = await supabase
      .from("missions")
      .select(
        "id, status, created_at, target:participants!missions_target_id_fkey(id, nickname, avatar_url, songs(title, artist)), encounters(id, photo_url, caption)",
      )
      .eq("hunter_id", session.id)
      .order("created_at");

    const { data: pendingAsTarget } = await supabase
      .from("missions")
      .select(
        "id, status, created_at, hunter:participants!missions_hunter_id_fkey(id, nickname, avatar_url, songs(title, artist)), encounters(id, photo_url, caption, song_confirmed_at)",
      )
      .eq("target_id", session.id)
      .in("status", ["awaiting_song", "photo_pending"]);

    return NextResponse.json({
      asHunter: asHunter ?? [],
      pendingConfirmations: pendingAsTarget ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
