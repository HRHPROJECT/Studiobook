import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/server/booking";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ slots: [] });
  return NextResponse.json({ slots: await getAvailableSlots(id, date) });
}
