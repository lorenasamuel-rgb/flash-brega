"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventCode = searchParams.get("event") ?? "BREGA2026";
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventCode, nickname, pin }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao entrar");
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-purple-300">Apelido</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-purple-300">PIN</label>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          required
          pattern="\d{4}"
          inputMode="numeric"
          className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
        />
      </div>
      {error && (
        <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-black uppercase text-white disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
      <Link
        href={`/cadastro?event=${eventCode}`}
        className="block text-center text-sm text-purple-400"
      >
        Primeira vez? Cadastre-se
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-12">
      <h1 className="text-center text-2xl font-black text-white">Entrar</h1>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
