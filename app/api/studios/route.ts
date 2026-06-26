import { NextResponse } from "next/server";
import { listPublicStudios } from "@/lib/server/studios";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const studios = await listPublicStudios({
    q: u.searchParams.get("q") ?? undefined,
    discipline: u.searchParams.get("discipline") ?? undefined,
    city: u.searchParams.get("city") ?? undefined,
    maxPrice: u.searchParams.get("maxPrice") ? Number(u.searchParams.get("maxPrice")) : undefined,
    weekend: u.searchParams.get("weekend") === "1",
    pmr: u.searchParams.get("pmr") === "1",
    sort: (u.searchParams.get("sort") as "pertinence" | "prix" | "note") ?? "pertinence",
  });
  return NextResponse.json({ studios });
}
