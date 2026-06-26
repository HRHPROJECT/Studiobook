import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

/** Éligibilité : avoir une réservation passée (terminée) sur ce studio, sans avis déjà laissé. */
async function eligibility(userId: number, studioId: string) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const past = await get<{ ref: string }>(
    "SELECT ref FROM bookings WHERE user_id = ? AND studio_id = ? AND date < ? AND status IN ('confirmed','completed') ORDER BY date DESC LIMIT 1",
    [userId, studioId, todayISO]
  );
  if (!past) return { ok: false as const };
  const already = await get("SELECT id FROM reviews WHERE studio_id = ? AND user_id = ?", [studioId, userId]);
  if (already) return { ok: false as const, already: true };
  return { ok: true as const, bookingRef: past.ref };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) return NextResponse.json({ canReview: false });
  const e = await eligibility(user.id, id);
  return NextResponse.json({ canReview: e.ok, already: "already" in e ? e.already : false });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;

  const e = await eligibility(user.id, id);
  if (!e.ok) return NextResponse.json({ error: "Tu ne peux pas encore laisser d'avis sur ce studio." }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const rating = Math.min(5, Math.max(1, Math.round(Number(b.rating))));
  const text = String(b.comment ?? "").trim().slice(0, 1000);
  if (!Number.isFinite(rating) || text.length < 3) return NextResponse.json({ error: "Note et commentaire requis." }, { status: 400 });

  const dateLabel = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  await run(
    "INSERT INTO reviews (studio_id, author, rating, date, text, user_id, booking_ref) VALUES (?,?,?,?,?,?,?)",
    [id, user.name, rating, dateLabel, text, user.id, e.bookingRef]
  );

  // Recalcule la note et le nombre d'avis du studio
  const agg = await get<{ n: number; avg: number }>("SELECT COUNT(*) AS n, AVG(rating) AS avg FROM reviews WHERE studio_id = ?", [id]);
  await run("UPDATE studios SET rating = ?, review_count = ? WHERE id = ?", [Math.round(Number(agg?.avg ?? rating) * 10) / 10, Number(agg?.n ?? 1), id]);

  return NextResponse.json({ ok: true });
}
