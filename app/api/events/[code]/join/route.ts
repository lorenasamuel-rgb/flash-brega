import { NextResponse } from "next/server";
import { setEventCode } from "@/lib/event";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  await setEventCode(code.toUpperCase());
  return NextResponse.json({ ok: true, code: code.toUpperCase() });
}
