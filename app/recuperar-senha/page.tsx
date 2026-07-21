"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function RecuperarForm() {
  const searchParams = useSearchParams();
  const eventCode = searchParams.get("event") ?? "BREGA2026";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao enviar email");
      setLoading(false);
      return;
    }

    setMessage(
      data.message ??
        "Se o email existir, você receberá um link para redefinir a senha.",
    );
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-purple-300">
        Digite seu email. Enviaremos um link para criar uma nova senha.
      </p>
      <div>
        <label className="mb-1 block text-sm text-purple-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
        />
      </div>
      {error && (
        <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-green-500/20 p-3 text-sm text-green-200">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 py-4 font-black uppercase text-purple-950 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar link"}
      </button>
      <Link
        href={`/login?event=${eventCode}`}
        className="block text-center text-sm text-purple-400"
      >
        Voltar ao login
      </Link>
    </form>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-12">
      <h1 className="text-center text-2xl font-black text-white">
        Recuperar senha
      </h1>
      <div className="mt-8">
        <Suspense>
          <RecuperarForm />
        </Suspense>
      </div>
    </main>
  );
}
