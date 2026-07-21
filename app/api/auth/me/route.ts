import { NextResponse } from "next/server";
import { getSessionParticipant } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSessionParticipant();
  if (!session) {
    return NextResponse.json({ participant: null });
  }
  return NextResponse.json({ participant: session });
}
