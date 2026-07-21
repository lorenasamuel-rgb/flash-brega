/**
 * Aplica migration 003 (avatar_url) se ainda não existir.
 * Uso: node scripts/migrate-avatar.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

function loadEnv() {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { error } = await supabase
  .from("participants")
  .select("avatar_url")
  .limit(1);

if (!error) {
  console.log("✅ Coluna avatar_url já existe");
  process.exit(0);
}

if (!error.message.includes("avatar_url")) {
  console.error("❌ Erro:", error.message);
  process.exit(1);
}

console.log("\n⚠️  Rode isto no Supabase SQL Editor:\n");
console.log(
  "alter table participants add column if not exists avatar_url text;\n",
);
