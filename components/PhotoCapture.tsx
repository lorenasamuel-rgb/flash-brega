"use client";

import { useRef, useState } from "react";
import {
  compressImageFile,
  formatFileSize,
} from "@/lib/compress-image-client";

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
  const [compressing, setCompressing] = useState(false);
  const [sizeHint, setSizeHint] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setSizeHint(null);

    const compressed = await compressImageFile(file);
    setPreview(URL.createObjectURL(compressed));
    setSizeHint(formatFileSize(compressed.size));
    onCapture(compressed);
    setCompressing(false);
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
        disabled={disabled || compressing}
      />
      {preview ? (
        <div>
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-2xl border-2 border-pink-400 object-cover aspect-[4/3]"
          />
          {sizeHint && (
            <p className="mt-2 text-center text-xs text-green-300">
              Otimizada para a festa · {sizeHint}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || compressing}
          className="flex w-full aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-400/60 bg-purple-950/50 text-purple-200 transition hover:border-pink-400 hover:bg-purple-900/50 disabled:opacity-50"
        >
          <span className="text-4xl">{compressing ? "⏳" : "📸"}</span>
          <span className="mt-2 font-bold">
            {compressing ? "Otimizando foto..." : "Tirar flash"}
          </span>
        </button>
      )}
    </div>
  );
}
