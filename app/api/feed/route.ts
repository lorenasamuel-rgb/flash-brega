import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeRelation } from "@/lib/supabase/helpers";

export async function GET(request: Request) {
  try {
    const eventCode =
      new URL(request.url).searchParams.get("event") ?? "BREGA2026";
    const liveOnly =
      new URL(request.url).searchParams.get("live") === "true";

    const supabase = createAdminClient();
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    let query = supabase
      .from("encounters")
      .select(
        `id, photo_url, caption, hidden_from_live, created_at,
         missions!inner(
           event_id,
           hunter:participants!missions_hunter_id_fkey(nickname, opt_in_public),
           target:participants!missions_target_id_fkey(nickname, opt_in_public)
         )`,
      )
      .eq("missions.event_id", event.id)
      .eq("missions.status", "completed")
      .not("photo_url", "is", null)
      .not("caption", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    const { data, error } = await query;

    if (error) throw error;

    let items = (data ?? []).map((item) => {
      const mission = normalizeRelation(item.missions);
      if (!mission) return item;
      return {
        ...item,
        missions: {
          ...mission,
          hunter: normalizeRelation(mission.hunter),
          target: normalizeRelation(mission.target),
        },
      };
    });

    if (liveOnly) {
      items = items.filter((item) => {
        if (item.hidden_from_live) return false;
        const mission = item.missions as {
          hunter?: { opt_in_public?: boolean } | null;
          target?: { opt_in_public?: boolean } | null;
        } | null;
        if (!mission) return false;
        return mission.hunter?.opt_in_public && mission.target?.opt_in_public;
      });
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no feed" }, { status: 500 });
  }
}
