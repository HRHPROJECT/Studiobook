"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MapPin, Train, ShieldCheck, Accessibility, Star, MessageCircle } from "lucide-react";
import { iconFor, disciplinesLabel, type Discipline } from "@/lib/studios";
import { euro } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { RatingStars, Badge, LinkButton, Button } from "@/components/ui";
import clsx from "clsx";

type Detail = {
  id: string; name: string; discipline: Discipline; disciplines: Discipline[]; district: string; distanceKm: number;
  pricePerHour: number; rating: number; reviewCount: number; verified: boolean; topHost: boolean;
  metro: string; address: string; description: string; accessPMR: boolean;
  equipment: string[]; reviews: { author: string; rating: number; date: string; text: string }[];
};

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { favorites, toggleFavorite, user } = useBooking();
  const [studio, setStudio] = useState<Detail | null>(null);
  const [missing, setMissing] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/studios/${id}`).then((r) => (r.ok ? r.json() : null)).then((d) => (d?.studio ? setStudio(d.studio) : setMissing(true)));
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!user) { setCanReview(false); return; }
    fetch(`/api/studios/${id}/reviews`).then((r) => r.json()).then((d) => setCanReview(!!d.canReview));
  }, [id, user]);

  if (missing) {
    return (
      <div className="p-10 text-center">
        <p className="font-bold text-ink">Studio introuvable</p>
        <button onClick={() => router.push("/recherche")} className="mt-3 text-sm font-semibold text-gold-dark">Explorer les studios</button>
      </div>
    );
  }
  if (!studio) return <div className="p-10 text-center text-muted" aria-busy="true">Chargement…</div>;

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
      <div className={`relative flex h-72 items-center justify-center gold-sheen ${"grad-" + studio.discipline}`}>
        <Ic className="h-16 w-16 text-accent/90" strokeWidth={1.4} aria-hidden />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button onClick={() => router.back()} aria-label="Retour" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur">
            <ArrowLeft size={20} />
          </button>
          <button onClick={() => (user ? toggleFavorite(studio.id) : router.push("/connexion"))} aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={fav}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur">
            <Heart size={18} className={fav ? "fill-accent text-accent" : ""} />
          </button>
        </div>
      </div>

      <div className="rounded-t-3xl bg-cream px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-ink">{studio.name}</h1>
          <span className="shrink-0 text-xl font-extrabold text-gold-dark">{euro(studio.pricePerHour)}<span className="text-sm font-semibold text-muted">/h</span></span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-muted">
          {studio.reviewCount > 0 ? <><RatingStars rating={studio.rating} /> · {studio.reviewCount} avis</> : <span>Nouveau</span>}
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

        <Section title="À propos du studio"><p className="text-sm leading-relaxed text-muted">{studio.description}</p></Section>

        {studio.equipment.length > 0 && (
          <Section title="Équipements">
            <div className="flex flex-wrap gap-2">
              {studio.equipment.map((e) => <span key={e} className="rounded-2xl bg-[#edeae3] px-3 py-1.5 text-[13px] font-medium text-ink">{e}</span>)}
            </div>
          </Section>
        )}

        <Section title="Localisation">
          <div className="space-y-1.5 text-sm text-ink">
            <p className="flex items-center gap-2"><MapPin size={16} className="text-accent" /> {studio.address || studio.district}</p>
            {studio.metro && <p className="flex items-center gap-2"><Train size={16} className="text-accent" /> {studio.metro}</p>}
          </div>
        </Section>

        <Section title={`Avis (${studio.reviewCount})`}>
          {canReview && <ReviewForm studioId={studio.id} onDone={() => { setCanReview(false); load(); }} />}
          {studio.reviews.length === 0 ? (
            <p className="text-sm text-muted">Pas encore d&apos;avis. Sois le premier après ta réservation.</p>
          ) : (
            <div className="space-y-3">
              {studio.reviews.map((r, i) => (
                <div key={i} className="rounded-2xl border border-line bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{r.author}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink"><Star size={13} className="fill-accent text-accent" /> {r.rating.toFixed(1).replace(".", ",")}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{r.date}</p>
                  <p className="mt-2 text-sm text-ink">« {r.text} »</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <p className="mt-6 text-xs text-muted">✓ Annulation gratuite jusqu&apos;à 24&nbsp;h avant le créneau · {disciplinesLabel(studio)}</p>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[440px] -translate-x-1/2 items-center justify-between gap-3 border-t border-line bg-white px-5 pb-6 pt-3">
        <div>
          <p className="text-lg font-extrabold text-ink">{euro(studio.pricePerHour)}<span className="text-sm font-semibold text-muted">/h</span></p>
          <p className="text-[11px] font-medium text-muted">Annulation gratuite 24h</p>
        </div>
        <LinkButton href={`/studio/${studio.id}/reserver`} size="md" className="flex-1">Voir les créneaux</LinkButton>
      </div>
    </div>
  );
}

function ReviewForm({ studioId, onDone }: { studioId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await fetch(`/api/studios/${studioId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, comment }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) onDone();
    else setError(d.error ?? "Envoi impossible.");
  };

  return (
    <form onSubmit={submit} className="mb-4 rounded-2xl border border-accent/40 bg-accent/5 p-4">
      <p className="text-sm font-bold text-ink">Laisse ton avis</p>
      <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} role="radio" aria-checked={rating === n} aria-label={`${n} étoile${n > 1 ? "s" : ""}`}>
            <Star size={26} className={clsx(n <= rating ? "fill-accent text-accent" : "text-greige")} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Partage ton expérience…"
        className="mt-3 min-h-[80px] w-full rounded-xl border border-greige bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
      <Button type="submit" size="md" className="mt-3 w-full" disabled={busy}>{busy ? "Envoi…" : "Publier mon avis"}</Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-6"><h2 className="mb-3 text-base font-bold text-ink">{title}</h2>{children}</section>;
}
