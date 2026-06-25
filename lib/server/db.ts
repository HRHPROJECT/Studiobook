import { createClient, type Client, type InArgs, type InStatement } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import { STUDIOS } from "@/lib/studios";

/**
 * Couche base de données — libSQL (compatible SQLite).
 * - Dev / local : fichier `file:data/studiobook.db` (aucune config requise).
 * - Production : Turso, via TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN).
 * Données persistantes et gratuites, hébergeables sur n'importe quel host Node.
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

/** Renvoie le client après s'être assuré que le schéma + le seed existent (une seule fois). */
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
  await seed(db);
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
      token      TEXT    PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studios (
      id             TEXT    PRIMARY KEY,
      name           TEXT    NOT NULL,
      discipline     TEXT    NOT NULL,
      city           TEXT    NOT NULL,
      district       TEXT    NOT NULL,
      distance_km    REAL    NOT NULL,
      price_per_hour INTEGER NOT NULL,
      rating         REAL    NOT NULL,
      review_count   INTEGER NOT NULL,
      verified       INTEGER NOT NULL,
      top_host       INTEGER NOT NULL,
      metro          TEXT    NOT NULL,
      address        TEXT    NOT NULL,
      description    TEXT    NOT NULL,
      access_pmr     INTEGER NOT NULL,
      open_weekend   INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studio_equipment (
      studio_id TEXT    NOT NULL,
      position  INTEGER NOT NULL,
      label     TEXT    NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      studio_id TEXT    NOT NULL,
      author    TEXT    NOT NULL,
      rating    INTEGER NOT NULL,
      date      TEXT    NOT NULL,
      text      TEXT    NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      user_id    INTEGER NOT NULL,
      studio_id  TEXT    NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, studio_id)
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ref         TEXT    NOT NULL UNIQUE,
      user_id     INTEGER NOT NULL,
      studio_id   TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      start_hour  INTEGER NOT NULL,
      duration    INTEGER NOT NULL,
      inge_son    INTEGER NOT NULL,
      total       REAL    NOT NULL,
      access_code TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'confirmed',
      created_at  INTEGER NOT NULL
    );
  `);
}

async function seed(db: Client) {
  const rs = await db.execute("SELECT COUNT(*) AS c FROM studios");
  if (Number((rs.rows[0] as unknown as { c: number }).c) > 0) return;

  const stmts: InStatement[] = [];
  for (const s of STUDIOS) {
    stmts.push({
      sql: `INSERT INTO studios
        (id, name, discipline, city, district, distance_km, price_per_hour, rating,
         review_count, verified, top_host, metro, address, description, access_pmr, open_weekend)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
