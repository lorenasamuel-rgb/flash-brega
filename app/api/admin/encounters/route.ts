import { NextResponse } from "next/server";
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
    const { encounterId, hidden } = body;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("encounters")
      .update({ hidden_from_live: hidden ?? true })
      .eq("id", encounterId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao ocultar" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventCode, frozen } = body;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("events")
      .update({ ranking_frozen: frozen ?? true })
      .eq("code", (eventCode ?? "BREGA2026").toUpperCase());

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao congelar ranking" }, { status: 500 });
  }
}
