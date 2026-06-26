import { NextResponse } from "next/server";
import { all } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ reviews: [] });
  const rows = await all<{ studio_id: string; studio_name: string; rating: number; date: string; text: string }>(
    `SELECT r.studio_id, s.name AS studio_name, r.rating, r.date, r.text
     FROM reviews r JOIN studios s ON s.id = r.studio_id
     WHERE r.user_id = ? ORDER BY r.id DESC`,
    [user.id]
  );
  return NextResponse.json({
    reviews: rows.map((r) => ({ studioId: r.studio_id, studioName: r.studio_name, rating: Number(r.rating), date: r.date, text: r.text })),
  });
}
