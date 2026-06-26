"use client";

import { useEffect, useState } from "react";
import HostShell from "@/components/host-shell";
import { useBooking } from "@/lib/booking-context";
import { euro, hourLabel, formatDateISO } from "@/lib/format";
import clsx from "clsx";

type Resa = { ref: string; studioName: string; clientName: string; date: string; startHour: number; duration: number; total: number; status: string };

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmée", completed: "Terminée", pending_payment: "En attente",
  cancelled_by_client: "Annulée (client)", cancelled_by_host: "Annulée (hôte)", refunded: "Remboursée",
};

export default function HostReservationsPage() {
  const { ready, user } = useBooking();
  const [list, setList] = useState<Resa[] | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/hote/reservations").then((r) => r.json()).then((d) => setList(d.reservations ?? []));
  }, [ready, user]);

  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <HostShell title="Réservations" backTo="/hote">
      <div className="px-5 pt-5">
        {list && list.length === 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-8 text-center">
            <p className="font-bold text-ink">Aucune réservation</p>
            <p className="mt-1 text-sm text-muted">Tes créneaux réservés apparaîtront ici.</p>
          </div>
        )}
        <div className="space-y-2.5">
          {list?.map((b) => {
            const past = b.date < todayISO;
            return (
              <div key={b.ref} className="rounded-2xl border border-line bg-white p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-ink">{b.studioName}</p>
                  <span className="shrink-0 text-sm font-bold text-gold-dark">{euro(b.total)}</span>
                </div>
                <p className="text-[13px] text-muted">
                  {formatDateISO(b.date)} · {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.duration)} · {b.clientName}
                </p>
                <span className={clsx("mt-1 inline-block text-xs font-bold", past ? "text-muted" : "text-gold-dark")}>
                  {STATUS_LABEL[b.status] ?? b.status} · réf {b.ref}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </HostShell>
  );
}
