import { createAdminClient } from "./supabase/admin";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function assignSongToParticipant(
  eventId: string,
  participantId: string,
) {
  const supabase = createAdminClient();

  const { data: usedSongs } = await supabase
    .from("participants")
    .select("song_id")
    .eq("event_id", eventId)
    .not("song_id", "is", null);

  const usedIds = new Set((usedSongs ?? []).map((p) => p.song_id));

  const { data: allSongs } = await supabase.from("songs").select("id");
  const available = (allSongs ?? []).filter((s) => !usedIds.has(s.id));

  let songId: string | undefined;
  if (available.length > 0) {
    songId = shuffle(available)[0].id;
  } else {
    const { data: anySong } = await supabase
      .from("songs")
      .select("id")
      .limit(1)
      .single();
    songId = anySong?.id;
  }

  if (!songId) throw new Error("No songs available");

  await supabase
    .from("participants")
    .update({ song_id: songId })
    .eq("id", participantId);

  return songId;
}

export async function generateMissionsForEvent(
  eventId: string,
  targetsPerParticipant = 5,
) {
  const supabase = createAdminClient();

  const { data: participants, error } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", eventId);

  if (error) throw error;
  if (!participants || participants.length < 2) {
    throw new Error("Need at least 2 participants");
  }

  const ids = participants.map((p) => p.id);
  const missions: { event_id: string; hunter_id: string; target_id: string }[] =
    [];

  for (const hunter of ids) {
    const candidates = shuffle(ids.filter((id) => id !== hunter));
    const selected = candidates.slice(0, targetsPerParticipant);
    for (const target of selected) {
      missions.push({
        event_id: eventId,
        hunter_id: hunter,
        target_id: target,
      });
    }
  }

  const { error: insertError } = await supabase
    .from("missions")
    .upsert(missions, { onConflict: "hunter_id,target_id", ignoreDuplicates: true });

  if (insertError) throw insertError;

  return { created: missions.length, participants: ids.length };
}

export async function getLeaderboard(eventId: string) {
  const supabase = createAdminClient();

  const { data: participants } = await supabase
    .from("participants")
    .select("id, nickname")
    .eq("event_id", eventId);

  const { data: missions } = await supabase
    .from("missions")
    .select("hunter_id, target_id")
    .eq("event_id", eventId)
    .eq("status", "completed");

  const hunterCounts = new Map<string, number>();
  const huntedCounts = new Map<string, number>();

  for (const m of missions ?? []) {
    hunterCounts.set(m.hunter_id, (hunterCounts.get(m.hunter_id) ?? 0) + 1);
    huntedCounts.set(m.target_id, (huntedCounts.get(m.target_id) ?? 0) + 1);
  }

  const entries = (participants ?? []).map((p) => ({
    id: p.id,
    nickname: p.nickname,
    hunter_count: hunterCounts.get(p.id) ?? 0,
    hunted_count: huntedCounts.get(p.id) ?? 0,
  }));

  const hunters = [...entries].sort((a, b) => b.hunter_count - a.hunter_count);
  const hunted = [...entries].sort((a, b) => b.hunted_count - a.hunted_count);

  return { hunters, hunted, all: entries };
}
