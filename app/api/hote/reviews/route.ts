import { NextResponse } from "next/server";
import { all } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const studios = await all<{ id: string }>("SELECT id FROM studios WHERE owner_id = ?", [user!.id]);
  if (!studios.length) return NextResponse.json({ reviews: [] });
  const ids = studios.map((s) => s.id);
  const ph = ids.map(() => "?").join(",");
  const rows = await all<{ studio_id: string; studio_name: string; author: string; rating: number; date: string; text: string }>(
    `SELECT r.studio_id, s.name AS studio_name, r.author, r.rating, r.date, r.text
     FROM reviews r JOIN studios s ON s.id = r.studio_id
     WHERE r.studio_id IN (${ph}) ORDER BY r.id DESC`,
    ids
  );
  return NextResponse.json({
    reviews: rows.map((r) => ({ studioId: r.studio_id, studioName: r.studio_name, author: r.author, rating: Number(r.rating), date: r.date, text: r.text })),
  });
}
