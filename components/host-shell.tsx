"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { useBooking } from "@/lib/booking-context";

/** Enveloppe protégée pour l'espace hôte : redirige les non-hôtes, fournit l'en-tête navy. */
export default function HostShell({
  title,
  children,
  backTo,
}: {
  title: string;
  children: ReactNode;
  backTo?: string;
}) {
  const { user, ready } = useBooking();
  const router = useRouter();

  const isHost = !!user && (user.role === "host" || user.role === "both" || user.role === "admin");

  useEffect(() => {
    if (ready && !isHost) router.replace(user ? "/" : "/connexion");
  }, [ready, isHost, user, router]);

  if (!ready || !isHost) {
    return <div className="p-10 text-center text-muted" aria-busy="true">Chargement de l&apos;espace hôte…</div>;
  }

  return (
    <div className="min-h-screen bg-cream pb-10">
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-brand px-4 py-3 text-white">
        <button
          onClick={() => (backTo ? router.push(backTo) : router.back())}
          aria-label="Retour"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Store size={18} className="text-accent" />
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <Link href="/" className="ml-auto text-sm font-semibold text-accent">
          Voir le site
        </Link>
      </header>
      {children}
    </div>
  );
}
