"use client";

import { useEffect, useState } from "react";
import HostShell from "@/components/host-shell";
import { useBooking } from "@/lib/booking-context";
import { euro, hourLabel, formatDateISO } from "@/lib/format";

type Resa = { ref: string; studioName: string; clientName: string; date: string; startHour: number; duration: number; total: number; status: string };

export default function HostCalendarPage() {
  const { ready, user } = useBooking();
  const [list, setList] = useState<Resa[] | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/hote/reservations").then((r) => r.json()).then((d) => setList(d.reservations ?? []));
  }, [ready, user]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = (list ?? []).filter((b) => b.date >= todayISO && !b.status.startsWith("cancelled")).sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
  const byDate = upcoming.reduce<Record<string, Resa[]>>((acc, b) => { (acc[b.date] ??= []).push(b); return acc; }, {});

  return (
    <HostShell title="Calendrier" backTo="/hote">
      <div className="px-5 pt-5">
        {list && upcoming.length === 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-8 text-center">
            <p className="font-bold text-ink">Aucun créneau réservé à venir</p>
            <p className="mt-1 text-sm text-muted">Les réservations de tes studios apparaîtront ici, par date.</p>
          </div>
        )}
        <div className="space-y-5">
          {Object.entries(byDate).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gold-dark">{formatDateISO(date)}</h2>
              <div className="mt-2 space-y-2.5">
                {items.map((b) => (
                  <div key={b.ref} className="flex items-center justify-between rounded-2xl border border-line bg-white p-3.5">
                    <div>
                      <p className="font-bold text-ink">{hourLabel(b.startHour)}–{hourLabel(b.startHour + b.duration)} · {b.studioName}</p>
                      <p className="text-[13px] text-muted">{b.clientName} · réf {b.ref}</p>
                    </div>
                    <span className="text-sm font-bold text-gold-dark">{euro(b.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </HostShell>
  );
}
