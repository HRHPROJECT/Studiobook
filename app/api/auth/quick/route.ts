import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/server/auth";

// Demo OAuth — creates (or reuses) a throwaway account for Apple/Google buttons.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const provider = body.provider === "google" ? "google" : "apple";
  const label = provider === "apple" ? "Apple" : "Google";
  const email = `demo@${provider}.studiobook`;

  const db = getDb();
  let row = db.prepare("SELECT id, name, email FROM users WHERE email = ?").get(email) as
    | { id: number; name: string; email: string }
    | undefined;

  if (!row) {
    const info = db
      .prepare("INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
      .run(`Créateur·rice ${label}`, email, hashPassword(Math.random().toString(36)), Date.now());
    row = { id: Number(info.lastInsertRowid), name: `Créateur·rice ${label}`, email };
  }

  const { token, expires } = createSession(row.id);
  await setSessionCookie(token, expires);
  return NextResponse.json({ user: row });
}
