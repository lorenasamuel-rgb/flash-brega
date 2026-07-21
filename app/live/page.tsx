"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LiveMosaic } from "@/components/LiveMosaic";

function LiveContent() {
  const searchParams = useSearchParams();
  const eventCode = searchParams.get("event") ?? "BREGA2026";
  return <LiveMosaic eventCode={eventCode} />;
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#0d0221] text-purple-300">
          Carregando painel...
        </div>
      }
    >
      <LiveContent />
    </Suspense>
  );
}
