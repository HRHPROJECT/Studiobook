"use client";

import { useEffect, useState } from "react";
import { Wallet, CalendarClock, Building2 } from "lucide-react";
import HostShell from "@/components/host-shell";
import { useBooking } from "@/lib/booking-context";
import { euro } from "@/lib/format";

type Dash = { stats: { studioCount: number; upcomingCount: number; revenue: number; avgRating: number }; studios: { id: string; name: string; pricePerHour: number }[] };

export default function HostRevenusPage() {
  const { ready, user } = useBooking();
  const [d, setD] = useState<Dash | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/hote/dashboard").then((r) => r.json()).then(setD);
  }, [ready, user]);

  const platformFee = d ? Math.round(d.stats.revenue * 0.1 * 100) / 100 : 0; // commission plateforme indicative (10 %)
  const net = d ? Math.round((d.stats.revenue - platformFee) * 100) / 100 : 0;

  return (
    <HostShell title="Revenus" backTo="/hote">
      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-brand p-5 text-white">
          <p className="text-sm text-white/70">Revenu net estimé</p>
          <p className="mt-1 text-3xl font-extrabold text-accent">{euro(net)}</p>
          <p className="mt-2 text-xs text-white/50">
            Brut {euro(d?.stats.revenue ?? 0)} − commission StudioBook 10 % ({euro(platformFee)})
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card icon={<Wallet size={18} />} label="Revenu brut" value={d ? euro(d.stats.revenue) : "–"} />
          <Card icon={<CalendarClock size={18} />} label="Réservations à venir" value={d?.stats.upcomingCount ?? "–"} />
        </div>

        <h2 className="mt-7 text-lg font-bold text-ink">Mes studios</h2>
        <div className="mt-3 space-y-2.5">
          {d?.studios.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-line bg-white p-3.5">
              <span className="flex items-center gap-2 font-semibold text-ink"><Building2 size={16} className="text-accent" /> {s.name}</span>
              <span className="text-sm font-bold text-gold-dark">{euro(s.pricePerHour)}/h</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted">
          Architecture prête pour les versements via Stripe Connect (compte de paiement hôte) lorsque les clés sont configurées.
        </p>
      </div>
    </HostShell>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-accent">{icon}</span>
      <p className="mt-2 text-xl font-extrabold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
