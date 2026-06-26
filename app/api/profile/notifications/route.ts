import { NextResponse } from "next/server";
import { get, run } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  await run("INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)", [user.id]);
  const p = await get<{ email_bookings: number; sms_bookings: number; reminders: number }>(
    "SELECT email_bookings, sms_bookings, reminders FROM notification_preferences WHERE user_id = ?",
    [user.id]
  );
  return NextResponse.json({
    emailBookings: !!p?.email_bookings, smsBookings: !!p?.sms_bookings, reminders: !!p?.reminders,
  });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  await run("INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)", [user.id]);
  await run(
    "UPDATE notification_preferences SET email_bookings = ?, sms_bookings = ?, reminders = ? WHERE user_id = ?",
    [b.emailBookings ? 1 : 0, b.smsBookings ? 1 : 0, b.reminders ? 1 : 0, user.id]
  );
  return NextResponse.json({ ok: true });
}
