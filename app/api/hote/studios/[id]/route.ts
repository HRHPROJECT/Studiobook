import { NextResponse } from "next/server";
import { all, get, getDb, run } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess, isStudioOwner } from "@/lib/server/auth";

const DISCIPLINES = ["musique", "podcast", "photo", "video", "danse"];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  if (!(await isStudioOwner(user!.id, id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const s = await get<Record<string, unknown>>("SELECT * FROM studios WHERE id = ?", [id]);
  if (!s) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  const equipment = (await all<{ label: string }>("SELECT label FROM studio_equipment WHERE studio_id = ? ORDER BY position", [id])).map((e) => e.label);

  return NextResponse.json({
    studio: {
      id: s.id, name: s.name, discipline: s.discipline, city: s.city, district: s.district,
      address: s.address, pricePerHour: Number(s.price_per_hour), capacity: Number(s.capacity ?? 1),
      description: s.description, accessPMR: !!s.access_pmr, openWeekend: !!s.open_weekend, status: s.status, equipment,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  if (!(await isStudioOwner(user!.id, id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const discipline = DISCIPLINES.includes(b.discipline) ? b.discipline : "musique";
  const city = String(b.city ?? "").trim();
  const district = String(b.district ?? "").trim() || city;
  const address = String(b.address ?? "").trim();
  const pricePerHour = Math.round(Number(b.pricePerHour));
  const capacity = Math.max(1, Math.round(Number(b.capacity) || 1));
  const description = String(b.description ?? "").trim();
  const accessPMR = b.accessPMR ? 1 : 0;
  const openWeekend = b.openWeekend ? 1 : 0;
  const equipment: string[] = Array.isArray(b.equipment) ? b.equipment.map((e: unknown) => String(e).trim()).filter(Boolean).slice(0, 12) : [];

  if (name.length < 2 || !city || !Number.isFinite(pricePerHour) || pricePerHour < 5 || pricePerHour > 500 || description.length < 20)
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  await run(
    `UPDATE studios SET name=?, discipline=?, city=?, district=?, address=?, price_per_hour=?, capacity=?, description=?, access_pmr=?, open_weekend=? WHERE id=?`,
    [name, discipline, city, district, address, pricePerHour, capacity, description, accessPMR, openWeekend, id]
  );
  await run("DELETE FROM studio_equipment WHERE studio_id = ?", [id]);
  if (equipment.length) {
    const db = await getDb();
    await db.batch(equipment.map((label, i) => ({ sql: "INSERT INTO studio_equipment (studio_id, position, label) VALUES (?,?,?)", args: [id, i, label] })), "write");
  }
  return NextResponse.json({ ok: true });
}
