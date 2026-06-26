"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Compass, CalendarDays, MessageSquare, User } from "lucide-react";
import clsx from "clsx";

/** Bottom navigation — 5 onglets, identique au prototype (Recherche / Explorer / Résas / Messages / Profil). */
const TABS = [
  { href: "/", label: "Recherche", icon: Search, match: (p: string) => p === "/" || p.startsWith("/studio") },
  { href: "/recherche", label: "Explorer", icon: Compass, match: (p: string) => p.startsWith("/recherche") || p.startsWith("/carte") },
  { href: "/reservations", label: "Résas", icon: CalendarDays, match: (p: string) => p.startsWith("/reservations") },
  { href: "/messages", label: "Messages", icon: MessageSquare, match: (p: string) => p.startsWith("/messages") },
  { href: "/profil", label: "Profil", icon: User, match: (p: string) => p.startsWith("/profil") || p.startsWith("/favoris") },
];

/** Routes that present their own full-screen chrome (detail / auth / funnel) hide the tab bar. */
const HIDE_ON = ["/connexion", "/recapitulatif", "/paiement", "/confirmation", "/studio", "/hote"];

export default function TabBar() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  if (/^\/messages\/.+/.test(pathname) || /^\/reservations\/.+/.test(pathname)) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 border-t border-line bg-white/95 backdrop-blur"
    >
      <ul className="flex">
        {TABS.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition",
                  // texte navy (contraste AA) ; l'or sert d'indicateur visuel
                  active ? "text-ink" : "text-muted hover:text-ink"
                )}
              >
                {active && <span aria-hidden className="absolute inset-x-5 top-0 h-[3px] rounded-b bg-accent" />}
                <Icon size={22} strokeWidth={active ? 2.4 : 1.9} className={active ? "text-gold-dark" : ""} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
