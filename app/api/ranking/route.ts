import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLeaderboard } from "@/lib/missions";

export async function GET(request: Request) {
  try {
    const eventCode =
      new URL(request.url).searchParams.get("event") ?? "BREGA2026";

    const supabase = createAdminClient();
    const { data: event } = await supabase
      .from("events")
      .select("id, ranking_frozen")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const leaderboard = await getLeaderboard(event.id);

    return NextResponse.json({
      ...leaderboard,
      frozen: event.ranking_frozen,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no ranking" }, { status: 500 });
  }
}
