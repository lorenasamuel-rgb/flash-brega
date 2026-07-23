const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export function isSupabaseStorageUrl(url: string): boolean {
  if (!SUPABASE_URL) return false;
  return (
    url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/photos/`) ||
    url.startsWith(`${SUPABASE_URL}/storage/v1/object/sign/photos/`)
  );
}

/** Serve Supabase photos through same-origin proxy (avoids browser third-party blocks). */
export function proxiedMediaUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!isSupabaseStorageUrl(url)) return url;
  return `/api/media?url=${encodeURIComponent(url)}`;
}
