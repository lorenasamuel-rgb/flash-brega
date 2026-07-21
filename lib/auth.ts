import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { normalizeSong } from "./supabase/helpers";
import type { SessionParticipant } from "./types";

export async function getSessionParticipant(): Promise<SessionParticipant | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("participants")
      .select(
        "id, event_id, nickname, opt_in_public, avatar_url, songs(title, artist)",
      )
      .eq("auth_user_id", user.id)
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
      email: user.email ?? "",
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
