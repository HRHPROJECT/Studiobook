import { NextResponse } from "next/server";
import { all, get } from "@/lib/server/db";
import { mapStudio } from "../route";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await get<Record<string, unknown>>("SELECT * FROM studios WHERE id = ?", [id]);
  if (!row) return NextResponse.json({ error: "Studio introuvable." }, { status: 404 });

  const equipment = (
    await all<{ label: string }>("SELECT label FROM studio_equipment WHERE studio_id = ? ORDER BY position", [id])
  ).map((e) => e.label);

  const reviews = await all("SELECT author, rating, date, text FROM reviews WHERE studio_id = ? ORDER BY id", [id]);

  return NextResponse.json({ studio: { ...mapStudio(row), equipment, reviews } });
}
