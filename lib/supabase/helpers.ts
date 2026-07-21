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
