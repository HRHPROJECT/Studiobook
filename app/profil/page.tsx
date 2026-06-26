"use client";

import { useRouter } from "next/navigation";
import { User, Heart, CreditCard, Bell, HelpCircle, ChevronRight, Store } from "lucide-react";
import { useBooking } from "@/lib/booking-context";
import { LinkButton } from "@/components/ui";

const MENU = [
  { label: "Mes informations", Icon: User, href: "/profil/informations" },
  { label: "Moyens de paiement", Icon: CreditCard, href: "/profil/paiement" },
  { label: "Mes favoris", Icon: Heart, href: "/favoris" },
  { label: "Notifications", Icon: Bell, href: "/profil/notifications" },
  { label: "Aide et support", Icon: HelpCircle, href: "/profil/aide" },
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

      {user && (user.role === "host" || user.role === "both" || user.role === "admin") && (
        <a href="/hote" className="mt-4 flex items-center justify-between rounded-2xl bg-brand px-4 py-3.5 text-white">
          <span className="flex items-center gap-3 font-bold">
            <Store size={19} className="text-accent" /> Espace hôte
          </span>
          <ChevronRight size={20} className="text-accent" />
        </a>
      )}

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

      <nav aria-label="Liens légaux" className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-center text-xs text-muted">
        <a href="/cgv" className="underline">CGV</a>
        <a href="/confidentialite" className="underline">Confidentialité</a>
        <a href="/mentions-legales" className="underline">Mentions légales</a>
        <a href="/accessibilite" className="underline">Accessibilité</a>
        <a href="/cookies" className="underline">Cookies</a>
      </nav>
      <p className="mt-3 text-center text-xs text-muted">StudioBook · V1 démo</p>
    </div>
  );
}
