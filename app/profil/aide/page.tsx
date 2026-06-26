"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui";
import { useBooking } from "@/lib/booking-context";
import clsx from "clsx";

const FAQ = [
  { q: "Comment réserver un studio ?", a: "Choisis un studio, sélectionne un créneau disponible, connecte-toi puis paie. Tu reçois une confirmation et un code d'accès." },
  { q: "Puis-je annuler ?", a: "Oui, gratuitement jusqu'à 24 h avant le créneau, depuis Mes réservations." },
  { q: "Comment proposer mon studio ?", a: "Crée un compte hôte, puis ajoute ton studio depuis l'Espace hôte. Tu gères tes disponibilités et tes réservations." },
  { q: "Le paiement est-il sécurisé ?", a: "Oui, via un prestataire certifié PCI-DSS. Nous ne stockons jamais ton numéro de carte." },
];

export default function AidePage() {
  const { user } = useBooking();
  const [open, setOpen] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body, email: email || user?.email }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setSent(true); setSubject(""); setBody(""); }
    else setError(d.error ?? "Envoi impossible.");
  };

  const input = "min-h-[50px] w-full rounded-2xl border border-greige bg-white px-4 text-[15px] text-ink outline-none focus:border-brand";

  return (
    <div className="min-h-screen bg-cream">
      <ScreenHeader title="Aide et support" backTo="/profil" />
      <div className="px-5 pt-5">
        <h2 className="text-base font-bold text-ink">Questions fréquentes</h2>
        <div className="mt-3 space-y-2.5">
          {FAQ.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-semibold text-ink">
                {f.q}
                <ChevronDown size={18} className={clsx("shrink-0 text-muted transition", open === i && "rotate-180")} />
              </button>
              {open === i && <p className="px-4 pb-4 text-sm text-muted">{f.a}</p>}
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-base font-bold text-ink">Contacter le support</h2>
        {sent ? (
          <div className="mt-3 rounded-2xl border border-line bg-white p-6 text-center">
            <p className="font-bold text-ink">Message envoyé</p>
            <p className="mt-1 text-sm text-muted">Notre équipe te répondra par e-mail.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-3 pb-6">
            {error && <p role="alert" className="rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error">{error}</p>}
            {!user && (
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ton e-mail" className={input} />
            )}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet" className={input} />
            <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Comment pouvons-nous t'aider ?" className={`${input} min-h-[110px] py-3`} />
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Envoi…" : "Envoyer"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
