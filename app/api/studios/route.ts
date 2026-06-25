import { NextResponse } from "next/server";
import { all } from "@/lib/server/db";

type Row = Record<string, unknown>;

export function mapStudio(r: Row) {
  return {
    id: r.id,
    name: r.name,
    discipline: r.discipline,
    city: r.city,
    district: r.district,
    distanceKm: r.distance_km,
    pricePerHour: r.price_per_hour,
    rating: r.rating,
    reviewCount: r.review_count,
    verified: !!r.verified,
    topHost: !!r.top_host,
    metro: r.metro,
    address: r.address,
    description: r.description,
    accessPMR: !!r.access_pmr,
    openWeekend: !!r.open_weekend,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const discipline = url.searchParams.get("discipline");
  const city = url.searchParams.get("city");
  const q = url.searchParams.get("q");
  const maxPrice = url.searchParams.get("maxPrice");
  const weekend = url.searchParams.get("weekend");
  const pmr = url.searchParams.get("pmr");

  const where: string[] = [];
  const params: (string | number)[] = [];
  if (discipline && discipline !== "all") { where.push("discipline = ?"); params.push(discipline); }
  if (city) { where.push("city = ?"); params.push(city); }
  if (maxPrice) { where.push("price_per_hour <= ?"); params.push(Number(maxPrice)); }
  if (weekend === "1") where.push("open_weekend = 1");
  if (pmr === "1") where.push("access_pmr = 1");
  if (q) {
    where.push("(LOWER(name) LIKE ? OR LOWER(district) LIKE ? OR LOWER(city) LIKE ? OR LOWER(description) LIKE ?)");
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like, like, like);
  }

  const sql = `SELECT * FROM studios ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY rating DESC`;
  const rows = await all<Row>(sql, params);
  return NextResponse.json({ studios: rows.map(mapStudio) });
}
