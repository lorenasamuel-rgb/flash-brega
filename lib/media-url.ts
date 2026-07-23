const PHOTOS_PREFIX = "/storage/v1/object/public/photos/";

/** Convert Supabase storage URL to same-origin path (via next.config rewrite). */
export function proxiedMediaUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  const idx = url.indexOf(PHOTOS_PREFIX);
  if (idx === -1) return url;

  return `/media/photos/${url.slice(idx + PHOTOS_PREFIX.length)}`;
}

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(PHOTOS_PREFIX);
}
