import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const supabase = createAdminClient();

    const { data: event, error } = await supabase
      .from("events")
      .select("id, name, code")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
