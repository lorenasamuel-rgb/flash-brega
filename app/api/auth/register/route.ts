import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeSong } from "@/lib/supabase/helpers";
import { assignSongToParticipant, assignInitialMissionsForNewParticipant } from "@/lib/missions";
import { compressImageBuffer } from "@/lib/compress-image";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const eventCode = formData.get("eventCode") as string;
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const nickname = formData.get("nickname") as string;
    const optInPublic = formData.get("optInPublic") !== "false";
    const file = formData.get("photo") as File | null;

    if (!eventCode || !email || !password || !nickname) {
      return NextResponse.json(
        { error: "Evento, email, senha e apelido são obrigatórios" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 },
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Foto de perfil é obrigatória para reconhecimento" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: event, error: eventError } = await admin
      .from("events")
      .select("id, code")
      .eq("code", eventCode.toUpperCase())
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "Este email já está cadastrado. Faça login ou recupere a senha." },
          { status: 409 },
        );
      }
      throw authError;
    }

    const authUserId = authData.user.id;

    const { data: participant, error: insertError } = await admin
      .from("participants")
      .insert({
        event_id: event.id,
        auth_user_id: authUserId,
        nickname: nickname.trim(),
        opt_in_public: optInPublic,
      })
      .select("id")
      .single();

    if (insertError) {
      await admin.auth.admin.deleteUser(authUserId);
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Apelido já em uso neste evento" },
          { status: 409 },
        );
      }
      throw insertError;
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer, contentType, extension } =
      await compressImageBuffer(rawBuffer);
    const path = `${event.id}/avatars/${participant.id}.${extension}`;

    const { error: uploadError } = await admin.storage
      .from("photos")
      .upload(path, buffer, { contentType, upsert: true });

    if (uploadError) {
      await admin.from("participants").delete().eq("id", participant.id);
      await admin.auth.admin.deleteUser(authUserId);
      throw uploadError;
    }

    const { data: urlData } = admin.storage.from("photos").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    await admin
      .from("participants")
      .update({ avatar_url: avatarUrl })
      .eq("id", participant.id);

    await assignSongToParticipant(event.id, participant.id);
    await assignInitialMissionsForNewParticipant(event.id, participant.id);

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    const { data: full } = await admin
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
    return NextResponse.json({ error: "Erro ao cadastrar" }, { status: 500 });
  }
}
