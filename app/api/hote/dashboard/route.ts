import { NextResponse } from "next/server";
import { all } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const studios = await all<{
    id: string; name: string; discipline: string; city: string; district: string;
    price_per_hour: number; rating: number; review_count: number; status: string;
  }>(
    `SELECT id, name, discipline, city, district, price_per_hour, rating, review_count, status
     FROM studios WHERE owner_id = ? ORDER BY name`,
    [user!.id]
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  let upcoming: {
    ref: string; studioId: string; studioName: string; date: string;
    startHour: number; duration: number; total: number; status: string;
  }[] = [];
  let revenue = 0;

  if (studios.length) {
    const ids = studios.map((s) => s.id);
    const ph = ids.map(() => "?").join(",");
    const rows = await all<{
      ref: string; studio_id: string; name: string; date: string;
      start_hour: number; duration: number; total: number; status: string;
    }>(
      `SELECT b.ref, b.studio_id, s.name AS name, b.date, b.start_hour, b.duration, b.total, b.status
       FROM bookings b JOIN studios s ON s.id = b.studio_id
       WHERE b.studio_id IN (${ph}) AND b.status IN ('confirmed','completed')
       ORDER BY b.date, b.start_hour`,
      ids
    );
    revenue = rows.reduce((a, r) => a + Number(r.total), 0);
    upcoming = rows
      .filter((r) => r.date >= todayISO)
      .map((r) => ({
        ref: r.ref, studioId: r.studio_id, studioName: r.name, date: r.date,
        startHour: Number(r.start_hour), duration: Number(r.duration), total: Number(r.total), status: r.status,
      }));
  }

  const avgRating = studios.length
    ? studios.reduce((a, s) => a + Number(s.rating), 0) / studios.length
    : 0;

  return NextResponse.json({
    studios: studios.map((s) => ({
      id: s.id, name: s.name, discipline: s.discipline, city: s.city, district: s.district,
      pricePerHour: Number(s.price_per_hour), rating: Number(s.rating), reviewCount: Number(s.review_count), status: s.status,
    })),
    upcoming,
    stats: {
      studioCount: studios.length,
      upcomingCount: upcoming.length,
      revenue,
      avgRating: Math.round(avgRating * 10) / 10,
    },
  });
}
