import { all, get } from "./db";
import type { Discipline } from "@/lib/studios";

export type PublicStudioSummary = {
  id: string; name: string; discipline: Discipline; disciplines: Discipline[];
  city: string; district: string; distanceKm: number; pricePerHour: number;
  rating: number; reviewCount: number; verified: boolean; topHost: boolean; availableToday: boolean;
};

type Row = Record<string, unknown>;

function summary(r: Row, openToday: Set<string>): PublicStudioSummary {
  const d = r.discipline as Discipline;
  return {
    id: String(r.id), name: String(r.name), discipline: d, disciplines: [d],
    city: String(r.city), district: String(r.district), distanceKm: Number(r.distance_km),
    pricePerHour: Number(r.price_per_hour), rating: Number(r.rating), reviewCount: Number(r.review_count),
    verified: !!r.verified, topHost: !!r.top_host, availableToday: openToday.has(String(r.id)),
  };
}

export type StudioFilters = {
  q?: string; discipline?: string; city?: string; maxPrice?: number; weekend?: boolean; pmr?: boolean;
  sort?: "pertinence" | "prix" | "note";
};

export async function listPublicStudios(f: StudioFilters): Promise<PublicStudioSummary[]> {
  const where: string[] = ["status = 'published'"];
  const args: (string | number)[] = [];
  if (f.discipline && f.discipline !== "all") { where.push("discipline = ?"); args.push(f.discipline); }
  if (f.city) { where.push("city = ?"); args.push(f.city); }
  if (f.maxPrice) { where.push("price_per_hour <= ?"); args.push(f.maxPrice); }
  if (f.weekend) where.push("open_weekend = 1");
  if (f.pmr) where.push("access_pmr = 1");
  if (f.q) {
    where.push("(LOWER(name) LIKE ? OR LOWER(district) LIKE ? OR LOWER(city) LIKE ? OR LOWER(description) LIKE ?)");
    const like = `%${f.q.toLowerCase()}%`;
    args.push(like, like, like, like);
  }

  let order = "rating DESC";
  if (f.sort === "prix") order = "price_per_hour ASC";
  else if (f.sort === "note") order = "rating DESC";

  const rows = await all<Row>(`SELECT * FROM studios WHERE ${where.join(" AND ")} ORDER BY ${order}`, args);

  // Studios ouverts aujourd'hui (règle active pour le jour courant)
  const weekday = new Date().getDay();
  const openRows = await all<{ studio_id: string }>(
    "SELECT DISTINCT studio_id FROM studio_availability_rules WHERE weekday = ? AND active = 1",
    [weekday]
  );
  const openToday = new Set(openRows.map((r) => r.studio_id));

  return rows.map((r) => summary(r, openToday));
}

export type PublicStudioDetail = PublicStudioSummary & {
  metro: string; address: string; description: string; accessPMR: boolean; openWeekend: boolean;
  equipment: string[]; photos: string[]; reviews: { author: string; rating: number; date: string; text: string }[];
};

export async function getPublicStudioDetail(id: string): Promise<PublicStudioDetail | null> {
  const r = await get<Row>("SELECT * FROM studios WHERE id = ? AND status = 'published'", [id]);
  if (!r) return null;
  const weekday = new Date().getDay();
  const openRows = await all<{ c: number }>(
    "SELECT COUNT(*) AS c FROM studio_availability_rules WHERE studio_id = ? AND weekday = ? AND active = 1",
    [id, weekday]
  );
  const openToday = new Set(Number(openRows[0]?.c ?? 0) > 0 ? [id] : []);
  const base = summary(r, openToday);

  const equipment = (await all<{ label: string }>("SELECT label FROM studio_equipment WHERE studio_id = ? ORDER BY position", [id])).map((e) => e.label);
  const photos = (await all<{ url: string }>("SELECT url FROM studio_media WHERE studio_id = ? ORDER BY position", [id])).map((m) => m.url);
  const reviews = await all<{ author: string; rating: number; date: string; text: string }>(
    "SELECT author, rating, date, text FROM reviews WHERE studio_id = ? ORDER BY id DESC", [id]
  );

  return {
    ...base,
    metro: String(r.metro ?? ""), address: String(r.address ?? ""), description: String(r.description ?? ""),
    accessPMR: !!r.access_pmr, openWeekend: !!r.open_weekend,
    equipment, photos, reviews: reviews.map((x) => ({ author: x.author, rating: Number(x.rating), date: x.date, text: x.text })),
  };
}
