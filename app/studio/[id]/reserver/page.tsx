"use client";

import { use, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStudio } from "@/lib/studios";
import { euro, hourLabel, formatDateISO, next14Days } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { Button } from "@/components/ui";
import clsx from "clsx";

const HOURS = [9, 10, 11, 14, 15, 16, 17, 18, 19];
const DURATIONS = [1, 2, 3, 4];

export default function ReservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const studio = getStudio(id);
  const { setDraft, user } = useBooking();

  const days = next14Days().slice(0, 8);
  const [date, setDate] = useState(days[1].iso);
  const [startHour, setStartHour] = useState<number | null>(15);
  const [duration, setDuration] = useState(1);

  if (!studio) return notFound();

  const total = studio.pricePerHour * duration;

  const proceed = () => {
    if (startHour === null) return;
    setDraft({ studioId: studio.id, date, startHour, duration, ingeSon: false });
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
        <p className="text-sm font-semibold text-muted">{studio.name} · juin 2026</p>

        {/* Dates */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setDate(d.iso)}
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
        <div className="grid grid-cols-3 gap-2.5">
          {HOURS.map((h, i) => {
            const disabled = i === 2; // un créneau indisponible, comme le prototype
            const selected = startHour === h;
            return (
              <button
                key={h}
                disabled={disabled}
                onClick={() => setStartHour(h)}
                className={clsx(
                  "rounded-xl border py-3 text-sm font-semibold transition",
                  disabled
                    ? "cursor-not-allowed border-transparent bg-[#edeae3] text-muted/60"
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

        {/* Durée */}
        <h2 className="mb-3 mt-6 text-base font-bold text-ink">Durée</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={clsx(
                "rounded-xl border py-3 text-sm font-semibold transition",
                duration === d ? "border-brand bg-brand text-white" : "border-greige bg-white text-ink hover:border-brand"
              )}
            >
              {d}h{d === 4 ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t border-line bg-white px-5 pb-6 pt-3">
        <p className="mb-2 text-center text-sm font-semibold text-muted">
          {startHour !== null
            ? `${formatDateISO(date)} · ${hourLabel(startHour)}–${hourLabel(startHour + duration)} · ${euro(total)}`
            : "Sélectionne un créneau"}
        </p>
        <Button className="w-full" disabled={startHour === null} onClick={proceed}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
