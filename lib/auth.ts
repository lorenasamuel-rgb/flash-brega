import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createAdminClient } from "./supabase/admin";
import { normalizeSong } from "./supabase/helpers";
import type { SessionParticipant } from "./types";

export const SESSION_COOKIE = "flash_brega_session";

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function setSession(participantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, participantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionParticipant(): Promise<SessionParticipant | null> {
  const cookieStore = await cookies();
  const participantId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!participantId) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("participants")
      .select("id, event_id, nickname, opt_in_public, avatar_url, songs(title, artist)")
      .eq("id", participantId)
      .single();

    if (error || !data) return null;

    const songs = normalizeSong(data.songs);
    return {
      id: data.id,
      event_id: data.event_id,
      nickname: data.nickname,
      opt_in_public: data.opt_in_public,
      avatar_url: data.avatar_url ?? null,
      song_title: songs?.title ?? "Sem música",
      song_artist: songs?.artist ?? "",
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionParticipant> {
  const session = await getSessionParticipant();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
