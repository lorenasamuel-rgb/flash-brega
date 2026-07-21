"use client";

import { useRef, useState } from "react";

export function PhotoCapture({
  onCapture,
  disabled,
  facing = "environment",
}: {
  onCapture: (file: File) => void;
  disabled?: boolean;
  facing?: "user" | "environment";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onCapture(file);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={facing}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full rounded-2xl border-2 border-pink-400 object-cover aspect-[4/3]"
        />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex w-full aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-400/60 bg-purple-950/50 text-purple-200 transition hover:border-pink-400 hover:bg-purple-900/50 disabled:opacity-50"
        >
          <span className="text-4xl">📸</span>
          <span className="mt-2 font-bold">Tirar flash</span>
        </button>
      )}
    </div>
  );
}
