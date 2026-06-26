"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CalendarClock, Wallet, Star, Plus, ChevronRight, CalendarDays, CalendarRange, MessageSquare, Store, Bell } from "lucide-react";
import HostShell from "@/components/host-shell";
import { useBooking } from "@/lib/booking-context";
import { euro, hourLabel, formatDateISO } from "@/lib/format";
import { labelFor, type Discipline } from "@/lib/studios";

type Dashboard = {
  studios: { id: string; name: string; discipline: Discipline; city: string; district: string; pricePerHour: number; rating: number; reviewCount: number; status: string }[];
  upcoming: { ref: string; studioName: string; date: string; startHour: number; duration: number; total: number; status: string }[];
  stats: { studioCount: number; upcomingCount: number; revenue: number; avgRating: number };
};

export default function HostDashboardPage() {
  const { ready, user } = useBooking();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/hote/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [ready, user]);

  return (
    <HostShell title="Espace hôte" backTo="/profil">
      <div className="px-5 pt-5">
        <p className="text-sm text-muted">Bonjour {user?.name ?? ""}, voici ton activité.</p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard icon={<Building2 size={18} />} label="Studios actifs" value={data?.stats.studioCount ?? "–"} />
          <StatCard icon={<CalendarClock size={18} />} label="Réservations à venir" value={data?.stats.upcomingCount ?? "–"} />
          <StatCard icon={<Wallet size={18} />} label="Revenus" value={data ? euro(data.stats.revenue) : "–"} />
          <StatCard icon={<Star size={18} />} label="Note moyenne" value={data && data.stats.avgRating ? data.stats.avgRating.toFixed(1).replace(".", ",") : "–"} />
        </div>

        {/* Action principale */}
        <Link href="/hote/studios/nouveau" className="mt-4 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand text-base font-bold text-accent">
          <Plus size={18} /> Ajouter un studio
        </Link>

        {/* Accès rapides */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <QuickLink href="/hote/reservations" icon={<CalendarDays size={18} />} label="Réservations" />
          <QuickLink href="/hote/calendrier" icon={<CalendarRange size={18} />} label="Calendrier" />
          <QuickLink href="/hote/messages" icon={<MessageSquare size={18} />} label="Messages" />
          <QuickLink href="/hote/revenus" icon={<Wallet size={18} />} label="Revenus" />
          <QuickLink href="/hote/avis" icon={<Star size={18} />} label="Avis clients" />
          <QuickLink href="/hote/profil" icon={<Store size={18} />} label="Établissement" />
          <QuickLink href="/profil/notifications" icon={<Bell size={18} />} label="Notifications" />
        </div>

        {/* Mes studios */}
        <h2 className="mt-7 text-lg font-bold text-ink">Mes studios</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Chargement…</p>
        ) : data && data.studios.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {data.studios.map((s) => (
              <Link key={s.id} href={`/hote/studios/${s.id}/modifier`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition hover:bg-surface">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{s.name}</p>
                  <p className="text-[13px] text-muted">{labelFor(s.discipline)} · {s.district} · {euro(s.pricePerHour)}/h</p>
                  <p className="mt-0.5 text-xs font-semibold text-gold-dark">★ {s.rating ? s.rating.toFixed(1).replace(".", ",") : "—"} · {s.reviewCount} avis · {s.status === "published" ? "En ligne" : s.status}</p>
                </div>
                <ChevronRight size={20} className="text-muted" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-line bg-white p-8 text-center">
            <Building2 size={36} className="mx-auto text-brand-400" />
            <p className="mt-3 font-bold text-ink">Aucun studio pour l&apos;instant</p>
            <p className="mt-1 text-sm text-muted">Crée ta première annonce pour recevoir des réservations.</p>
          </div>
        )}

        {/* Réservations à venir */}
        <h2 className="mt-7 text-lg font-bold text-ink">Prochaines réservations</h2>
        {data && data.upcoming.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {data.upcoming.map((b) => (
              <div key={b.ref} className="rounded-2xl border border-line bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink">{b.studioName}</p>
                  <span className="text-sm font-bold text-gold-dark">{euro(b.total)}</span>
                </div>
                <p className="text-[13px] text-muted">
                  {formatDateISO(b.date)} · {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.duration)} · réf {b.ref}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Aucune réservation à venir.</p>
        )}
      </div>
    </HostShell>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-white p-3 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-accent">{icon}</span>
      <span className="text-xs font-semibold text-ink">{label}</span>
    </Link>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-accent">{icon}</span>
      <p className="mt-2 text-xl font-extrabold text-ink">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
