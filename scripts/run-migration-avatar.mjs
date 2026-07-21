/**
 * Migration avatar_url via Postgres (senha só via env, não salva em arquivo)
 * SUPABASE_DB_PASSWORD='...' node scripts/run-migration-avatar.mjs
 */
import pg from "pg";

const ref = "wdcnusqibjgcxnphygux";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error("Defina SUPABASE_DB_PASSWORD no ambiente (não commitar)");
  process.exit(1);
}

const encoded = encodeURIComponent(password);
const urls = [
  `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

for (const url of urls) {
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(
      "alter table participants add column if not exists avatar_url text;",
    );
    console.log("✅ Coluna avatar_url criada/confirmada");
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
console.error(
  "alter table participants add column if not exists avatar_url text;",
);
process.exit(1);
