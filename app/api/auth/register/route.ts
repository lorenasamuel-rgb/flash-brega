import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeSong } from "@/lib/supabase/helpers";
import { assignSongToParticipant } from "@/lib/missions";
import { hashPin, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const eventCode = formData.get("eventCode") as string;
    const nickname = formData.get("nickname") as string;
    const pin = formData.get("pin") as string;
    const optInPublic = formData.get("optInPublic") !== "false";
    const file = formData.get("photo") as File | null;

    if (!eventCode || !nickname || !pin) {
      return NextResponse.json(
        { error: "Evento, apelido e PIN são obrigatórios" },
        { status: 400 },
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Foto de perfil é obrigatória para reconhecimento" },
        { status: 400 },
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN deve ter 4 dígitos" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, code")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const pinHash = await hashPin(pin);

    const { data: participant, error: insertError } = await supabase
      .from("participants")
      .insert({
        event_id: event.id,
        nickname: nickname.trim(),
        pin_hash: pinHash,
        opt_in_public: optInPublic,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Apelido já em uso neste evento" },
          { status: 409 },
        );
      }
      throw insertError;
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const path = `${event.id}/avatars/${participant.id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      await supabase.from("participants").delete().eq("id", participant.id);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { error: avatarError } = await supabase
      .from("participants")
      .update({ avatar_url: avatarUrl })
      .eq("id", participant.id);

    if (avatarError) throw avatarError;

    await assignSongToParticipant(event.id, participant.id);
    await setSession(participant.id);

    const { data: full } = await supabase
      .from("participants")
      .select("id, nickname, avatar_url, songs(title, artist)")
      .eq("id", participant.id)
      .single();

    const songs = normalizeSong(full?.songs);

    return NextResponse.json({
      id: participant.id,
      nickname: full?.nickname,
      avatarUrl: full?.avatar_url,
      song: songs,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao cadastrar" }, { status: 400 });
  }
}
