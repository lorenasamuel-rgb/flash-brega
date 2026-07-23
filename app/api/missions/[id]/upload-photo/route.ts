import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { compressImageBuffer } from "@/lib/compress-image";

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

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer, contentType, extension } =
      await compressImageBuffer(rawBuffer);
    const path = `${mission.event_id}/${id}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, buffer, { contentType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
    const photoUrl = urlData.publicUrl;

    const { error: missionError } = await supabase
      .from("missions")
      .update({ status: "photo_pending" })
      .eq("id", id);

    if (missionError) throw missionError;

    const { error: encError } = await supabase.from("encounters").upsert(
      { mission_id: id, photo_url: photoUrl },
      { onConflict: "mission_id" },
    );

    if (encError) throw encError;

    return NextResponse.json({ ok: true, photoUrl, status: "photo_pending" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao enviar foto" }, { status: 500 });
  }
}
