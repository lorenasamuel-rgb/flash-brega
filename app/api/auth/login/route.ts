import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeSong } from "@/lib/supabase/helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Erro ao entrar" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: participant } = await admin
      .from("participants")
      .select("id, nickname, songs(title, artist)")
      .eq("auth_user_id", user.id)
      .single();

    if (!participant) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Conta sem perfil na festa. Complete o cadastro." },
        { status: 404 },
      );
    }

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
