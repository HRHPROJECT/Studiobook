import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

async function listFavorites(userId: number): Promise<string[]> {
  const rows = await all<{ studio_id: string }>(
    "SELECT studio_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows.map((r) => r.studio_id);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ favorites: [] });
  return NextResponse.json({ favorites: await listFavorites(user.id) });
}

// Toggle un favori, renvoie la nouvelle liste.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour enregistrer des favoris." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const studioId = String(body.studioId ?? "");
  if (!(await get("SELECT id FROM studios WHERE id = ?", [studioId])))
    return NextResponse.json({ error: "Studio inconnu." }, { status: 400 });

  const exists = await get("SELECT 1 AS x FROM favorites WHERE user_id = ? AND studio_id = ?", [user.id, studioId]);
  if (exists) {
    await run("DELETE FROM favorites WHERE user_id = ? AND studio_id = ?", [user.id, studioId]);
  } else {
    await run("INSERT INTO favorites (user_id, studio_id, created_at) VALUES (?,?,?)", [user.id, studioId, Date.now()]);
  }
  return NextResponse.json({ favorites: await listFavorites(user.id), favorited: !exists });
}
