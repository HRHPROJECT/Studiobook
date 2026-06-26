import { NextResponse } from "next/server";
import { run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const phone = String(b.phone ?? "").trim().slice(0, 30);
  if (name.length < 2) return NextResponse.json({ error: "Prénom requis." }, { status: 400 });
  await run("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone || null, user.id]);
  return NextResponse.json({ ok: true, user: { ...user, name } });
}
