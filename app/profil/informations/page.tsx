"use client";

import { useEffect, useState } from "react";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui";
import { useBooking } from "@/lib/booking-context";

const ROLE_LABEL: Record<string, string> = { client: "Client", host: "Hôte", both: "Client et hôte", admin: "Administrateur" };

export default function InformationsPage() {
  const { user, ready } = useBooking();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) setName(user.name); }, [user]);

  const input = "min-h-[52px] w-full rounded-2xl border border-greige bg-white px-4 text-[15px] text-ink outline-none focus:border-brand";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setSaved(false);
    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
    setBusy(false);
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <div className="min-h-screen bg-cream">
      <ScreenHeader title="Mes informations" backTo="/profil" />
      {ready && !user ? (
        <p className="p-8 text-center text-muted">Connecte-toi pour voir tes informations.</p>
      ) : (
        <form onSubmit={save} className="space-y-4 px-5 pt-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">Prénom</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-ink">Téléphone</label>
            <input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" className={input} />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">E-mail</span>
            <p className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] text-muted">{user?.email}</p>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Type de compte</span>
            <p className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] text-muted">{ROLE_LABEL[user?.role ?? "client"]}</p>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer"}</Button>
        </form>
      )}
    </div>
  );
}
