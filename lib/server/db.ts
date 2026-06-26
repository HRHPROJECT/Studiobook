import { createClient, type Client, type InArgs, type InStatement } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import { STUDIOS } from "@/lib/studios";

/**
 * Couche base de données — libSQL (compatible SQLite).
 * - Dev / local : fichier `file:data/studiobook.db` (aucune config requise).
 * - Production : Turso, via TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN).
 * Migrations additives et idempotentes : ne supprime jamais de données existantes.
 */

let _client: Client | null = null;
let _init: Promise<void> | null = null;

function client(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL ?? "file:data/studiobook.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (url.startsWith("file:")) {
    const file = url.slice("file:".length);
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  _client = createClient({ url, authToken });
  return _client;
}

export async function getDb(): Promise<Client> {
  const c = client();
  if (!_init) _init = init(c);
  await _init;
  return c;
}

/* Helpers requête ------------------------------------------------------- */
export async function all<T = Record<string, unknown>>(sql: string, args: InArgs = []): Promise<T[]> {
  const db = await getDb();
  const rs = await db.execute({ sql, args });
  return rs.rows as unknown as T[];
}
export async function get<T = Record<string, unknown>>(sql: string, args: InArgs = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}
export async function run(sql: string, args: InArgs = []) {
  const db = await getDb();
  return db.execute({ sql, args });
}

/* Init ------------------------------------------------------------------ */
async function init(db: Client) {
  await migrate(db);
  await ensureColumns(db);
  await createIndexes(db);
  await seedStudios(db);
  await seedMarketplace(db);
}

async function migrate(db: Client) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studios (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, discipline TEXT NOT NULL, city TEXT NOT NULL,
      district TEXT NOT NULL, distance_km REAL NOT NULL, price_per_hour INTEGER NOT NULL, rating REAL NOT NULL,
      review_count INTEGER NOT NULL, verified INTEGER NOT NULL, top_host INTEGER NOT NULL, metro TEXT NOT NULL,
      address TEXT NOT NULL, description TEXT NOT NULL, access_pmr INTEGER NOT NULL, open_weekend INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studio_equipment (studio_id TEXT NOT NULL, position INTEGER NOT NULL, label TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT, studio_id TEXT NOT NULL, author TEXT NOT NULL,
      rating INTEGER NOT NULL, date TEXT NOT NULL, text TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (user_id INTEGER NOT NULL, studio_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (user_id, studio_id));
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT NOT NULL UNIQUE, user_id INTEGER NOT NULL, studio_id TEXT NOT NULL,
      date TEXT NOT NULL, start_hour INTEGER NOT NULL, duration INTEGER NOT NULL, inge_son INTEGER NOT NULL,
      total REAL NOT NULL, access_code TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at INTEGER NOT NULL
    );

    -- Marketplace (nouveau) ------------------------------------------------
    CREATE TABLE IF NOT EXISTS host_profiles (
      user_id INTEGER PRIMARY KEY, display_name TEXT, bio TEXT, payout_ref TEXT, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studio_availability_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT, studio_id TEXT NOT NULL, weekday INTEGER NOT NULL,
      start_hour INTEGER NOT NULL, end_hour INTEGER NOT NULL, slot_minutes INTEGER NOT NULL DEFAULT 60, active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS studio_availability_exceptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, studio_id TEXT NOT NULL, date TEXT NOT NULL,
      blocked INTEGER NOT NULL DEFAULT 1, custom_start INTEGER, custom_end INTEGER
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, booking_ref TEXT NOT NULL, provider TEXT NOT NULL,
      provider_ref TEXT, amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'eur', status TEXT NOT NULL,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, host_id INTEGER NOT NULL,
      studio_id TEXT NOT NULL, booking_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id INTEGER NOT NULL, sender_id INTEGER NOT NULL,
      body TEXT NOT NULL, read_at INTEGER, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id INTEGER PRIMARY KEY, email_bookings INTEGER NOT NULL DEFAULT 1,
      sms_bookings INTEGER NOT NULL DEFAULT 1, reminders INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL
    );
  `);
}

/** Index créés après ensureColumns (certains portent sur des colonnes ajoutées). */
async function createIndexes(db: Client) {
  await db.executeMultiple(`
    CREATE INDEX IF NOT EXISTS idx_bookings_studio_date ON bookings(studio_id, date);
    CREATE INDEX IF NOT EXISTS idx_avail_studio ON studio_availability_rules(studio_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_studios_owner ON studios(owner_id);
  `);
}

/** Ajoute des colonnes aux tables existantes sans casser les données déjà présentes. */
async function ensureColumns(db: Client) {
  const add = async (table: string, column: string, ddl: string) => {
    const info = await db.execute(`PRAGMA table_info(${table})`);
    const has = info.rows.some((r) => (r as unknown as { name: string }).name === column);
    if (!has) await db.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  };
  await add("users", "role", "role TEXT NOT NULL DEFAULT 'client'");
  await add("users", "phone", "phone TEXT");
  await add("studios", "owner_id", "owner_id INTEGER");
  await add("studios", "capacity", "capacity INTEGER");
  await add("studios", "rules", "rules TEXT");
  await add("studios", "status", "status TEXT NOT NULL DEFAULT 'published'");
  await add("bookings", "updated_at", "updated_at INTEGER");
}

async function seedStudios(db: Client) {
  const rs = await db.execute("SELECT COUNT(*) AS c FROM studios");
  if (Number((rs.rows[0] as unknown as { c: number }).c) > 0) return;

  const stmts: InStatement[] = [];
  for (const s of STUDIOS) {
    stmts.push({
      sql: `INSERT INTO studios
        (id, name, discipline, city, district, distance_km, price_per_hour, rating,
         review_count, verified, top_host, metro, address, description, access_pmr, open_weekend, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'published')`,
      args: [
        s.id, s.name, s.discipline, s.city, s.district, s.distanceKm, s.pricePerHour, s.rating,
        s.reviewCount, s.verified ? 1 : 0, s.topHost ? 1 : 0, s.metro, s.address, s.description,
        s.accessPMR ? 1 : 0, s.openWeekend ? 1 : 0,
      ],
    });
    s.equipment.forEach((e, i) =>
      stmts.push({ sql: "INSERT INTO studio_equipment (studio_id, position, label) VALUES (?,?,?)", args: [s.id, i, e] })
    );
    s.reviews.forEach((r) =>
      stmts.push({ sql: "INSERT INTO reviews (studio_id, author, rating, date, text) VALUES (?,?,?,?,?)", args: [s.id, r.author, r.rating, r.date, r.text] })
    );
  }
  await db.batch(stmts, "write");
}

/** Seed marketplace : hôte démo propriétaire des studios + règles de disponibilité. Idempotent. */
async function seedMarketplace(db: Client) {
  // 1. Hôte démo (mot de passe : "demohost1") — propriétaire des studios seedés.
  const hostEmail = "studio@demo.studiobook";
  let host = (await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [hostEmail] }))
    .rows[0] as unknown as { id: number } | undefined;
  if (!host) {
    // hash de "demohost1" généré au runtime via auth (évite l'import circulaire : on insère un hash valide simple)
    const { hashPassword } = await import("./auth");
    const info = await db.execute({
      sql: "INSERT INTO users (name, email, password_hash, created_at, role) VALUES (?,?,?,?, 'host')",
      args: ["Studio Démo", hostEmail, hashPassword("demohost1"), Date.now()],
    });
    host = { id: Number(info.lastInsertRowid) };
    await db.execute({ sql: "INSERT OR IGNORE INTO host_profiles (user_id, display_name, created_at) VALUES (?,?,?)", args: [host.id, "Studio Démo", Date.now()] });
  }

  // 2. Rattache les studios sans propriétaire à l'hôte démo.
  await db.execute({ sql: "UPDATE studios SET owner_id = ? WHERE owner_id IS NULL", args: [host.id] });

  // 3. Règles de disponibilité par défaut (lun-sam, 9h-20h, créneaux 60 min) si aucune.
  const ar = await db.execute("SELECT COUNT(*) AS c FROM studio_availability_rules");
  if (Number((ar.rows[0] as unknown as { c: number }).c) === 0) {
    const studios = await db.execute("SELECT id, open_weekend FROM studios");
    const stmts: InStatement[] = [];
    for (const row of studios.rows as unknown as { id: string; open_weekend: number }[]) {
      const days = row.open_weekend ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
      for (const wd of days) {
        stmts.push({
          sql: "INSERT INTO studio_availability_rules (studio_id, weekday, start_hour, end_hour, slot_minutes, active) VALUES (?,?,?,?,?,1)",
          args: [row.id, wd, 9, 20, 60],
        });
      }
    }
    if (stmts.length) await db.batch(stmts, "write");
  }
}
