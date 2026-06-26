"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import HostShell from "@/components/host-shell";
import { useBooking } from "@/lib/booking-context";

type Review = { studioId: string; studioName: string; author: string; rating: number; date: string; text: string };

export default function HostReviewsPage() {
  const { ready, user } = useBooking();
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/hote/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews ?? []));
  }, [ready, user]);

  const avg = reviews && reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  return (
    <HostShell title="Avis clients" backTo="/hote">
      <div className="px-5 pt-5">
        {reviews && reviews.length > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-brand p-4 text-white">
            <Star size={26} className="fill-accent text-accent" />
            <div>
              <p className="text-xl font-extrabold">{avg.toFixed(1).replace(".", ",")}</p>
              <p className="text-[13px] text-white/70">{reviews.length} avis reçus</p>
            </div>
          </div>
        )}
        {reviews && reviews.length === 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-8 text-center">
            <Star size={36} className="mx-auto text-brand-400" />
            <p className="mt-3 font-bold text-ink">Aucun avis pour l&apos;instant</p>
            <p className="mt-1 text-sm text-muted">Les clients pourront te noter après leur réservation.</p>
          </div>
        )}
        <div className="space-y-2.5">
          {reviews?.map((r, i) => (
            <div key={i} className="rounded-2xl border border-line bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">{r.author}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink"><Star size={13} className="fill-accent text-accent" /> {r.rating},0</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{r.studioName} · {r.date}</p>
              <p className="mt-2 text-sm text-ink">« {r.text} »</p>
            </div>
          ))}
        </div>
      </div>
    </HostShell>
  );
}
