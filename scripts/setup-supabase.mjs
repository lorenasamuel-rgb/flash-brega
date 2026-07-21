#!/usr/bin/env node
/**
 * Setup automático do Supabase
 * 1. Edite .env.local com suas chaves
 * 2. Rode: npm run setup:supabase
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    process.env[key] = val;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DATABASE_URL;

const placeholders = ["SEU-PROJETO", "COLE_A_", "sua-"];
function isPlaceholder(v) {
  if (!v) return true;
  return placeholders.some((p) => v.includes(p));
}

console.log("\n🎸 Flash Brega — Setup Supabase\n");

if (isPlaceholder(url) || isPlaceholder(serviceKey)) {
  console.log("❌ .env.local ainda não configurado.\n");
  console.log("Abra o Supabase Dashboard:");
  console.log("  https://supabase.com/dashboard\n");
  console.log("1. Clique no seu projeto");
  console.log("2. Engrenagem (canto inferior esquerdo) → Project Settings");
  console.log("3. Menu API");
  console.log("4. Copie estes 3 valores para .env.local:\n");
  console.log("   Project URL        → NEXT_PUBLIC_SUPABASE_URL");
  console.log("   anon public        → NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.log("   service_role       → SUPABASE_SERVICE_ROLE_KEY (clique Reveal)\n");
  console.log("Depois rode de novo: npm run setup:supabase\n");
  process.exit(1);
}

// Tentar rodar SQL via DATABASE_URL (opcional)
if (dbUrl && !isPlaceholder(dbUrl)) {
  console.log("📦 Rodando migrations via DATABASE_URL...");
  const sql = readFileSync(resolve(root, "supabase/setup-completo.sql"), "utf8");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ SQL executado com sucesso\n");
  } catch (err) {
    console.error("⚠️  Erro no SQL via DATABASE_URL:", err.message);
    console.log("   → Rode manualmente: supabase/setup-completo.sql no SQL Editor\n");
  } finally {
    await client.end();
  }
} else {
  console.log("ℹ️  DATABASE_URL não configurado.");
  console.log("   Rode o SQL manualmente (1x):");
  console.log("   Dashboard → SQL Editor → cole supabase/setup-completo.sql → Run\n");
}

// Verificar via API
console.log("🔍 Verificando conexão...");
const supabase = createClient(url, serviceKey);

const { data: event, error: e1 } = await supabase
  .from("events")
  .select("id, name, code")
  .eq("code", "BREGA2026")
  .single();

if (e1) {
  console.error("❌ Tabela events não encontrada:", e1.message);
  console.log("\n→ Rode supabase/setup-completo.sql no SQL Editor do Supabase\n");
  process.exit(1);
}
console.log("✅ Evento:", event.name);

const { count } = await supabase.from("songs").select("*", { count: "exact", head: true });
console.log("✅ Músicas:", count ?? 0);

const { data: buckets } = await supabase.storage.listBuckets();
const photos = buckets?.find((b) => b.name === "photos");
if (!photos) {
  console.error("❌ Bucket photos não encontrado — rode setup-completo.sql");
  process.exit(1);
}
console.log("✅ Bucket photos:", photos.public ? "público" : "PRIVADO (precisa ser público!)");

console.log("\n🎉 Tudo pronto! Rode: npm run dev\n");
