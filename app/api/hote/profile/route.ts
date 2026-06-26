import { NextResponse } from "next/server";
import { get, run } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await run("INSERT OR IGNORE INTO host_profiles (user_id, display_name, created_at) VALUES (?,?,?)", [user!.id, user!.name, Date.now()]);
  const p = await get<{ display_name: string; bio: string }>("SELECT display_name, bio FROM host_profiles WHERE user_id = ?", [user!.id]);
  return NextResponse.json({ displayName: p?.display_name ?? user!.name, bio: p?.bio ?? "", email: user!.email });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const displayName = String(b.displayName ?? "").trim().slice(0, 80);
  const bio = String(b.bio ?? "").trim().slice(0, 600);
  if (displayName.length < 2) return NextResponse.json({ error: "Nom de l'établissement requis." }, { status: 400 });
  await run("INSERT OR IGNORE INTO host_profiles (user_id, display_name, created_at) VALUES (?,?,?)", [user!.id, displayName, Date.now()]);
  await run("UPDATE host_profiles SET display_name = ?, bio = ? WHERE user_id = ?", [displayName, bio, user!.id]);
  return NextResponse.json({ ok: true });
}
