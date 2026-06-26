"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useBooking } from "@/lib/booking-context";
import { LinkButton } from "@/components/ui";
import { timeAgo } from "@/lib/format";

type Conv = { id: number; studioId: string; otherName: string; lastMessage: string; lastAt: number; unread: number };

export default function MessagesPage() {
  const { ready, user } = useBooking();
  const [convs, setConvs] = useState<Conv[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { setConvs([]); return; }
    fetch("/api/conversations").then((r) => r.json()).then((d) => setConvs(d.conversations ?? []));
  }, [ready, user]);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-ink">Messages</h1>

      {ready && !user && (
        <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
          <MessageSquare size={38} className="mx-auto text-brand-400" />
          <p className="mt-3 font-bold text-ink">Connecte-toi pour discuter</p>
          <p className="mt-1 text-sm text-muted">Échange avec les studios avant et après ta réservation.</p>
          <LinkButton href="/connexion" size="md" className="mt-4">Se connecter</LinkButton>
        </div>
      )}

      {user && convs && convs.length === 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
          <MessageSquare size={38} className="mx-auto text-brand-400" />
          <p className="mt-3 font-bold text-ink">Aucune conversation</p>
          <p className="mt-1 text-sm text-muted">Contacte un studio depuis sa fiche pour démarrer.</p>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {convs?.map((c) => (
          <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition hover:bg-surface">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-brand text-[17px] font-bold text-accent" style={{ height: 52, width: 52 }}>
              {c.otherName.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink">{c.otherName}</span>
              <span className="block truncate text-sm text-muted">{c.lastMessage}</span>
            </span>
            <span className="flex flex-col items-end gap-1.5">
              <span className="text-xs text-muted">{timeAgo(c.lastAt)}</span>
              {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-brand">{c.unread}</span>}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
