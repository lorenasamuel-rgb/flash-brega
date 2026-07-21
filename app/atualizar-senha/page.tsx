"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Link expirado ou sessão inválida. Peça um novo link.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/home"), 2000);
  }

  if (done) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-6 py-12 text-center">
        <p className="text-green-300 font-bold">Senha atualizada!</p>
        <p className="mt-4 text-purple-300">Redirecionando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-12">
      <h1 className="text-center text-2xl font-black text-white">
        Nova senha
      </h1>
      <p className="mt-2 text-center text-sm text-purple-300">
        Escolha sua nova senha
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-purple-300">
            Nova senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-purple-300">
            Confirmar senha
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
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
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
        <Link href="/recuperar-senha" className="block text-center text-sm text-purple-400">
          Pedir novo link
        </Link>
      </form>
    </main>
  );
}
