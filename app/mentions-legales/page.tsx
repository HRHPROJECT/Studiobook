import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsPage() {
  return (
    <LegalLayout title="Mentions légales">
      <h2>Éditeur</h2>
      <p>StudioBook — plateforme de réservation de studios créatifs. Projet réalisé dans un cadre pédagogique (RNCP39602).</p>
      <h2>Hébergement</h2>
      <p>Application hébergée sur une infrastructure cloud (Render) avec base de données Turso. Les coordonnées de l&apos;hébergeur sont disponibles sur demande.</p>
      <h2>Propriété intellectuelle</h2>
      <p>La marque, le logo et l&apos;interface de StudioBook sont protégés. Les contenus des annonces appartiennent à leurs hôtes respectifs.</p>
      <h2>Contact</h2>
      <p>Pour toute question, utilise la page Aide et support.</p>
      <p className="mt-6 text-sm text-muted">Document de démonstration, à compléter avant une mise en production réelle.</p>
    </LegalLayout>
  );
}
