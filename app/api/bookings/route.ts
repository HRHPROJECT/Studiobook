import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { getDb } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

const INGE_RATE = 15;
const SERVICE_FEE = 4.5;

type BookingRow = {
  ref: string;
  studio_id: string;
  date: string;
  start_hour: number;
  duration: number;
  inge_son: number;
  total: number;
  access_code: string;
  status: string;
  created_at: number;
};

export function mapBooking(r: BookingRow) {
  return {
    ref: r.ref,
    studioId: r.studio_id,
    date: r.date,
    startHour: r.start_hour,
    duration: r.duration,
    ingeSon: !!r.inge_son,
    total: r.total,
    accessCode: r.access_code,
    status: r.status,
    createdAt: r.created_at,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ bookings: [] });
  const rows = getDb()
    .prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as BookingRow[];
  return NextResponse.json({ bookings: rows.map(mapBooking) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const studioId = String(body.studioId ?? "");
  const date = String(body.date ?? "");
  const startHour = Number(body.startHour);
  const duration = Number(body.duration);
  const ingeSon = !!body.ingeSon;

  const db = getDb();
  const studio = db.prepare("SELECT price_per_hour FROM studios WHERE id = ?").get(studioId) as
    | { price_per_hour: number }
    | undefined;
  if (!studio) return NextResponse.json({ error: "Studio inconnu." }, { status: 400 });
  if (!date || !Number.isFinite(startHour) || !Number.isFinite(duration) || duration < 1)
    return NextResponse.json({ error: "Créneau invalide." }, { status: 400 });

  const total = studio.price_per_hour * duration + (ingeSon ? INGE_RATE * duration : 0) + SERVICE_FEE;
  const ref = "SB-" + String(randomInt(10000, 99999));
  const accessCode = String(randomInt(1000, 9999));
  const now = Date.now();

  db.prepare(
    `INSERT INTO bookings (ref, user_id, studio_id, date, start_hour, duration, inge_son, total, access_code, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`
  ).run(ref, user.id, studioId, date, startHour, duration, ingeSon ? 1 : 0, total, accessCode, now);

  const row = db.prepare("SELECT * FROM bookings WHERE ref = ?").get(ref) as BookingRow;
  return NextResponse.json({ booking: mapBooking(row) });
}
