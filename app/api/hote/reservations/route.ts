import { NextResponse } from "next/server";
import { all } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const studios = await all<{ id: string }>("SELECT id FROM studios WHERE owner_id = ?", [user!.id]);
  if (!studios.length) return NextResponse.json({ reservations: [] });
  const ids = studios.map((s) => s.id);
  const ph = ids.map(() => "?").join(",");

  const rows = await all<{
    ref: string; studio_name: string; client_name: string; date: string;
    start_hour: number; duration: number; total: number; status: string;
  }>(
    `SELECT b.ref, s.name AS studio_name, u.name AS client_name, b.date, b.start_hour, b.duration, b.total, b.status
     FROM bookings b JOIN studios s ON s.id = b.studio_id JOIN users u ON u.id = b.user_id
     WHERE b.studio_id IN (${ph}) ORDER BY b.date DESC, b.start_hour DESC`,
    ids
  );

  return NextResponse.json({
    reservations: rows.map((r) => ({
      ref: r.ref, studioName: r.studio_name, clientName: r.client_name, date: r.date,
      startHour: Number(r.start_hour), duration: Number(r.duration), total: Number(r.total), status: r.status,
    })),
  });
}
