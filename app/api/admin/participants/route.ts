import { NextResponse } from "next/server";
import {
  createParticipantAsAdmin,
  enrichParticipantsWithEmail,
} from "@/lib/admin-participants";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const eventCode = (body.eventCode as string)?.toUpperCase() ?? "BREGA2026";
    const email = (body.email as string)?.toLowerCase().trim();
    const password = body.password as string;
    const nickname = body.nickname as string;
    const optInPublic = body.optInPublic !== false;

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: "Email, senha e apelido são obrigatórios" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("code", eventCode)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const participant = await createParticipantAsAdmin({
      eventId: event.id,
      email,
      password,
      nickname,
      optInPublic,
    });

    return NextResponse.json({ ok: true, participant });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar participante" },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const eventCode =
      new URL(request.url).searchParams.get("event")?.toUpperCase() ?? "BREGA2026";

    const supabase = createAdminClient();
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("code", eventCode)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const { data: participants } = await supabase
      .from("participants")
      .select("id, nickname, auth_user_id, created_at, songs(title, artist)")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false });

    const enriched = await enrichParticipantsWithEmail(participants ?? []);

    return NextResponse.json({ participants: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao listar participantes" }, { status: 500 });
  }
}
