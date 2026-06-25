import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

function listFavorites(userId: number): string[] {
  return (
    getDb()
      .prepare("SELECT studio_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId) as { studio_id: string }[]
  ).map((r) => r.studio_id);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ favorites: [] });
  return NextResponse.json({ favorites: listFavorites(user.id) });
}

// Toggle a favorite, returns the new list.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connecte-toi pour enregistrer des favoris." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const studioId = String(body.studioId ?? "");
  const db = getDb();
  if (!db.prepare("SELECT id FROM studios WHERE id = ?").get(studioId))
    return NextResponse.json({ error: "Studio inconnu." }, { status: 400 });

  const exists = db
    .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND studio_id = ?")
    .get(user.id, studioId);
  if (exists) {
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND studio_id = ?").run(user.id, studioId);
  } else {
    db.prepare("INSERT INTO favorites (user_id, studio_id, created_at) VALUES (?, ?, ?)").run(
      user.id, studioId, Date.now()
    );
  }
  return NextResponse.json({ favorites: listFavorites(user.id), favorited: !exists });
}
