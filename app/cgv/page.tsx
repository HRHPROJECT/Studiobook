import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CgvPage() {
  return (
    <LegalLayout title="Conditions générales de vente">
      <p>Les présentes conditions régissent l&apos;utilisation de StudioBook, place de marché de réservation de studios créatifs à l&apos;heure.</p>
      <h2>1. Objet</h2>
      <p>StudioBook met en relation des clients souhaitant réserver un studio et des hôtes proposant leurs espaces. StudioBook agit en tant qu&apos;intermédiaire technique.</p>
      <h2>2. Réservations</h2>
      <p>Une réservation est confirmée après paiement. Le créneau réservé devient indisponible pour les autres utilisateurs. Un code d&apos;accès est communiqué au client.</p>
      <h2>3. Prix et frais</h2>
      <p>Le prix affiché correspond au tarif horaire de l&apos;hôte multiplié par la durée, augmenté de frais de service StudioBook clairement indiqués avant le paiement.</p>
      <h2>4. Annulation</h2>
      <p>L&apos;annulation est gratuite jusqu&apos;à 24&nbsp;heures avant le créneau. Passé ce délai, des conditions spécifiques peuvent s&apos;appliquer.</p>
      <h2>5. Responsabilités</h2>
      <p>L&apos;hôte est responsable de l&apos;exactitude des informations de son annonce et de la mise à disposition du studio. Le client s&apos;engage à respecter les lieux.</p>
      <p className="mt-6 text-sm text-muted">Document de démonstration, à compléter avec un conseil juridique avant une mise en production réelle.</p>
    </LegalLayout>
  );
}
