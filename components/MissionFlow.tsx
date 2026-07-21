"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PhotoCapture } from "./PhotoCapture";
import { SongCard } from "./SongCard";
import { ParticipantAvatar } from "./ParticipantAvatar";

interface MissionData {
  id: string;
  status: string;
  hunter: {
    id: string;
    nickname: string;
    songs: { title: string; artist: string } | null;
  };
  target: {
    id: string;
    nickname: string;
    avatar_url: string | null;
    songs: { title: string; artist: string } | null;
  };
  encounters: {
    photo_url: string | null;
    caption: string | null;
  } | null;
}

export function MissionFlow({
  missionId,
  participantId,
  mySong,
}: {
  missionId: string;
  participantId: string;
  mySong: { title: string; artist: string };
}) {
  const [mission, setMission] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const isHunter = mission?.hunter.id === participantId;
  const isTarget = mission?.target.id === participantId;

  async function loadMission() {
    const res = await fetch(`/api/missions/${missionId}`);
    if (res.ok) {
      const data = await res.json();
      setMission(data.mission);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMission();
    const interval = setInterval(loadMission, 3000);
    return () => clearInterval(interval);
  }, [missionId]);

  async function handleFound() {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/missions/${missionId}/found`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Erro");
    else setMessage("Aguardando alvo confirmar sua música...");
    await loadMission();
    setActionLoading(false);
  }

  async function handleConfirmSong() {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/missions/${missionId}/confirm-song`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Erro");
    else setMessage("Música confirmada! Caçador pode tirar o flash.");
    await loadMission();
    setActionLoading(false);
  }

  async function handleUploadPhoto() {
    if (!photoFile) {
      setError("Tire uma foto primeiro");
      return;
    }
    setActionLoading(true);
    setError("");
    const form = new FormData();
    form.append("photo", photoFile);
    const res = await fetch(`/api/missions/${missionId}/upload-photo`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Erro");
    else setMessage("Foto enviada! Aguardando alvo confirmar.");
    await loadMission();
    setActionLoading(false);
  }

  async function handleConfirmPhoto() {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/missions/${missionId}/confirm-photo`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Erro");
    else setMessage(`Missão concluída! ${data.caption}`);
    await loadMission();
    setActionLoading(false);
  }

  if (loading) {
    return <p className="text-center text-purple-200">Carregando missão...</p>;
  }

  if (!mission) {
    return <p className="text-center text-red-300">Missão não encontrada</p>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-purple-300">Alvo — procure esta pessoa</p>
        <div className="mt-3 flex flex-col items-center gap-2">
          <ParticipantAvatar
            url={mission.target.avatar_url}
            nickname={mission.target.nickname}
            size="lg"
          />
          <h1 className="text-3xl font-black text-white">
            {mission.target.nickname}
          </h1>
        </div>
      </div>

      {mission.status === "completed" && (
        <div className="space-y-4 rounded-2xl border border-green-400/40 bg-green-900/20 p-4">
          <p className="text-center font-bold text-green-300">
            Missão concluída!
          </p>
          {mission.encounters?.photo_url && (
            <img
              src={mission.encounters.photo_url}
              alt="Flash"
              className="w-full rounded-xl"
            />
          )}
          {mission.encounters?.caption && (
            <p className="text-center italic text-purple-100">
              {mission.encounters.caption}
            </p>
          )}
          <Link
            href="/missoes"
            className="block text-center font-bold text-yellow-300"
          >
            Voltar às missões
          </Link>
        </div>
      )}

      {mission.status === "pending" && isHunter && (
        <div className="space-y-4">
          <SongCard title={mySong.title} artist={mySong.artist} />
          <p className="text-center text-sm text-purple-200">
            Encontrou {mission.target.nickname}? Diga sua música e peça
            confirmação.
          </p>
          <button
            onClick={handleFound}
            disabled={actionLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-black uppercase text-white shadow-lg disabled:opacity-50"
          >
            Encontrei!
          </button>
        </div>
      )}

      {mission.status === "awaiting_song" && isHunter && (
        <div className="space-y-4">
          <SongCard title={mySong.title} artist={mySong.artist} label="Diga esta música" />
          <p className="rounded-xl bg-yellow-500/20 p-4 text-center text-yellow-200">
            Aguardando {mission.target.nickname} confirmar sua música...
          </p>
        </div>
      )}

      {mission.status === "awaiting_song" && isTarget && (
        <div className="space-y-4">
          <p className="text-center text-purple-100">
            <strong>{mission.hunter.nickname}</strong> diz que a música dele(a)
            é:
          </p>
          <SongCard
            title={mission.hunter.songs?.title ?? "?"}
            artist={mission.hunter.songs?.artist ?? ""}
            label="Confirma esta música?"
          />
          <button
            onClick={handleConfirmSong}
            disabled={actionLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 py-4 font-black uppercase text-purple-950 disabled:opacity-50"
          >
            Confirmar música
          </button>
        </div>
      )}

      {mission.status === "song_confirmed" && isHunter && (
        <div className="space-y-4">
          <p className="text-center font-bold text-green-300">
            Música confirmada! Hora do flash!
          </p>
          <PhotoCapture onCapture={setPhotoFile} disabled={actionLoading} />
          <button
            onClick={handleUploadPhoto}
            disabled={actionLoading || !photoFile}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 py-4 font-black uppercase text-white disabled:opacity-50"
          >
            Enviar foto
          </button>
        </div>
      )}

      {mission.status === "photo_pending" && isHunter && (
        <div className="space-y-4">
          {mission.encounters?.photo_url && (
            <img
              src={mission.encounters.photo_url}
              alt="Enviada"
              className="w-full rounded-xl"
            />
          )}
          <p className="text-center text-purple-200">
            Aguardando {mission.target.nickname} confirmar a foto...
          </p>
        </div>
      )}

      {mission.status === "photo_pending" && isTarget && (
        <div className="space-y-4">
          <p className="text-center text-purple-100">
            {mission.hunter.nickname} enviou este flash com você:
          </p>
          {mission.encounters?.photo_url && (
            <img
              src={mission.encounters.photo_url}
              alt="Flash pendente"
              className="w-full rounded-xl border-2 border-pink-400"
            />
          )}
          <button
            onClick={handleConfirmPhoto}
            disabled={actionLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 py-4 font-black uppercase text-purple-950 disabled:opacity-50"
          >
            Confirmar foto
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/20 p-3 text-center text-red-200">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="rounded-xl bg-purple-500/20 p-3 text-center text-purple-100">
          {message}
        </p>
      )}
    </div>
  );
}
