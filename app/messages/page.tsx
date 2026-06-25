"use client";

import Link from "next/link";
import { CONVERSATIONS } from "@/lib/messages";

export default function MessagesPage() {
  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-ink">Messages</h1>

      <div className="mt-4 space-y-2.5">
        {CONVERSATIONS.map((c) => (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 transition hover:bg-surface"
          >
            <span className="flex shrink-0 items-center justify-center rounded-full bg-brand text-[17px] font-bold text-accent" style={{ height: 52, width: 52 }}>
              {c.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink">{c.name}</span>
              <span className="block truncate text-sm text-muted">{c.preview}</span>
            </span>
            <span className="flex flex-col items-end gap-1.5">
              <span className="text-xs text-muted">{c.time}</span>
              {c.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-brand">
                  {c.unread}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
