export function normalizeRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function normalizeSong(
  songs:
    | { title: string; artist: string }
    | { title: string; artist: string }[]
    | null
    | undefined,
): { title: string; artist: string } | null {
  return normalizeRelation(songs);
}

export function normalizeParticipant<
  T extends {
    songs?:
      | { title: string; artist: string }
      | { title: string; artist: string }[]
      | null;
  },
>(participant: T | T[] | null | undefined) {
  const row = normalizeRelation(participant);
  if (!row) return null;
  return { ...row, songs: normalizeSong(row.songs) };
}

export function normalizeMission<
  T extends {
    hunter?: Parameters<typeof normalizeParticipant>[0];
    target?: Parameters<typeof normalizeParticipant>[0];
    encounters?:
      | { photo_url?: string | null; caption?: string | null }
      | { photo_url?: string | null; caption?: string | null }[]
      | null;
  },
>(mission: T | null | undefined) {
  if (!mission) return null;
  return {
    ...mission,
    hunter: normalizeParticipant(mission.hunter),
    target: normalizeParticipant(mission.target),
    encounters: normalizeRelation(mission.encounters),
  };
}
