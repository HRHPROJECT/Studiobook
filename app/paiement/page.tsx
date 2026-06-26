"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { euro, hourLabel, formatDateISO, SERVICE_FEE } from "@/lib/format";
import { useBooking } from "@/lib/booking-context";

export default function PaiementPage() {
  const router = useRouter();
  const { draft, createBooking, ready, user } = useBooking();
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    if (ready && !draft) router.replace("/");
    if (ready && draft && !user) router.replace("/connexion");
  }, [ready, draft, user, router]);

  if (!draft) return null;
  const total = draft.pricePerHour * draft.duration + SERVICE_FEE;

  const pay = (e?: React.FormEvent) => {
    e?.preventDefault();
    setProcessing(true);
    setDeclined(false);
    setTimeout(async () => {
      if (card.replace(/\s/g, "").endsWith("0000")) {
        setProcessing(false);
        setDeclined(true);
        return;
      }
      const booking = await createBooking();
      if (booking) router.push("/confirmation");
      else { setProcessing(false); router.push("/connexion"); }
    }, 1400);
  };

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };
  const fieldClass =
    "min-h-[54px] w-full rounded-2xl border border-navy-700 bg-navy-700 px-4 text-[15px] text-white outline-none transition placeholder:text-white/40 focus:border-accent";

  return (
    <div className="min-h-screen bg-brand pb-32 text-white">
      <header className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Paiement</h1>
      </header>

      <div className="px-5">
        {/* Carte preview */}
        <div className="flex h-[180px] flex-col justify-between rounded-[18px] border border-accent/60 bg-navy-700 p-6">
          <p className="text-[13px] font-semibold text-accent">StudioBook · Carte</p>
          <p className="font-mono text-[22px] tracking-wider text-white/95">
            {card || "•••• •••• •••• 4242"}
          </p>
          <div className="flex items-center justify-between text-[13px] font-semibold text-white/70">
            <span className="uppercase">{name || "Nom du titulaire"}</span>
            <span>{exp || "12 / 28"}</span>
          </div>
        </div>

        {declined && (
          <div role="alert" className="mt-4 flex gap-3 rounded-xl bg-error/20 p-4 text-sm text-[#ffb3a8]">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Paiement refusé</p>
              <p>Ta banque a décliné la transaction. Essaie une autre carte.</p>
            </div>
          </div>
        )}

        <form onSubmit={pay} className="mt-5 space-y-3">
          <input aria-label="Numéro de carte" inputMode="numeric" required value={card}
            onChange={(e) => setCard(fmtCard(e.target.value))} placeholder="4242 4242 4242 4242"
            className={`${fieldClass} font-mono`} />
          <div className="flex gap-3">
            <input aria-label="Expiration" inputMode="numeric" required value={exp}
              onChange={(e) => setExp(fmtExp(e.target.value))} placeholder="12 / 28"
              className={`${fieldClass} font-mono`} />
            <input aria-label="CVC" inputMode="numeric" required value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="CVC •••"
              className={`${fieldClass} font-mono`} />
          </div>
          <input aria-label="Nom sur la carte" required value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Nom sur la carte"
            className={fieldClass} />
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/50">
          <Lock size={13} className="text-accent" /> Paiement sécurisé · Stripe (PCI-DSS). Carte finissant par 0000 = refus (démo).
        </p>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 bg-brand px-5 pb-6 pt-3">
        <button
          onClick={() => pay()}
          disabled={processing}
          className="min-h-[54px] w-full rounded-2xl bg-accent text-base font-bold text-brand transition active:scale-[0.99] disabled:opacity-50"
        >
          {processing ? "Traitement…" : `Payer ${euro(total)}`}
        </button>
      </div>

      <p className="px-5 pt-3 text-center text-[11px] text-white/40">
        {draft.studioName} · {formatDateISO(draft.date)} · {hourLabel(draft.startHour)}–{hourLabel(draft.startHour + draft.duration)}
      </p>
    </div>
  );
}
