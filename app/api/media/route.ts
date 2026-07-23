import { isSupabaseStorageUrl } from "@/lib/media-url";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url || !isSupabaseStorageUrl(url)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(url, { cache: "force-cache" });

    if (!upstream.ok) {
      return new Response("Not found", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Error fetching media", { status: 502 });
  }
}
