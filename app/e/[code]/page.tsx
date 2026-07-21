"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EventEntryPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    async function init() {
      await fetch(`/api/events/${code}/join`, { method: "POST" });
      const res = await fetch(`/api/events/${code}`);
      if (res.ok) {
        const data = await res.json();
        setEventName(data.event.name);
      }
      setLoading(false);
    }
    init();
  }, [code]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-purple-300">Entrando no evento...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase text-pink-400">{code}</p>
      <h1 className="mt-2 text-3xl font-black text-white">{eventName}</h1>
      <p className="mt-4 text-purple-200">
        Cadastre-se ou entre com seu apelido e PIN
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href={`/cadastro?event=${code}`}
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-black uppercase text-white"
        >
          Primeira vez — Cadastrar
        </Link>
        <Link
          href={`/login?event=${code}`}
          className="rounded-2xl border border-purple-400/50 py-4 font-bold text-purple-200"
        >
          Já tenho conta — Entrar
        </Link>
      </div>
    </main>
  );
}
