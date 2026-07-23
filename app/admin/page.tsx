"use client";

import { useState } from "react";

type AdminParticipant = {
  id: string;
  nickname: string;
  email: string | null;
  songs: { title: string } | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<{
    event: { name: string; code: string; ranking_frozen: boolean };
    participants: AdminParticipant[];
    encounters: {
      id: string;
      caption: string;
      hidden_from_live: boolean;
      missions: { hunter: { nickname: string }; target: { nickname: string } };
    }[];
    stats: { participants: number; missions: number; byStatus: Record<string, number> };
  } | null>(null);
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const headers = { "x-admin-password": password };

  async function loadAdmin() {
    const res = await fetch("/api/admin?event=BREGA2026", { headers });
    if (res.ok) {
      setData(await res.json());
      setAuthed(true);
      setMessage("");
    } else {
      setMessage("Senha incorreta");
    }
  }

  async function generateMissions() {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ eventCode: "BREGA2026", targetsPerParticipant: 5 }),
    });
    const result = await res.json();
    setMessage(
      res.ok
        ? `Missões geradas: ${result.created} para ${result.participants} participantes`
        : result.error,
    );
    loadAdmin();
  }

  async function hideEncounter(id: string) {
    await fetch("/api/admin/encounters", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ encounterId: id, hidden: true }),
    });
    loadAdmin();
  }

  async function freezeRanking() {
    await fetch("/api/admin/encounters", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ eventCode: "BREGA2026", frozen: true }),
    });
    setMessage("Ranking congelado!");
    loadAdmin();
  }

  async function addParticipant(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/participants", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        eventCode: "BREGA2026",
        ...newUser,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      setMessage(result.error ?? "Erro ao adicionar");
      return;
    }
    setMessage(`Participante criado: ${result.participant.nickname}`);
    setNewUser({ email: "", password: "", nickname: "" });
    setShowAddForm(false);
    loadAdmin();
  }

  async function deleteParticipant(participant: AdminParticipant) {
    const label = participant.nickname || participant.email || participant.id;
    if (
      !window.confirm(
        `Apagar ${label}? Remove login, missões e fotos desse participante.`,
      )
    ) {
      return;
    }

    const res = await fetch(`/api/admin/participants/${participant.id}`, {
      method: "DELETE",
      headers,
    });
    const result = await res.json();
    if (!res.ok) {
      setMessage(result.error ?? "Erro ao apagar");
      return;
    }
    setMessage(`Participante ${label} removido.`);
    loadAdmin();
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-12">
        <h1 className="text-2xl font-black text-white">Admin Flash Brega</h1>
        <div className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha admin"
            className="w-full rounded-xl border border-purple-500/40 bg-purple-950/50 px-4 py-3 text-white"
          />
          <button
            onClick={loadAdmin}
            className="w-full rounded-2xl bg-purple-600 py-3 font-bold text-white"
          >
            Entrar
          </button>
          {message && <p className="text-red-300">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 pb-24">
      <h1 className="text-2xl font-black text-white">Admin — {data?.event.name}</h1>

      {data && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-purple-950/50 p-3">
            <p className="text-2xl font-black text-pink-300">{data.stats.participants}</p>
            <p className="text-xs text-purple-400">Participantes</p>
          </div>
          <div className="rounded-xl bg-purple-950/50 p-3">
            <p className="text-2xl font-black text-yellow-300">{data.stats.missions}</p>
            <p className="text-xs text-purple-400">Missões</p>
          </div>
          <div className="rounded-xl bg-purple-950/50 p-3">
            <p className="text-2xl font-black text-green-300">
              {data.stats.byStatus.completed ?? 0}
            </p>
            <p className="text-xs text-purple-400">Concluídas</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={generateMissions}
          className="rounded-xl bg-pink-600 px-4 py-2 font-bold text-white"
        >
          Gerar missões
        </button>
        <button
          onClick={freezeRanking}
          className="rounded-xl bg-yellow-600 px-4 py-2 font-bold text-purple-950"
        >
          Congelar ranking
        </button>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-xl bg-green-700 px-4 py-2 font-bold text-white"
        >
          {showAddForm ? "Cancelar" : "Adicionar usuário"}
        </button>
        <a
          href="/live?event=BREGA2026"
          target="_blank"
          className="rounded-xl border border-purple-400 px-4 py-2 font-bold text-purple-200"
        >
          Abrir telão
        </a>
      </div>

      {showAddForm && (
        <form
          onSubmit={addParticipant}
          className="mt-4 space-y-3 rounded-xl border border-green-500/30 bg-purple-950/40 p-4"
        >
          <p className="text-sm font-bold text-green-300">Novo participante</p>
          <input
            type="email"
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Email"
            className="w-full rounded-lg border border-purple-500/40 bg-purple-950/50 px-3 py-2 text-white"
          />
          <input
            type="password"
            required
            minLength={6}
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Senha (mín. 6)"
            className="w-full rounded-lg border border-purple-500/40 bg-purple-950/50 px-3 py-2 text-white"
          />
          <input
            required
            minLength={2}
            maxLength={30}
            value={newUser.nickname}
            onChange={(e) => setNewUser({ ...newUser, nickname: e.target.value })}
            placeholder="Apelido brega"
            className="w-full rounded-lg border border-purple-500/40 bg-purple-950/50 px-3 py-2 text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white"
          >
            Criar participante
          </button>
          <p className="text-xs text-purple-400">
            Sem foto de perfil — ideal para contas de teste. Convidados reais devem
            cadastrar em /cadastro.
          </p>
        </form>
      )}

      {message && <p className="mt-4 text-green-300">{message}</p>}

      <h2 className="mt-8 font-bold text-white">Participantes</h2>
      <ul className="mt-2 space-y-2 text-sm text-purple-200">
        {data?.participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-purple-950/40 p-3"
          >
            <div>
              <p className="font-bold text-white">{p.nickname}</p>
              <p className="text-xs text-purple-400">
                {p.email ?? "sem email"} — {p.songs?.title ?? "sem música"}
              </p>
            </div>
            <button
              onClick={() => deleteParticipant(p)}
              className="shrink-0 text-xs text-red-300 underline"
              type="button"
            >
              Apagar
            </button>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-bold text-white">Flashes (ocultar do telão)</h2>
      <ul className="mt-2 space-y-2">
        {data?.encounters.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between rounded-lg bg-purple-950/40 p-3 text-sm"
          >
            <span className="text-purple-200">
              {e.missions.hunter.nickname} × {e.missions.target.nickname}
              {e.hidden_from_live && " (oculto)"}
            </span>
            {!e.hidden_from_live && (
              <button
                onClick={() => hideEncounter(e.id)}
                className="text-xs text-red-300"
              >
                Ocultar
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
