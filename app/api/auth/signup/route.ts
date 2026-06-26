import { NextResponse } from "next/server";
import { get, run } from "@/lib/server/db";
import { hashPassword, createSession, setSessionCookie, type Role } from "@/lib/server/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role: Role = ["client", "host", "both"].includes(body.role) ? body.role : "client";

  if (!name) return NextResponse.json({ error: "Indique ton prénom." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères." }, { status: 400 });

  if (await get("SELECT id FROM users WHERE email = ?", [email]))
    return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });

  const info = await run(
    "INSERT INTO users (name, email, password_hash, created_at, role) VALUES (?,?,?,?,?)",
    [name, email, hashPassword(password), Date.now(), role]
  );
  const id = Number(info.lastInsertRowid);
  await run("INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)", [id]);
  if (role === "host" || role === "both") {
    await run("INSERT OR IGNORE INTO host_profiles (user_id, display_name, created_at) VALUES (?,?,?)", [id, name, Date.now()]);
  }

  const { token, expires } = await createSession(id);
  await setSessionCookie(token, expires);
  return NextResponse.json({ user: { id, name, email, role } });
}
