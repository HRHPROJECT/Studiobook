"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, ChevronRight } from "lucide-react";
import ScreenHeader from "@/components/screen-header";
import { useBooking } from "@/lib/booking-context";
import { euro } from "@/lib/format";

type Payment = { ref: string; studioName: string; amount: number; status: string; provider: string; createdAt: number };

const STATUS: Record<string, string> = { succeeded: "Payé", refunded: "Remboursé", failed: "Échoué", pending: "En attente" };

export default function PaiementsPage() {
  const { ready, user } = useBooking();
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { setPayments([]); return; }
    fetch("/api/profile/payments").then((r) => r.json()).then((d) => setPayments(d.payments ?? []));
  }, [ready, user]);

  return (
    <div className="min-h-screen bg-cream">
      <ScreenHeader title="Paiements" backTo="/profil" />
      <div className="px-5 pt-5">
        <Link href="/profil/paiement" className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5">
          <span className="flex items-center gap-3 font-semibold text-ink"><CreditCard size={18} className="text-accent" /> Moyens de paiement</span>
          <ChevronRight size={20} className="text-muted" />
        </Link>

        <h2 className="mt-6 text-base font-bold text-ink">Historique</h2>
        {payments && payments.length === 0 && (
          <p className="mt-3 rounded-2xl border border-line bg-white p-6 text-center text-sm text-muted">Aucun paiement pour l&apos;instant.</p>
        )}
        <div className="mt-3 space-y-2.5">
          {payments?.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-line bg-white p-3.5">
              <div>
                <p className="font-semibold text-ink">{p.studioName}</p>
                <p className="text-[13px] text-muted">
                  {new Date(p.createdAt).toLocaleDateString("fr-FR")} · réf {p.ref} · {p.provider === "stripe" ? "Carte" : "Démo"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink">{euro(p.amount)}</p>
                <p className="text-[11px] font-semibold text-gold-dark">{STATUS[p.status] ?? p.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
