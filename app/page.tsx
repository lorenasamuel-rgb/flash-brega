import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-pink-400">
        Fest Brega 2026
      </p>
      <h1 className="brega-glow mt-2 text-5xl font-black uppercase text-white">
        Flash Brega
      </h1>
      <p className="mt-3 max-w-sm text-purple-200">
        Acha, autentica, flash — aparece no telão
      </p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/e/BREGA2026"
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-black uppercase text-white shadow-lg shadow-pink-500/30"
        >
          Entrar na festa
        </Link>
        <Link
          href="/live?event=BREGA2026"
          className="rounded-2xl border border-purple-400/50 py-4 font-bold text-purple-200"
        >
          Painel ao vivo (telão)
        </Link>
      </div>
      <p className="mt-8 text-xs text-purple-500">#FlashBrega</p>
    </main>
  );
}
