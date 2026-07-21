/**
 * Testa conexão com Supabase após configurar .env.local
 * Uso: node scripts/verify-supabase.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function loadEnv() {
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {
    console.error("❌ Arquivo .env.local não encontrado.");
    console.error("   Copie: cp .env.local.example .env.local");
    process.exit(1);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || url.includes("seu-projeto")) {
  console.error("❌ Configure NEXT_PUBLIC_SUPABASE_URL no .env.local");
  process.exit(1);
}

if (!key || key.includes("sua-service")) {
  console.error("❌ Configure SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

console.log("🔍 Testando Supabase...\n");

const { data: event, error: eventError } = await supabase
  .from("events")
  .select("id, name, code")
  .eq("code", "BREGA2026")
  .single();

if (eventError) {
  console.error("❌ Tabela events:", eventError.message);
  console.error("\n→ Rode supabase/migrations/001_initial.sql no SQL Editor");
  process.exit(1);
}
console.log("✅ Evento:", event.name, `(${event.code})`);

const { count: songCount, error: songError } = await supabase
  .from("songs")
  .select("*", { count: "exact", head: true });

if (songError) {
  console.error("❌ Tabela songs:", songError.message);
  process.exit(1);
}
console.log("✅ Músicas brega:", songCount ?? 0);

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

if (bucketError) {
  console.error("❌ Storage:", bucketError.message);
  process.exit(1);
}

const photosBucket = buckets?.find((b) => b.name === "photos");
if (!photosBucket) {
  console.error("❌ Bucket 'photos' não encontrado");
  console.error("\n→ Rode supabase/migrations/002_storage.sql no SQL Editor");
  process.exit(1);
}
console.log("✅ Bucket photos:", photosBucket.public ? "público" : "privado (deve ser público!)");

console.log("\n🎉 Supabase OK! Rode: npm run dev");
