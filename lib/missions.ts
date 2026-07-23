import { createAdminClient } from "./supabase/admin";

/** Missões ao cadastrar */
export const INITIAL_MISSIONS_COUNT = 2;
/** Novas missões a cada conclusão */
export const UNLOCK_MISSIONS_COUNT = 2;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getEventParticipantIds(eventId: string, excludeId?: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", eventId);

  if (error) throw error;

  return (data ?? [])
    .map((p) => p.id)
    .filter((id) => id !== excludeId);
}

async function getAssignedTargetIds(eventId: string, hunterId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("missions")
    .select("target_id")
    .eq("event_id", eventId)
    .eq("hunter_id", hunterId);

  if (error) throw error;
  return new Set((data ?? []).map((m) => m.target_id));
}

/** Atribui até `count` missões novas a um caçador (alvos ainda sem missão). */
export async function assignMissionsToHunter(
  eventId: string,
  hunterId: string,
  count: number,
) {
  if (count <= 0) return { created: 0, remaining: 0 };

  const others = await getEventParticipantIds(eventId, hunterId);
  const assigned = await getAssignedTargetIds(eventId, hunterId);
  const available = shuffle(others.filter((id) => !assigned.has(id)));
  const selected = available.slice(0, Math.min(count, available.length));

  if (selected.length === 0) {
    return { created: 0, remaining: 0 };
  }

  const supabase = createAdminClient();
  const missions = selected.map((target_id) => ({
    event_id: eventId,
    hunter_id: hunterId,
    target_id,
  }));

  const { error } = await supabase
    .from("missions")
    .upsert(missions, { onConflict: "hunter_id,target_id", ignoreDuplicates: true });

  if (error) throw error;

  return {
    created: selected.length,
    remaining: available.length - selected.length,
  };
}

/** Primeiras missões ao entrar na festa (+ top-up para quem ainda tem poucas). */
export async function assignInitialMissionsForNewParticipant(
  eventId: string,
  newParticipantId: string,
) {
  const allIds = await getEventParticipantIds(eventId);
  const others = allIds.filter((id) => id !== newParticipantId);

  if (others.length === 0) {
    return { created: 0 };
  }

  let created = 0;

  const forNew = await assignMissionsToHunter(
    eventId,
    newParticipantId,
    INITIAL_MISSIONS_COUNT,
  );
  created += forNew.created;

  for (const participantId of others) {
    const assigned = await getAssignedTargetIds(eventId, participantId);
    const need = Math.max(0, INITIAL_MISSIONS_COUNT - assigned.size);
    if (need === 0) continue;

    const result = await assignMissionsToHunter(eventId, participantId, need);
    created += result.created;
  }

  return { created };
}

/** Desbloqueia mais missões após concluir uma (foto confirmada). */
export async function unlockMissionsAfterCompletion(
  eventId: string,
  hunterId: string,
) {
  return assignMissionsToHunter(eventId, hunterId, UNLOCK_MISSIONS_COUNT);
}

/** Admin: garante missões iniciais para quem ainda tem poucas. */
export async function generateMissionsForEvent(eventId: string) {
  const supabase = createAdminClient();

  const { data: participants, error } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", eventId);

  if (error) throw error;
  if (!participants || participants.length < 2) {
    throw new Error("Need at least 2 participants");
  }

  let created = 0;

  for (const participant of participants) {
    const assigned = await getAssignedTargetIds(eventId, participant.id);
    const need = Math.max(0, INITIAL_MISSIONS_COUNT - assigned.size);
    if (need === 0) continue;

    const result = await assignMissionsToHunter(
      eventId,
      participant.id,
      need,
    );
    created += result.created;
  }

  return { created, participants: participants.length };
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
