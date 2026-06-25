import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { mapStudio } from "../route";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const row = db.prepare("SELECT * FROM studios WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return NextResponse.json({ error: "Studio introuvable." }, { status: 404 });

  const equipment = (
    db.prepare("SELECT label FROM studio_equipment WHERE studio_id = ? ORDER BY position").all(id) as { label: string }[]
  ).map((e) => e.label);

  const reviews = db
    .prepare("SELECT author, rating, date, text FROM reviews WHERE studio_id = ? ORDER BY id")
    .all(id);

  return NextResponse.json({ studio: { ...mapStudio(row), equipment, reviews } });
}
