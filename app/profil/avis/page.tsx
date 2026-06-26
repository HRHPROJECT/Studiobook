"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import ScreenHeader from "@/components/screen-header";
import { useBooking } from "@/lib/booking-context";

type Review = { studioId: string; studioName: string; rating: number; date: string; text: string };

export default function MesAvisPage() {
  const { ready, user } = useBooking();
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { setReviews([]); return; }
    fetch("/api/profile/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews ?? []));
  }, [ready, user]);

  return (
    <div className="min-h-screen bg-cream">
      <ScreenHeader title="Avis et évaluations" backTo="/profil" />
      <div className="px-5 pt-5">
        {reviews && reviews.length === 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-8 text-center">
            <Star size={36} className="mx-auto text-brand-400" />
            <p className="mt-3 font-bold text-ink">Aucun avis pour l&apos;instant</p>
            <p className="mt-1 text-sm text-muted">Tu pourras noter un studio après une réservation terminée.</p>
          </div>
        )}
        <div className="space-y-2.5">
          {reviews?.map((r, i) => (
            <Link key={i} href={`/studio/${r.studioId}`} className="block rounded-2xl border border-line bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">{r.studioName}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  <Star size={13} className="fill-accent text-accent" /> {r.rating},0
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{r.date}</p>
              <p className="mt-2 text-sm text-ink">« {r.text} »</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
