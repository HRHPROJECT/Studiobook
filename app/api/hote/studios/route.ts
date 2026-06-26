import { NextResponse } from "next/server";
import { all, get, run, getDb } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess } from "@/lib/server/auth";

const DISCIPLINES = ["musique", "podcast", "photo", "video", "danse"];

export async function GET() {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const studios = await all("SELECT id, name, discipline, city, district, price_per_hour, status FROM studios WHERE owner_id = ? ORDER BY name", [user!.id]);
  return NextResponse.json({ studios });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "studio";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const discipline = DISCIPLINES.includes(b.discipline) ? b.discipline : "musique";
  const city = String(b.city ?? "").trim();
  const district = String(b.district ?? "").trim() || city;
  const address = String(b.address ?? "").trim();
  const pricePerHour = Math.round(Number(b.pricePerHour));
  const description = String(b.description ?? "").trim();
  const capacity = Number.isFinite(Number(b.capacity)) ? Math.max(1, Math.round(Number(b.capacity))) : 1;
  const accessPMR = !!b.accessPMR;
  const openWeekend = !!b.openWeekend;
  const equipment: string[] = Array.isArray(b.equipment) ? b.equipment.map((e: unknown) => String(e).trim()).filter(Boolean).slice(0, 12) : [];

  if (name.length < 2) return NextResponse.json({ error: "Nom du studio requis." }, { status: 400 });
  if (!city) return NextResponse.json({ error: "Ville requise." }, { status: 400 });
  if (!Number.isFinite(pricePerHour) || pricePerHour < 5 || pricePerHour > 500)
    return NextResponse.json({ error: "Prix horaire invalide (5 à 500 €)." }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ error: "Ajoute une description d'au moins 20 caractères." }, { status: 400 });

  // id unique
  let id = slugify(name);
  if (await get("SELECT id FROM studios WHERE id = ?", [id])) id = `${id}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const now = Date.now();
  await run(
    `INSERT INTO studios
      (id, name, discipline, city, district, distance_km, price_per_hour, rating, review_count,
       verified, top_host, metro, address, description, access_pmr, open_weekend, owner_id, capacity, rules, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'published')`,
    [id, name, discipline, city, district, 0, pricePerHour, 0, 0, 0, 0, "", address, description,
     accessPMR ? 1 : 0, openWeekend ? 1 : 0, user!.id, capacity, ""]
  );

  if (equipment.length) {
    const db = await getDb();
    await db.batch(
      equipment.map((label, i) => ({
        sql: "INSERT INTO studio_equipment (studio_id, position, label) VALUES (?,?,?)",
        args: [id, i, label],
      })),
      "write"
    );
  }

  const photos: string[] = Array.isArray(b.photos) ? b.photos.map((p: unknown) => String(p).trim()).filter(Boolean).slice(0, 8) : [];
  if (photos.length) {
    const pdb = await getDb();
    await pdb.batch(photos.map((url, i) => ({ sql: "INSERT INTO studio_media (studio_id, position, url) VALUES (?,?,?)", args: [id, i, url] })), "write");
  }

  // Disponibilités par défaut (lun-sam ou lun-ven, 9h-20h, créneaux 60 min)
  const days = openWeekend ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  const db = await getDb();
  await db.batch(
    days.map((wd) => ({
      sql: "INSERT INTO studio_availability_rules (studio_id, weekday, start_hour, end_hour, slot_minutes, active) VALUES (?,?,?,?,?,1)",
      args: [id, wd, 9, 20, 60],
    })),
    "write"
  );

  return NextResponse.json({ id, name }, { status: 201 });
}
