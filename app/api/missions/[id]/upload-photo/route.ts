import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Foto obrigatória" }, { status: 400 });
    }

    const { data: mission } = await supabase
      .from("missions")
      .select("id, hunter_id, event_id, status")
      .eq("id", id)
      .single();

    if (!mission) {
      return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
    }

    if (mission.hunter_id !== session.id) {
      return NextResponse.json(
        { error: "Só o caçador pode enviar foto" },
        { status: 403 },
      );
    }

    if (mission.status !== "song_confirmed") {
      return NextResponse.json(
        { error: "Confirme a música antes de tirar foto" },
        { status: 400 },
      );
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const path = `${mission.event_id}/${id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
    const photoUrl = urlData.publicUrl;

    const { error: missionError } = await supabase
      .from("missions")
      .update({ status: "photo_pending" })
      .eq("id", id);

    if (missionError) throw missionError;

    const { error: encError } = await supabase
      .from("encounters")
      .update({ photo_url: photoUrl })
      .eq("mission_id", id);

    if (encError) throw encError;

    return NextResponse.json({ ok: true, photoUrl, status: "photo_pending" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao enviar foto" }, { status: 500 });
  }
}
