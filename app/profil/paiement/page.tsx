"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import ScreenHeader from "@/components/screen-header";

export default function PaiementMethodsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <ScreenHeader title="Moyens de paiement" backTo="/profil" />
      <div className="px-5 pt-5">
        <div className="rounded-2xl border border-dashed border-greige bg-white p-8 text-center">
          <CreditCard size={36} className="mx-auto text-brand-400" />
          <p className="mt-3 font-bold text-ink">Aucune carte enregistrée</p>
          <p className="mt-1 text-sm text-muted">
            Tu saisis ta carte au moment du paiement. L&apos;enregistrement des cartes sera disponible via Stripe.
          </p>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-surface p-4 text-sm text-muted">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-success" />
          <p>
            Tes paiements sont traités par un prestataire certifié PCI-DSS. StudioBook ne stocke jamais ton numéro de carte.
          </p>
        </div>
      </div>
    </div>
  );
}
