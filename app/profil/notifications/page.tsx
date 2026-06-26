"use client";

import { useEffect, useState } from "react";
import ScreenHeader from "@/components/screen-header";
import { useBooking } from "@/lib/booking-context";
import clsx from "clsx";

type Prefs = { emailBookings: boolean; smsBookings: boolean; reminders: boolean };

export default function NotificationsPage() {
  const { user, ready } = useBooking();
  const [p, setP] = useState<Prefs | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/profile/notifications").then((r) => r.json()).then(setP);
  }, [ready, user]);

  const toggle = async (key: keyof Prefs) => {
    if (!p) return;
    const next = { ...p, [key]: !p[key] };
    setP(next);
    await fetch("/api/profile/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
  };

  const rows: { key: keyof Prefs; label: string; hint: string }[] = [
    { key: "emailBookings", label: "E-mails de réservation", hint: "Confirmations et annulations par e-mail." },
    { key: "smsBookings", label: "SMS de réservation", hint: "Code d'accès et rappels par SMS." },
    { key: "reminders", label: "Rappels", hint: "Un rappel avant chaque créneau." },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <ScreenHeader title="Notifications" backTo="/profil" />
      {ready && !user ? (
        <p className="p-8 text-center text-muted">Connecte-toi pour gérer tes notifications.</p>
      ) : (
        <div className="space-y-2.5 px-5 pt-5">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
              <span>
                <span className="block font-semibold text-ink">{r.label}</span>
                <span className="block text-[13px] text-muted">{r.hint}</span>
              </span>
              <button
                onClick={() => toggle(r.key)}
                role="switch"
                aria-checked={!!p?.[r.key]}
                aria-label={r.label}
                disabled={!p}
                className={clsx("relative h-6 w-11 shrink-0 rounded-full transition", p?.[r.key] ? "bg-brand" : "bg-greige")}
              >
                <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", p?.[r.key] ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
