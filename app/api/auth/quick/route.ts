import { NextResponse } from "next/server";
import { get, run } from "@/lib/server/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/server/auth";

// OAuth démo — crée (ou réutilise) un compte de test pour les boutons Apple / Google.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const provider = body.provider === "google" ? "google" : "apple";
  const label = provider === "apple" ? "Apple" : "Google";
  const email = `demo@${provider}.studiobook`;

  let row = await get<{ id: number; name: string; email: string }>(
    "SELECT id, name, email FROM users WHERE email = ?",
    [email]
  );

  if (!row) {
    const info = await run(
      "INSERT INTO users (name, email, password_hash, created_at) VALUES (?,?,?,?)",
      [`Créateur·rice ${label}`, email, hashPassword(Math.random().toString(36)), Date.now()]
    );
    row = { id: Number(info.lastInsertRowid), name: `Créateur·rice ${label}`, email };
  }

  const { token, expires } = await createSession(Number(row.id));
  await setSessionCookie(token, expires);
  return NextResponse.json({ user: { id: Number(row.id), name: row.name, email: row.email } });
}
