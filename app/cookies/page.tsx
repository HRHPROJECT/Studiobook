import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";

export const metadata: Metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <LegalLayout title="Gestion des cookies">
      <p>StudioBook limite l&apos;usage des cookies au strict nécessaire.</p>
      <h2>Cookies utilisés</h2>
      <ul>
        <li><strong>Cookie de session</strong> (`sb_session`) : strictement nécessaire pour te maintenir connecté. Il ne sert pas au suivi publicitaire.</li>
      </ul>
      <h2>Cookies non utilisés</h2>
      <p>Aucun cookie publicitaire ni traceur tiers n&apos;est déposé à ce jour. Si des outils de mesure d&apos;audience étaient ajoutés, un consentement te serait demandé.</p>
      <p className="mt-6 text-sm text-muted">Document de démonstration, à compléter avant une mise en production réelle.</p>
    </LegalLayout>
  );
}
