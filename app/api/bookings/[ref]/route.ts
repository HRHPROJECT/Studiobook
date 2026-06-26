import { NextResponse } from "next/server";
import { run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

// Annulation = changement de statut (conserve l'historique pour l'onglet « Annulations »).
export async function DELETE(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { ref } = await params;
  await run("UPDATE bookings SET status = 'cancelled_by_client', updated_at = ? WHERE ref = ? AND user_id = ?", [Date.now(), ref, user.id]);
  return NextResponse.json({ ok: true });
}
