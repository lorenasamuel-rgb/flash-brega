import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email as string)?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();
    const redirectTo = `${getSiteUrl()}/auth/callback?next=/atualizar-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Não foi possível enviar o email. Verifique o endereço." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Se o email existir, você receberá um link de recuperação.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }
}
