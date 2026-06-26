"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { euro, hourLabel, formatDateISO } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";

/** Faux QR décoratif (12×12) déterministe à partir de la référence. */
function FakeQR({ seed }: { seed: string }) {
  const n = 12;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h >>> 16) % 100 < 48);
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-36 w-36" shapeRendering="crispEdges" role="img" aria-label="QR code de la réservation">
      <rect width={n} height={n} fill="#101827" />
      {cells.map((on, i) => on && (
        <rect key={i} x={i % n} y={Math.floor(i / n)} width="1" height="1" fill="#c9a35a" />
      ))}
    </svg>
  );
}

export default function ReservationDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const router = useRouter();
  const { bookings, ready, cancelBooking } = useBooking();
  const booking = bookings.find((b) => b.ref === ref);
  const [studio, setStudio] = useState<{ address: string; metro: string }>({ address: "", metro: "" });

  useEffect(() => {
    if (ready && !booking) router.replace("/reservations");
  }, [ready, booking, router]);

  useEffect(() => {
    if (!booking) return;
    fetch(`/api/studios/${booking.studioId}`).then((r) => (r.ok ? r.json() : null)).then((d) => d?.studio && setStudio({ address: d.studio.address, metro: d.studio.metro }));
  }, [booking]);

  if (!booking) return null;

  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.address || booking.studioName)}`;

  return (
    <div className="min-h-screen bg-brand pb-10 text-white">
      <header className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Ma réservation</h1>
      </header>

      {/* Ticket */}
      <div className="mx-6 mt-3 flex flex-col items-center rounded-[20px] bg-white px-6 py-7 text-center text-ink shadow-2xl shadow-black/30">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gold-dark">
          <span className="h-2 w-2 rounded-full bg-gold-dark" /> Confirmée
        </span>
        <h2 className="mt-3 text-2xl font-extrabold">{booking.studioName}</h2>
        <div className="mt-4 rounded-xl bg-brand p-3">
          <FakeQR seed={booking.ref} />
        </div>
        <p className="mt-4 text-[15px] font-bold tracking-wide">{booking.ref}</p>
        <p className="mt-3 text-sm text-muted">
          {formatDateISO(booking.date)} · {hourLabel(booking.startHour)}–{hourLabel(booking.startHour + booking.duration)}
        </p>
        <p className="text-sm text-muted">{studio.address}</p>
        <p className="mt-3 rounded-xl bg-surface px-4 py-2 text-sm">
          Code d&apos;accès&nbsp;: <span className="font-mono font-bold tracking-widest text-ink">{booking.accessCode}</span>
        </p>
        <p className="mt-3 text-sm font-bold text-ink">Total payé&nbsp;: {euro(booking.total)}</p>
      </div>

      {/* Actions */}
      <div className="mx-6 mt-6 space-y-3">
        <a
          href={maps}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-brand transition active:scale-[0.99]"
        >
          <Navigation size={18} /> Itinéraire vers le studio
        </a>
        <button
          onClick={() => {
            if (confirm("Annuler cette réservation ?")) {
              cancelBooking(booking.ref);
              router.replace("/reservations");
            }
          }}
          className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#5a2420] text-base font-semibold text-[#ec8079] transition active:scale-[0.99]"
        >
          Annuler la réservation
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/40">
        <MapPin size={13} /> {studio.metro}
      </p>
    </div>
  );
}
