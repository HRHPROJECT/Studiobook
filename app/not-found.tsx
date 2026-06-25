import Link from "next/link";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-extrabold text-accent">404</p>
      <h1 className="mt-3 text-xl font-bold text-ink">Cette page n&apos;existe pas</h1>
      <p className="mt-1.5 text-sm text-muted">
        Le studio ou la page que tu cherches est introuvable.
      </p>
      <LinkButton href="/" className="mt-6">Retour à l&apos;accueil</LinkButton>
      <Link href="/recherche" className="mt-3 text-sm font-semibold text-gold-dark">
        Explorer les studios
      </Link>
    </div>
  );
}
