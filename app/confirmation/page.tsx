"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarPlus } from "lucide-react";
import { getStudio } from "@/lib/studios";
import { euro, hourLabel, formatDateISO } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { Button, LinkButton } from "@/components/ui";

export default function ConfirmationPage() {
  const router = useRouter();
  const { bookings, ready } = useBooking();
  const booking = bookings[0];

  useEffect(() => {
    if (ready && !booking) router.replace("/");
  }, [ready, booking, router]);

  if (!booking) return null;
  const studio = getStudio(booking.studioId);
  if (!studio) return null;

  return (
    <div className="px-6 pb-12 pt-14 text-center">
      <div className="mx-auto flex h-[88px] w-[88px] animate-pop items-center justify-center rounded-full bg-accent text-brand">
        <Check size={48} strokeWidth={3} />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">Réservation confirmée !</h1>
      <p className="mt-1.5 text-[15px] text-muted">Un e-mail de confirmation t&apos;a été envoyé.</p>

      <div className="mt-6 rounded-2xl border border-line bg-white p-[18px] text-left">
        <p className="font-bold text-ink">{studio.name} · {studio.district}</p>
        <p className="mt-3 text-sm text-muted">
          📅&nbsp; {formatDateISO(booking.date)} · {hourLabel(booking.startHour)}–{hourLabel(booking.startHour + booking.duration)}
        </p>
        <p className="mt-2 text-sm font-semibold text-gold-dark">
          🎫&nbsp; Référence · {booking.ref}
        </p>
        <p className="mt-2 text-sm text-muted">
          🔑&nbsp; Code d&apos;accès&nbsp;:&nbsp;
          <span className="font-mono font-bold tracking-widest text-ink">{booking.accessCode}</span>
          <span className="text-xs"> (aussi envoyé par SMS)</span>
        </p>
        <p className="mt-3 border-t border-line pt-3 text-sm">
          <span className="text-muted">Total payé&nbsp;: </span>
          <span className="font-bold text-ink">{euro(booking.total)}</span>
        </p>
      </div>

      <div className="mt-7 space-y-3">
        <LinkButton href={`/reservations/${booking.ref}`} className="w-full">
          Voir ma réservation
        </LinkButton>
        <Button variant="outline" className="w-full">
          <CalendarPlus size={18} /> Ajouter au calendrier
        </Button>
        <button onClick={() => router.push("/")} className="w-full pt-1 text-sm font-semibold text-muted">
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}
