"use client";

import { useEffect, useState } from "react";
import HostShell from "@/components/host-shell";
import { Button } from "@/components/ui";
import { useBooking } from "@/lib/booking-context";

export default function HostProfilePage() {
  const { ready, user } = useBooking();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    fetch("/api/hote/profile").then((r) => r.json()).then((d) => { setDisplayName(d.displayName ?? ""); setBio(d.bio ?? ""); setEmail(d.email ?? ""); });
  }, [ready, user]);

  const input = "min-h-[52px] w-full rounded-2xl border border-greige bg-white px-4 text-[15px] text-ink outline-none focus:border-brand";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setSaved(false);
    const r = await fetch("/api/hote/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, bio }) });
    setBusy(false);
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <HostShell title="Profil établissement" backTo="/hote">
      <form onSubmit={save} className="space-y-4 px-5 pt-5">
        <div>
          <label htmlFor="dn" className="mb-1.5 block text-sm font-semibold text-ink">Nom de l&apos;établissement</label>
          <input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={input} placeholder="Studios Lumière" />
        </div>
        <div>
          <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold text-ink">Présentation</label>
          <textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} className={`${input} min-h-[130px] py-3`} placeholder="Présente ton établissement, ton expérience, tes valeurs…" />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink">E-mail de contact</span>
          <p className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-[15px] text-muted">{email}</p>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer"}</Button>
      </form>
    </HostShell>
  );
}
