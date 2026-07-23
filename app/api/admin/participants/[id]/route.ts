import { NextResponse } from "next/server";
import { deleteParticipantAsAdmin } from "@/lib/admin-participants";

function checkAdmin(request: Request) {
  const auth = request.headers.get("x-admin-password");
  return auth === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteParticipantAsAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao apagar participante" },
      { status: 400 },
    );
  }
}
