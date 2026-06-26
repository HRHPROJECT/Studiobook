import { NextResponse } from "next/server";
import { run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? user?.email ?? "").trim().toLowerCase();
  const subject = String(b.subject ?? "").trim().slice(0, 120);
  const body = String(b.body ?? "").trim().slice(0, 2000);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  if (body.length < 10) return NextResponse.json({ error: "Décris ta demande (10 caractères min.)." }, { status: 400 });
  await run("INSERT INTO support_requests (user_id, email, subject, body, created_at) VALUES (?,?,?,?,?)",
    [user?.id ?? null, email, subject, body, Date.now()]);
  return NextResponse.json({ ok: true });
}
