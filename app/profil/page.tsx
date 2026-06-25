"use client";

import { useRouter } from "next/navigation";
import { User, Heart, CreditCard, Bell, HelpCircle, ChevronRight } from "lucide-react";
import { useBooking } from "@/lib/booking-context";
import { LinkButton } from "@/components/ui";

const MENU = [
  { label: "Mes informations", Icon: User, href: "/profil" },
  { label: "Moyens de paiement", Icon: CreditCard, href: "/profil" },
  { label: "Mes favoris", Icon: Heart, href: "/favoris" },
  { label: "Notifications", Icon: Bell, href: "/profil" },
  { label: "Aide et support", Icon: HelpCircle, href: "/profil" },
];

export default function ProfilPage() {
  const router = useRouter();
  const { user, signOut } = useBooking();

  return (
    <div className="px-5 pt-6">
      <h1 className="sr-only">Profil</h1>

      {/* En-tête profil navy */}
      <div className="flex items-center gap-4 rounded-[18px] bg-brand p-[18px] text-white">
        <div className="flex h-15 w-15 items-center justify-center rounded-full bg-accent text-[22px] font-extrabold text-brand" style={{ height: 60, width: 60 }}>
          {user ? user.name.charAt(0).toUpperCase() : <User size={26} />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{user ? user.name : "Invité·e"}</p>
          <p className="truncate text-[13px] text-white/70">
            {user ? `${user.email} · Membre depuis 2025` : "Connecte-toi pour réserver"}
          </p>
        </div>
      </div>

      {!user && <LinkButton href="/connexion" className="mt-4 w-full">Se connecter / Créer un compte</LinkButton>}

      {/* Menu */}
      <div className="mt-5 space-y-2.5">
        {MENU.map(({ label, Icon, href }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5 text-left transition hover:bg-surface"
          >
            <span className="flex items-center gap-3 text-[15px] font-semibold text-ink">
              <Icon size={19} className="text-accent" /> {label}
            </span>
            <ChevronRight size={20} className="text-muted" />
          </button>
        ))}
      </div>

      {user && (
        <button onClick={signOut} className="mt-6 w-full text-center text-[15px] font-semibold text-error">
          Se déconnecter
        </button>
      )}

      <p className="mt-6 text-center text-xs text-muted">StudioBook · V1 démo</p>
    </div>
  );
}
