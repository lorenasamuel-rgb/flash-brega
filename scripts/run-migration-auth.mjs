/**
 * Migration 004_auth via Postgres (senha só via env, não salva em arquivo)
 * SUPABASE_DB_PASSWORD='...' node scripts/run-migration-auth.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ref = "wdcnusqibjgcxnphygux";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error("Defina SUPABASE_DB_PASSWORD no ambiente (não commitar)");
  process.exit(1);
}

const sql = readFileSync(
  resolve(__dirname, "../supabase/migrations/004_auth.sql"),
  "utf8",
);

const encoded = encodeURIComponent(password);
const regions = [
  "sa-east-1",
  "us-east-1",
  "us-west-1",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
];
const urls = [
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:6543/postgres`,
];
for (const r of regions) {
  urls.push(
    `postgresql://postgres.${ref}:${encoded}@aws-0-${r}.pooler.supabase.com:6543/postgres`,
  );
  urls.push(
    `postgresql://postgres.${ref}:${encoded}@aws-0-${r}.pooler.supabase.com:5432/postgres`,
  );
}

for (const url of urls) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Migration 004_auth executada com sucesso");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log("Tentativa falhou:", err.message);
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

console.error("❌ Não foi possível conectar. Rode no SQL Editor:");
console.error(readFileSync(resolve(__dirname, "../supabase/migrations/004_auth.sql"), "utf8"));
process.exit(1);
