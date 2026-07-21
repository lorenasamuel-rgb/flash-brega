import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSong } from "@/lib/supabase/helpers";
import { setSession, verifyPin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventCode, nickname, pin } = body;

    if (!eventCode || !nickname || !pin) {
      return NextResponse.json(
        { error: "Evento, apelido e PIN são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const { data: participant } = await supabase
      .from("participants")
      .select("id, pin_hash, nickname, songs(title, artist)")
      .eq("event_id", event.id)
      .eq("nickname", nickname.trim())
      .single();

    if (!participant) {
      return NextResponse.json(
        { error: "Apelido ou PIN incorretos" },
        { status: 401 },
      );
    }

    const valid = await verifyPin(pin, participant.pin_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Apelido ou PIN incorretos" },
        { status: 401 },
      );
    }

    await setSession(participant.id);

    const songs = normalizeSong(participant.songs);

    return NextResponse.json({
      id: participant.id,
      nickname: participant.nickname,
      song: songs,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao entrar" }, { status: 500 });
  }
}
