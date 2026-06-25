import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/server/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const db = getDb();
  const row = db
    .prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; name: string; email: string; password_hash: string } | undefined;

  if (!row) return NextResponse.json({ error: "Aucun compte trouvé avec cet email." }, { status: 404 });
  if (!verifyPassword(password, row.password_hash))
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });

  const { token, expires } = createSession(row.id);
  await setSessionCookie(token, expires);
  return NextResponse.json({ user: { id: row.id, name: row.name, email: row.email } });
}
