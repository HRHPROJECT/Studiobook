import { NextResponse } from "next/server";
import { all } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ payments: [] });
  const rows = await all<{ ref: string; studio_name: string; amount: number; status: string; provider: string; created_at: number }>(
    `SELECT b.ref, s.name AS studio_name, p.amount, p.status, p.provider, p.created_at
     FROM payments p JOIN bookings b ON b.ref = p.booking_ref JOIN studios s ON s.id = b.studio_id
     WHERE b.user_id = ? ORDER BY p.created_at DESC`,
    [user.id]
  );
  return NextResponse.json({
    payments: rows.map((p) => ({ ref: p.ref, studioName: p.studio_name, amount: Number(p.amount), status: p.status, provider: p.provider, createdAt: Number(p.created_at) })),
  });
}
