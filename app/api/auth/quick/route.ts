import { NextResponse } from "next/server";
import { get, run } from "@/lib/server/db";
import { hashPassword, createSession, setSessionCookie, type Role } from "@/lib/server/auth";

// OAuth démo — crée (ou réutilise) un compte client de test pour les boutons Apple / Google.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const provider = body.provider === "google" ? "google" : "apple";
  const label = provider === "apple" ? "Apple" : "Google";
  const email = `demo@${provider}.studiobook`;

  let row = await get<{ id: number; name: string; email: string; role: Role }>(
    "SELECT id, name, email, role FROM users WHERE email = ?",
    [email]
  );

  if (!row) {
    const info = await run(
      "INSERT INTO users (name, email, password_hash, created_at, role) VALUES (?,?,?,?, 'client')",
      [`Créateur·rice ${label}`, email, hashPassword(Math.random().toString(36)), Date.now()]
    );
    const id = Number(info.lastInsertRowid);
    await run("INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)", [id]);
    row = { id, name: `Créateur·rice ${label}`, email, role: "client" };
  }

  const { token, expires } = await createSession(Number(row.id));
  await setSessionCookie(token, expires);
  return NextResponse.json({ user: { id: Number(row.id), name: row.name, email: row.email, role: (row.role ?? "client") as Role } });
}
