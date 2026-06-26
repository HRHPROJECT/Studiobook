import { get } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";

function pad(n: number) { return String(n).padStart(2, "0"); }
function icsDate(dateISO: string, hour: number) {
  return dateISO.replace(/-/g, "") + "T" + pad(hour) + "0000";
}

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("auth", { status: 401 });
  const { ref } = await params;

  const b = await get<{ studio_id: string; date: string; start_hour: number; duration: number; access_code: string }>(
    "SELECT studio_id, date, start_hour, duration, access_code FROM bookings WHERE ref = ? AND user_id = ?",
    [ref, user.id]
  );
  if (!b) return new Response("not found", { status: 404 });
  const s = await get<{ name: string; address: string }>("SELECT name, address FROM studios WHERE id = ?", [b.studio_id]);

  const start = icsDate(b.date, Number(b.start_hour));
  const end = icsDate(b.date, Number(b.start_hour) + Number(b.duration));
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudioBook//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${ref}@studiobook`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Réservation ${s?.name ?? "Studio"} (StudioBook)`,
    `LOCATION:${(s?.address ?? "").replace(/,/g, "\\,")}`,
    `DESCRIPTION:Réf ${ref} · Code d'accès ${b.access_code}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="studiobook-${ref}.ics"`,
    },
  });
}
