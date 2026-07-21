import { cookies } from "next/headers";

export const EVENT_COOKIE = "flash_brega_event";

export async function setEventCode(code: string) {
  const cookieStore = await cookies();
  cookieStore.set(EVENT_COOKIE, code.toUpperCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
}

export async function getEventCode(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(EVENT_COOKIE)?.value ?? null;
}
