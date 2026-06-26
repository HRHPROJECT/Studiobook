"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import HostShell from "@/components/host-shell";
import { useBooking } from "@/lib/booking-context";
import { timeAgo } from "@/lib/format";

type Conv = { id: number; otherName: string; lastMessage: string; lastAt: number; unread: number };

export default function HostMessagesPage() {
  const { ready, user } = useBooking();
  const [convs, setConvs] = useState<Conv[] | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/conversations").then((r) => r.json()).then((d) => setConvs(d.conversations ?? []));
  }, [ready, user]);

  return (
    <HostShell title="Messages" backTo="/hote">
      <div className="px-5 pt-5">
        {convs && convs.length === 0 && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-8 text-center">
            <MessageSquare size={36} className="mx-auto text-brand-400" />
            <p className="mt-3 font-bold text-ink">Aucun message</p>
            <p className="mt-1 text-sm text-muted">Les clients pourront te contacter depuis tes fiches studio.</p>
          </div>
        )}
        <div className="space-y-2.5">
          {convs?.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition hover:bg-surface">
              <span className="flex shrink-0 items-center justify-center rounded-full bg-brand text-[17px] font-bold text-accent" style={{ height: 52, width: 52 }}>
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
    </HostShell>
  );
}
