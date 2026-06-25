import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { STUDIOS } from "@/lib/studios";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "studiobook.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seed(db);
  _db = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT    PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      studio_id TEXT    NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      position  INTEGER NOT NULL,
      label     TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      studio_id TEXT    NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      author    TEXT    NOT NULL,
      rating    INTEGER NOT NULL,
      date      TEXT    NOT NULL,
      text      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      studio_id  TEXT    NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, studio_id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ref         TEXT    NOT NULL UNIQUE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      studio_id   TEXT    NOT NULL REFERENCES studios(id),
      date        TEXT    NOT NULL,
      start_hour  INTEGER NOT NULL,
      duration    INTEGER NOT NULL,
      inge_son    INTEGER NOT NULL,
      total       INTEGER NOT NULL,
      access_code TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'confirmed',
      created_at  INTEGER NOT NULL
    );
  `);
}

function seed(db: Database.Database) {
  const { c } = db.prepare("SELECT COUNT(*) AS c FROM studios").get() as { c: number };
  if (c > 0) return;

  const insStudio = db.prepare(`
    INSERT INTO studios
      (id, name, discipline, city, district, distance_km, price_per_hour, rating,
       review_count, verified, top_host, metro, address, description, access_pmr, open_weekend)
    VALUES
      (@id, @name, @discipline, @city, @district, @distanceKm, @pricePerHour, @rating,
       @reviewCount, @verified, @topHost, @metro, @address, @description, @accessPMR, @openWeekend)
  `);
  const insEq = db.prepare(
    "INSERT INTO studio_equipment (studio_id, position, label) VALUES (?, ?, ?)"
  );
  const insRev = db.prepare(
    "INSERT INTO reviews (studio_id, author, rating, date, text) VALUES (?, ?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    for (const s of STUDIOS) {
      insStudio.run({
        id: s.id,
        name: s.name,
        discipline: s.discipline,
        city: s.city,
        district: s.district,
        distanceKm: s.distanceKm,
        pricePerHour: s.pricePerHour,
        rating: s.rating,
        reviewCount: s.reviewCount,
        verified: s.verified ? 1 : 0,
        topHost: s.topHost ? 1 : 0,
        metro: s.metro,
        address: s.address,
        description: s.description,
        accessPMR: s.accessPMR ? 1 : 0,
        openWeekend: s.openWeekend ? 1 : 0,
      });
      s.equipment.forEach((e, i) => insEq.run(s.id, i, e));
      s.reviews.forEach((r) => insRev.run(s.id, r.author, r.rating, r.date, r.text));
    }
  });
  tx();
}
