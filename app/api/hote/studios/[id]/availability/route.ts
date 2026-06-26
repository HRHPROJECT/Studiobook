import { NextResponse } from "next/server";
import { all, getDb, run } from "@/lib/server/db";
import { getCurrentUser, hasHostAccess, isStudioOwner } from "@/lib/server/auth";

async function guard(id: string) {
  const user = await getCurrentUser();
  if (!hasHostAccess(user)) return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  if (!(await isStudioOwner(user!.id, id))) return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { user };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if (g.error) return g.error;
  const rules = await all<{ weekday: number; start_hour: number; end_hour: number; active: number }>(
    "SELECT weekday, start_hour, end_hour, active FROM studio_availability_rules WHERE studio_id = ? ORDER BY weekday",
    [id]
  );
  const exceptions = await all<{ date: string; blocked: number }>(
    "SELECT date, blocked FROM studio_availability_exceptions WHERE studio_id = ? ORDER BY date",
    [id]
  );
  return NextResponse.json({
    rules: rules.map((r) => ({ weekday: Number(r.weekday), startHour: Number(r.start_hour), endHour: Number(r.end_hour), active: !!r.active })),
    exceptions: exceptions.map((e) => ({ date: e.date, blocked: !!e.blocked })),
  });
}

// Remplace toutes les règles de disponibilité (1 par jour de semaine actif).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const rules: { weekday: number; startHour: number; endHour: number; active: boolean }[] = Array.isArray(body.rules) ? body.rules : [];

  await run("DELETE FROM studio_availability_rules WHERE studio_id = ?", [id]);
  const valid = rules.filter((r) => r.active && r.weekday >= 0 && r.weekday <= 6 && r.startHour < r.endHour && r.startHour >= 0 && r.endHour <= 24);
  if (valid.length) {
    const db = await getDb();
    await db.batch(
      valid.map((r) => ({
        sql: "INSERT INTO studio_availability_rules (studio_id, weekday, start_hour, end_hour, slot_minutes, active) VALUES (?,?,?,?,60,1)",
        args: [id, r.weekday, r.startHour, r.endHour],
      })),
      "write"
    );
  }
  return NextResponse.json({ ok: true });
}

// Bloque / débloque une date (exception).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const date = String(body.date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Date invalide." }, { status: 400 });

  const existing = await all("SELECT id FROM studio_availability_exceptions WHERE studio_id = ? AND date = ?", [id, date]);
  if (existing.length) await run("DELETE FROM studio_availability_exceptions WHERE studio_id = ? AND date = ?", [id, date]);
  else await run("INSERT INTO studio_availability_exceptions (studio_id, date, blocked) VALUES (?,?,1)", [id, date]);
  return NextResponse.json({ blocked: existing.length === 0 });
}
