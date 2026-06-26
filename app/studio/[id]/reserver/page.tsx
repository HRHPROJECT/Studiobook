"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { euro, hourLabel, formatDateISO, next14Days } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { Button } from "@/components/ui";
import clsx from "clsx";

const DISPLAY_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const DURATIONS = [1, 2, 3, 4];

export default function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { setDraft, user } = useBooking();

  const days = next14Days().slice(0, 8);
  const [studio, setStudio] = useState<{ id: string; name: string; pricePerHour: number } | null>(null);
  const [date, setDate] = useState(days[1].iso);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [duration, setDuration] = useState(1);
  const [slots, setSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/studios/${id}`).then((r) => (r.ok ? r.json() : null)).then((d) => d?.studio && setStudio({ id: d.studio.id, name: d.studio.name, pricePerHour: d.studio.pricePerHour }));
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/studios/${id}/availability?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const s: number[] = d.slots ?? [];
        setSlots(s);
        setStartHour((cur) => (cur != null && s.includes(cur) ? cur : null));
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, date]);

  if (!studio) return <div className="p-10 text-center text-muted" aria-busy="true">Chargement…</div>;

  const total = studio.pricePerHour * duration;
  // Vérifie que la durée tient dans des créneaux consécutifs disponibles
  const durationFits = startHour != null && Array.from({ length: duration }, (_, i) => startHour + i).every((h) => slots.includes(h));

  const proceed = () => {
    if (startHour === null || !durationFits) return;
    setDraft({ studioId: studio.id, studioName: studio.name, pricePerHour: studio.pricePerHour, date, startHour, duration, ingeSon: false });
    router.push(user ? "/recapitulatif" : "/connexion");
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-ink">Choisir un créneau</h1>
      </header>

      <div className="px-5 pt-4">
        <p className="text-sm font-semibold text-muted">{studio.name}</p>

        {/* Dates */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setDate(d.iso)}
              aria-pressed={date === d.iso}
              className={clsx(
                "flex h-[68px] w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border text-sm font-semibold transition",
                date === d.iso ? "border-brand bg-brand text-white" : "border-greige bg-white text-ink"
              )}
            >
              <span className={clsx("text-[11px] font-bold uppercase", date === d.iso ? "text-accent" : "text-muted")}>{d.dow.replace(".", "")}</span>
              <span className="text-lg">{d.dom}</span>
            </button>
          ))}
        </div>

        {/* Créneaux */}
        <h2 className="mb-3 mt-6 text-base font-bold text-ink">Créneaux disponibles</h2>
        {loading ? (
          <p className="text-sm text-muted" aria-busy="true">Chargement des disponibilités…</p>
        ) : slots.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-5 text-center text-sm text-muted">
            Aucun créneau disponible ce jour. Essaie une autre date.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {DISPLAY_HOURS.map((h) => {
              const available = slots.includes(h);
              const selected = startHour === h;
              return (
                <button
                  key={h}
                  disabled={!available}
                  onClick={() => setStartHour(h)}
                  aria-pressed={selected}
                  className={clsx(
                    "rounded-xl border py-3 text-sm font-semibold transition",
                    !available
                      ? "cursor-not-allowed border-transparent bg-[#edeae3] text-muted/50"
                      : selected
                        ? "border-brand bg-brand text-white"
                        : "border-greige bg-white text-ink hover:border-brand"
                  )}
                >
                  {hourLabel(h)}
                </button>
              );
            })}
          </div>
        )}

        {/* Durée */}
        <h2 className="mb-3 mt-6 text-base font-bold text-ink">Durée</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              aria-pressed={duration === d}
              className={clsx(
                "rounded-xl border py-3 text-sm font-semibold transition",
                duration === d ? "border-brand bg-brand text-white" : "border-greige bg-white text-ink hover:border-brand"
              )}
            >
              {d}h{d === 4 ? "+" : ""}
            </button>
          ))}
        </div>
        {startHour != null && !durationFits && (
          <p className="mt-2 text-sm text-error">Cette durée dépasse les créneaux disponibles. Réduis la durée ou choisis une autre heure.</p>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t border-line bg-white px-5 pb-6 pt-3">
        <p className="mb-2 text-center text-sm font-semibold text-muted" aria-live="polite">
          {startHour !== null && durationFits
            ? `${formatDateISO(date)} · ${hourLabel(startHour)}–${hourLabel(startHour + duration)} · ${euro(total)}`
            : "Sélectionne un créneau"}
        </p>
        <Button className="w-full" disabled={startHour === null || !durationFits} onClick={proceed}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
