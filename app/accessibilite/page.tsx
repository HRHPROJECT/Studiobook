import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";

export const metadata: Metadata = { title: "Déclaration d'accessibilité" };

export default function AccessibilitePage() {
  return (
    <LegalLayout title="Déclaration d'accessibilité">
      <p>StudioBook s&apos;engage à rendre son service accessible au plus grand nombre, conformément au RGAA.</p>
      <h2>Mesures mises en place</h2>
      <ul>
        <li>Structure sémantique (un seul titre principal par page, hiérarchie de titres).</li>
        <li>Navigation au clavier et focus visible.</li>
        <li>Libellés de formulaire associés et messages d&apos;erreur explicites.</li>
        <li>Contrastes de texte conformes au niveau AA.</li>
        <li>Respect de la préférence « animations réduites ».</li>
        <li>États (interrupteurs, favoris) annoncés aux lecteurs d&apos;écran.</li>
      </ul>
      <h2>Objectif</h2>
      <p>Nous visons une conformité RGAA progressive. Certaines fonctionnalités restent en amélioration continue.</p>
      <h2>Retour</h2>
      <p>Signale tout problème d&apos;accessibilité via la page Aide et support : nous traiterons ta demande.</p>
    </LegalLayout>
  );
}
