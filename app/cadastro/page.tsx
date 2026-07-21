"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PhotoCapture } from "@/components/PhotoCapture";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventCode = searchParams.get("event") ?? "BREGA2026";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [song, setSong] = useState<{ title: string; artist: string } | null>(
    null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!photoFile) {
      setError("Tire uma foto sua para os outros te reconhecerem");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("eventCode", eventCode);
    form.append("email", email);
    form.append("password", password);
    form.append("nickname", nickname);
    form.append("optInPublic", String(optIn));
    form.append("photo", photoFile);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao cadastrar");
      setLoading(false);
      return;
    }

    setSong(data.song);
    setTimeout(() => router.push("/home"), 3000);
    setLoading(false);
  }

  if (song) {
    return (
      <div className="text-center">
        <p className="text-green-300 font-bold">Cadastro feito!</p>
        <p className="mt-4 text-sm text-purple-300">Sua música brega:</p>
        <p className="text-3xl font-black text-yellow-300">{song.title}</p>
        <p className="text-purple-200">{song.artist}</p>
        <p className="mt-4 text-sm text-purple-400">Redirecionando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-bold text-pink-300">
          Sua foto (para te reconhecerem)
        </label>
        <PhotoCapture onCapture={setPhotoFile} disabled={loading} facing="user" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-purple-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-purple-300">
          Senha (mín. 6 caracteres)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-purple-300">
          Apelido brega
        </label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          minLength={2}
          maxLength={30}
          className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white outline-none focus:border-pink-400"
          placeholder="Rainha do Sertanejo"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-purple-200">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="rounded"
        />
        Minhas fotos podem aparecer no feed e telão
      </label>
      {error && (
        <p className="rounded-xl bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !photoFile}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-black uppercase text-white disabled:opacity-50"
      >
        {loading ? "Cadastrando..." : "Entrar na caçada"}
      </button>
      <Link
        href={`/login?event=${eventCode}`}
        className="block text-center text-sm text-purple-400"
      >
        Já tenho conta
      </Link>
    </form>
  );
}

export default function CadastroPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-12">
      <h1 className="text-center text-2xl font-black text-white">Cadastro</h1>
      <p className="mt-2 text-center text-sm text-purple-300">
        Foto + email + senha + apelido brega
      </p>
      <div className="mt-8">
        <Suspense>
          <CadastroForm />
        </Suspense>
      </div>
    </main>
  );
}
