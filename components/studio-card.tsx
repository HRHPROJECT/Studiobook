"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin } from "lucide-react";
import { useBooking } from "@/lib/booking-context";
import { gradFor, iconFor, disciplinesLabel, type Studio } from "@/lib/studios";
import { euro } from "@/lib/format";
import { RatingStars } from "./ui";
import clsx from "clsx";

export default function StudioCard({
  studio,
  variant = "full",
}: {
  studio: Studio;
  variant?: "full" | "compact";
}) {
  const router = useRouter();
  const { favorites, toggleFavorite, user } = useBooking();
  const fav = favorites.includes(studio.id);
  const Ic = iconFor(studio.discipline);

  return (
    <Link
      href={`/studio/${studio.id}`}
      className={clsx(
        "group relative block overflow-hidden rounded-2xl border border-line bg-white card-shadow transition hover:-translate-y-0.5",
        variant === "compact" ? "w-64 shrink-0" : "w-full"
      )}
    >
      {/* Image zone — navy + gold motif */}
      <div className={clsx("relative flex items-center justify-center gold-sheen", gradFor(studio.discipline), variant === "compact" ? "h-32" : "h-44")}>
        <Ic className="h-11 w-11 text-accent/90" strokeWidth={1.5} aria-hidden />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!user) { router.push("/connexion"); return; }
            toggleFavorite(studio.id);
          }}
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={fav}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:scale-110"
        >
          <Heart size={18} className={fav ? "fill-accent text-accent" : ""} />
        </button>

        {studio.availableToday && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" /> Disponible aujourd&apos;hui
          </span>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight text-ink">{studio.name}</h3>
          <span className="shrink-0 font-bold text-gold-dark">
            {euro(studio.pricePerHour)}<span className="text-sm font-semibold text-muted">/h</span>
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted">
          <MapPin size={13} /> {studio.district} · {studio.distanceKm} km · {disciplinesLabel(studio)}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <RatingStars rating={studio.rating} />
          <span className="text-muted">· {studio.reviewCount} avis</span>
        </div>
      </div>
    </Link>
  );
}
