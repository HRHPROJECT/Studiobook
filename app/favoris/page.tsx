"use client";

import { Heart } from "lucide-react";
import { STUDIOS } from "@/lib/studios";
import { useBooking } from "@/lib/booking-context";
import StudioCard from "@/components/studio-card";
import { LinkButton } from "@/components/ui";

export default function FavorisPage() {
  const { favorites, ready, user } = useBooking();
  const favStudios = STUDIOS.filter((s) => favorites.includes(s.id));

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-ink">Favoris</h1>

      {ready && !user && (
        <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
          <Heart size={40} className="mx-auto text-brand-400" />
          <p className="mt-3 font-bold text-ink">Connecte-toi pour enregistrer tes favoris</p>
          <p className="mt-1 text-sm text-muted">Tes studios préférés te suivent sur tous tes appareils.</p>
          <LinkButton href="/connexion" size="md" className="mt-4">Se connecter</LinkButton>
        </div>
      )}

      {ready && user && favStudios.length === 0 && (
        <div className="mt-8 rounded-2xl bg-surface p-8 text-center">
          <Heart size={40} className="mx-auto text-brand-400" />
          <p className="mt-3 font-semibold text-ink">Aucun favori</p>
          <p className="mt-1 text-sm text-muted">Touche le ♥ sur un studio pour le retrouver ici.</p>
          <LinkButton href="/" size="md" className="mt-4">Découvrir les studios</LinkButton>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {favStudios.map((s) => (
          <StudioCard key={s.id} studio={s} />
        ))}
      </div>
    </div>
  );
}
