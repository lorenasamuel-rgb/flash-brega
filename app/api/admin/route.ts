import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateMissionsForEvent } from "@/lib/missions";

function checkAdmin(request: Request) {
  const auth = request.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventCode, targetsPerParticipant = 5 } = body;

    const supabase = createAdminClient();
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("code", (eventCode ?? "BREGA2026").toUpperCase())
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const result = await generateMissionsForEvent(event.id, targetsPerParticipant);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar missões" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const eventCode =
      new URL(request.url).searchParams.get("event") ?? "BREGA2026";

    const { data: event } = await supabase
      .from("events")
      .select("id, name, code, ranking_frozen")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const { data: participants } = await supabase
      .from("participants")
      .select("id, nickname, created_at, songs(title, artist)")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false });

    const { data: missions } = await supabase
      .from("missions")
      .select("id, status")
      .eq("event_id", event.id);

    const missionIds = (missions ?? []).map((m) => m.id);

    let encounters: unknown[] = [];
    if (missionIds.length > 0) {
      const { data } = await supabase
        .from("encounters")
        .select(
          "id, photo_url, caption, hidden_from_live, created_at, mission_id, missions(hunter:participants!missions_hunter_id_fkey(nickname), target:participants!missions_target_id_fkey(nickname))",
        )
        .in("mission_id", missionIds)
        .not("photo_url", "is", null)
        .order("created_at", { ascending: false });
      encounters = data ?? [];
    }

    const statusCounts = (missions ?? []).reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return NextResponse.json({
      event,
      participants: participants ?? [],
      encounters: encounters ?? [],
      stats: {
        participants: participants?.length ?? 0,
        missions: missions?.length ?? 0,
        byStatus: statusCounts,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro admin" }, { status: 500 });
  }
}
