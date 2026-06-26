import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>StudioBook attache de l&apos;importance à la protection de tes données personnelles, conformément au RGPD.</p>
      <h2>Données collectées</h2>
      <ul>
        <li>Compte : prénom, e-mail, rôle (client / hôte), mot de passe haché.</li>
        <li>Réservations : studio, date, horaire, montant.</li>
        <li>Paiements : statut et référence de transaction (les données carte sont traitées par le prestataire de paiement, jamais stockées par StudioBook).</li>
        <li>Messages échangés entre clients et hôtes.</li>
        <li>Préférences de notification.</li>
      </ul>
      <h2>Finalités</h2>
      <p>Ces données servent uniquement à fournir le service : authentification, réservation, mise en relation, et envoi de confirmations.</p>
      <h2>Tes droits</h2>
      <p>Tu peux demander l&apos;accès, la rectification ou la suppression de tes données via la page Aide.</p>
      <h2>Cookies</h2>
      <p>StudioBook utilise un cookie de session strictement nécessaire à la connexion. Aucun cookie publicitaire n&apos;est utilisé.</p>
      <p className="mt-6 text-sm text-muted">Document de démonstration, à compléter avant une mise en production réelle.</p>
    </LegalLayout>
  );
}
