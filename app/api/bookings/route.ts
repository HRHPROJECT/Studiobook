import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { all, get, run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { isSlotFree, suggestAlternatives } from "@/lib/server/booking";

const INGE_RATE = 15;
const SERVICE_FEE = 4.5;

type BookingRow = {
  ref: string;
  studio_id: string;
  studio_name: string;
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
    studioName: r.studio_name,
    date: r.date,
    startHour: Number(r.start_hour),
    duration: Number(r.duration),
    ingeSon: !!r.inge_son,
    total: Number(r.total),
    accessCode: r.access_code,
    status: r.status,
    createdAt: Number(r.created_at),
  };
}

const SELECT_BOOKING = `SELECT b.ref, b.studio_id, s.name AS studio_name, b.date, b.start_hour, b.duration,
  b.inge_son, b.total, b.access_code, b.status, b.created_at
  FROM bookings b JOIN studios s ON s.id = b.studio_id`;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ bookings: [] });
  const rows = await all<BookingRow>(`${SELECT_BOOKING} WHERE b.user_id = ? ORDER BY b.created_at DESC`, [user.id]);
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

  const studio = await get<{ price_per_hour: number }>("SELECT price_per_hour FROM studios WHERE id = ?", [studioId]);
  if (!studio) return NextResponse.json({ error: "Studio inconnu." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(startHour) || !Number.isInteger(duration) || duration < 1 || duration > 8)
    return NextResponse.json({ error: "Créneau invalide." }, { status: 400 });

  // Prévention de double réservation (vérification serveur, jamais seulement côté client)
  if (!(await isSlotFree(studioId, date, startHour, duration))) {
    const alternatives = await suggestAlternatives(studioId, date, duration);
    return NextResponse.json(
      { error: "Ce créneau n'est plus disponible.", alternatives },
      { status: 409 }
    );
  }

  const total = Number(studio.price_per_hour) * duration + (ingeSon ? INGE_RATE * duration : 0) + SERVICE_FEE;
  const ref = "SB-" + String(randomInt(10000, 99999));
  const accessCode = String(randomInt(1000, 9999));
  const now = Date.now();

  await run(
    `INSERT INTO bookings (ref, user_id, studio_id, date, start_hour, duration, inge_son, total, access_code, status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?, 'confirmed', ?, ?)`,
    [ref, user.id, studioId, date, startHour, duration, ingeSon ? 1 : 0, total, accessCode, now, now]
  );
  // Trace de paiement (mode démo ; remplacé par Stripe quand les clés sont présentes)
  await run(
    "INSERT INTO payments (booking_ref, provider, provider_ref, amount, currency, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
    [ref, process.env.STRIPE_SECRET_KEY ? "stripe" : "demo", null, total, "eur", "succeeded", now, now]
  );

  const row = await get<BookingRow>(`${SELECT_BOOKING} WHERE b.ref = ?`, [ref]);
  return NextResponse.json({ booking: mapBooking(row!) });
}
