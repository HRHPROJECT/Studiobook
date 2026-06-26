import { all } from "./db";

const ACTIVE_STATUSES = "('pending_payment','confirmed')";

/**
 * Renvoie les heures de début disponibles pour un studio à une date donnée.
 * Tient compte : des règles de disponibilité (par jour de semaine), des exceptions
 * (date bloquée / horaires custom), des réservations déjà prises, et des heures passées.
 */
export async function getAvailableSlots(studioId: string, dateISO: string): Promise<number[]> {
  const todayISO = new Date().toISOString().slice(0, 10);
  if (dateISO < todayISO) return []; // pas de réservation dans le passé

  const day = new Date(dateISO + "T00:00:00").getDay(); // 0=dim … 6=sam (cohérent avec le seed)

  // Exceptions du jour
  const ex = (
    await all<{ blocked: number; custom_start: number | null; custom_end: number | null }>(
      "SELECT blocked, custom_start, custom_end FROM studio_availability_exceptions WHERE studio_id = ? AND date = ?",
      [studioId, dateISO]
    )
  )[0];

  let ranges: [number, number][] = [];
  if (ex && Number(ex.blocked) === 1 && ex.custom_start == null) return [];
  if (ex && ex.custom_start != null && ex.custom_end != null) {
    ranges = [[Number(ex.custom_start), Number(ex.custom_end)]];
  } else {
    const rules = await all<{ start_hour: number; end_hour: number }>(
      "SELECT start_hour, end_hour FROM studio_availability_rules WHERE studio_id = ? AND weekday = ? AND active = 1",
      [studioId, day]
    );
    ranges = rules.map((r) => [Number(r.start_hour), Number(r.end_hour)]);
  }
  if (!ranges.length) return [];

  const candidates = new Set<number>();
  for (const [s, e] of ranges) for (let h = s; h < e; h++) candidates.add(h);

  // Retire les heures déjà réservées (en tenant compte de la durée)
  const booked = await all<{ start_hour: number; duration: number }>(
    `SELECT start_hour, duration FROM bookings WHERE studio_id = ? AND date = ? AND status IN ${ACTIVE_STATUSES}`,
    [studioId, dateISO]
  );
  for (const b of booked) {
    const start = Number(b.start_hour);
    for (let h = start; h < start + Number(b.duration); h++) candidates.delete(h);
  }

  let result = [...candidates].sort((a, b) => a - b);
  if (dateISO === todayISO) {
    const nowH = new Date().getHours();
    result = result.filter((h) => h > nowH);
  }
  return result;
}

/** Vérifie que TOUTES les heures [start, start+duration) sont disponibles. */
export async function isSlotFree(studioId: string, dateISO: string, start: number, duration: number): Promise<boolean> {
  const slots = new Set(await getAvailableSlots(studioId, dateISO));
  for (let h = start; h < start + duration; h++) if (!slots.has(h)) return false;
  return true;
}

/** Suggestions si le créneau demandé n'est plus libre. */
export async function suggestAlternatives(studioId: string, dateISO: string, duration: number) {
  const sameDay = await getAvailableSlots(studioId, dateISO);
  const fitsToday = sameDay.filter((h) => sameDay.includes(h + duration - 1) || duration === 1);

  // Prochaine date avec au moins un créneau (dans les 14 jours)
  let nextDate: string | null = null;
  let nextSlots: number[] = [];
  const base = new Date(dateISO + "T00:00:00");
  for (let i = 1; i <= 14 && !nextDate; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const s = await getAvailableSlots(studioId, iso);
    if (s.length) { nextDate = iso; nextSlots = s; }
  }
  return { sameDayHour: fitsToday[0] ?? null, nextDate, nextDateHour: nextSlots[0] ?? null };
}
