"use client";

import { use } from "react";
import { useRouter, notFound } from "next/navigation";
import { ArrowLeft, Heart, MapPin, Train, ShieldCheck, Accessibility, Star, MessageCircle } from "lucide-react";
import { getStudio, iconFor, disciplinesLabel } from "@/lib/studios";
import { euro } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { RatingStars, Badge, LinkButton } from "@/components/ui";

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const studio = getStudio(id);
  const { favorites, toggleFavorite, user } = useBooking();

  if (!studio) return notFound();
  const fav = favorites.includes(studio.id);
  const Ic = iconFor(studio.discipline);

  const contactHost = async () => {
    if (!user) { router.push("/connexion"); return; }
    const r = await fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studioId: studio.id }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.id) router.push(`/messages/${d.id}`);
  };

  return (
    <div className="pb-28">
      {/* Hero image */}
      <div className={`relative flex h-72 items-center justify-center gold-sheen ${"grad-" + studio.discipline}`}>
        <Ic className="h-16 w-16 text-accent/90" strokeWidth={1.4} aria-hidden />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button onClick={() => router.back()} aria-label="Retour" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => (user ? toggleFavorite(studio.id) : router.push("/connexion"))}
            aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={fav}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
          >
            <Heart size={18} className={fav ? "fill-accent text-accent" : ""} />
          </button>
        </div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-5 bg-accent" : "w-1.5 bg-white/40"}`} />
          ))}
        </div>
      </div>

      <div className="rounded-t-3xl bg-cream px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-ink">{studio.name}</h1>
          <span className="shrink-0 text-xl font-extrabold text-gold-dark">
            {euro(studio.pricePerHour)}<span className="text-sm font-semibold text-muted">/h</span>
          </span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-muted">
          <RatingStars rating={studio.rating} /> · {studio.reviewCount} avis
          <span className="text-line">|</span>
          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {studio.district} · {studio.distanceKm} km</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {studio.verified && <Badge tone="success"><ShieldCheck size={13} /> Vérifié</Badge>}
          {studio.topHost && <Badge tone="gold">Top hôte</Badge>}
          {studio.accessPMR && <Badge tone="brand"><Accessibility size={13} /> Accès PMR</Badge>}
        </div>

        <button onClick={contactHost} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-brand bg-transparent py-3 text-[15px] font-bold text-ink transition active:scale-[0.99]">
          <MessageCircle size={18} className="text-accent" /> Contacter le studio
        </button>

        <Section title="À propos du studio">
          <p className="text-sm leading-relaxed text-muted">{studio.description}</p>
        </Section>

        <Section title="Équipements">
          <div className="flex flex-wrap gap-2">
            {studio.equipment.map((e) => (
              <span key={e} className="rounded-2xl bg-[#edeae3] px-3 py-1.5 text-[13px] font-medium text-ink">{e}</span>
            ))}
          </div>
        </Section>

        <Section title="Localisation">
          <div className="space-y-1.5 text-sm text-ink">
            <p className="flex items-center gap-2"><MapPin size={16} className="text-accent" /> {studio.address}</p>
            <p className="flex items-center gap-2"><Train size={16} className="text-accent" /> {studio.metro}</p>
          </div>
        </Section>

        <Section title={`Avis (${studio.reviewCount})`}>
          <div className="space-y-3">
            {studio.reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-line bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{r.author}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                    <Star size={13} className="fill-accent text-accent" /> {r.rating.toFixed(1).replace(".", ",")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{r.date}</p>
                <p className="mt-2 text-sm text-ink">« {r.text} »</p>
              </div>
            ))}
          </div>
        </Section>

        <p className="mt-6 text-xs text-muted">
          ✓ Annulation gratuite jusqu&apos;à 24&nbsp;h avant le créneau · {disciplinesLabel(studio)}
        </p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[440px] -translate-x-1/2 items-center justify-between gap-3 border-t border-line bg-white px-5 pb-6 pt-3">
        <div>
          <p className="text-lg font-extrabold text-ink">{euro(studio.pricePerHour)}<span className="text-sm font-semibold text-muted">/h</span></p>
          <p className="text-[11px] font-medium text-muted">Annulation gratuite 24h</p>
        </div>
        <LinkButton href={`/studio/${studio.id}/reserver`} size="md" className="flex-1">
          Voir les créneaux
        </LinkButton>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-base font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
