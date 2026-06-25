import { NextResponse } from "next/server";
import { run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { ref } = await params;
  await run("DELETE FROM bookings WHERE ref = ? AND user_id = ?", [ref, user.id]);
  return NextResponse.json({ ok: true });
}
