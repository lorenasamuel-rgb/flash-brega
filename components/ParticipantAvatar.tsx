"use client";

import { useState } from "react";
import { proxiedMediaUrl } from "@/lib/media-url";

export function ParticipantAvatar({
  url,
  nickname,
  size = "md",
}: {
  url?: string | null;
  nickname: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  const sizes = {
    sm: "h-12 w-12 text-lg",
    md: "h-16 w-16 text-xl",
    lg: "h-28 w-28 text-3xl",
  };

  const cls = sizes[size];
  const src = proxiedMediaUrl(url);
  const showImage = src && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={nickname}
        onError={() => setFailed(true)}
        className={`${cls} shrink-0 rounded-full border-2 border-pink-400 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full border-2 border-purple-500/50 bg-purple-900/60 font-black text-pink-300`}
    >
      {nickname.charAt(0).toUpperCase()}
    </div>
  );
}

export function MissionPhoto({
  url,
  alt = "Flash",
  className = "w-full rounded-xl object-cover",
}: {
  url?: string | null;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = proxiedMediaUrl(url);

  if (!src || failed) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-red-400/30 bg-red-950/30 text-sm text-red-200">
        Foto indisponível
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
