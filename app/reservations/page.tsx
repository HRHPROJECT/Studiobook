"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { getStudio, iconFor } from "@/lib/studios";
import { hourLabel, formatDateISO } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { LinkButton } from "@/components/ui";
import clsx from "clsx";

export default function ReservationsPage() {
  const { bookings, ready } = useBooking();
  const [tab, setTab] = useState<"avenir" | "passees">("avenir");

  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= todayISO);
  const past = bookings.filter((b) => b.date < todayISO);
  const list = tab === "avenir" ? upcoming : past;

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-ink">Mes réservations</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-2xl bg-[#ece9e2] p-1">
        {([["avenir", "À venir"], ["passees", "Passées"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex-1 rounded-xl py-2 text-sm font-bold transition",
              tab === id ? "bg-white text-ink shadow-sm" : "text-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {ready && list.length === 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
          <CalendarDays size={40} className="mx-auto text-brand-400" />
          <p className="mt-3 font-bold text-ink">
            {tab === "avenir" ? "Aucune réservation à venir" : "Aucune réservation passée"}
          </p>
          <p className="mt-1 text-sm text-muted">Trouve un studio et réserve ton premier créneau.</p>
          <LinkButton href="/" size="md" className="mt-4">Explorer les studios</LinkButton>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {list.map((b) => {
          const studio = getStudio(b.studioId);
          if (!studio) return null;
          const Ic = iconFor(studio.discipline);
          return (
            <Link
              key={b.ref}
              href={`/reservations/${b.ref}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3 card-shadow transition hover:-translate-y-0.5"
            >
              <div className={clsx("flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-xl gold-sheen", "grad-" + studio.discipline)}>
                <Ic className="h-6 w-6 text-accent" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{studio.name}</p>
                <p className="text-[13px] text-muted">
                  {formatDateISO(b.date)} · {hourLabel(b.startHour)}–{hourLabel(b.startHour + b.duration)}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-dark" /> {tab === "avenir" ? "Confirmée" : "Terminée"}
                </p>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
