import { NextResponse } from "next/server";
import { get, run } from "@/lib/server/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/server/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name) return NextResponse.json({ error: "Indique ton prénom." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères." }, { status: 400 });

  if (await get("SELECT id FROM users WHERE email = ?", [email]))
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

  const info = await run(
    "INSERT INTO users (name, email, password_hash, created_at) VALUES (?,?,?,?)",
    [name, email, hashPassword(password), Date.now()]
  );
  const id = Number(info.lastInsertRowid);

  const { token, expires } = await createSession(id);
  await setSessionCookie(token, expires);
  return NextResponse.json({ user: { id, name, email } });
}
