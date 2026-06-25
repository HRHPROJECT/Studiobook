"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getStudio, iconFor } from "@/lib/studios";
import { euro, hourLabel, formatDateISO, SERVICE_FEE } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";
import { Button } from "@/components/ui";

export default function RecapitulatifPage() {
  const router = useRouter();
  const { draft, ready, user } = useBooking();

  useEffect(() => {
    if (ready && !draft) router.replace("/");
    if (ready && draft && !user) router.replace("/connexion");
  }, [ready, draft, user, router]);

  if (!draft) return null;
  const studio = getStudio(draft.studioId);
  if (!studio) return null;
  const Ic = iconFor(studio.discipline);

  const base = studio.pricePerHour * draft.duration;
  const total = base + SERVICE_FEE;

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-ink">Récapitulatif</h1>
      </header>

      <div className="px-5 pt-5">
        {/* Studio */}
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-3">
          <div className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl gold-sheen ${"grad-" + studio.discipline}`}>
            <Ic className="h-7 w-7 text-accent" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-ink">{studio.name}</p>
            <p className="text-sm text-muted">
              {formatDateISO(draft.date)} · {hourLabel(draft.startHour)}–{hourLabel(draft.startHour + draft.duration)}
            </p>
            <p className="text-[13px] text-muted">{studio.district} · {draft.duration} heure{draft.duration > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-4 rounded-2xl border border-line bg-white p-[18px]">
          <Row label={`Location · ${draft.duration} h`} value={euro(base)} />
          <Row label="Frais de service" value={euro(SERVICE_FEE)} />
          <div className="my-3 h-px bg-line" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-ink">Total</span>
            <span className="text-xl font-extrabold text-gold-dark">{euro(total)}</span>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-muted">
          <Check size={15} className="text-success" /> Annulation gratuite jusqu&apos;à 24&nbsp;h avant le créneau.
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 border-t border-line bg-white px-5 pb-6 pt-3">
        <Button className="w-full" onClick={() => router.push("/paiement")}>
          Procéder au paiement · {euro(total)}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[15px] text-muted">{label}</span>
      <span className="text-[15px] font-semibold text-ink">{value}</span>
    </div>
  );
}
