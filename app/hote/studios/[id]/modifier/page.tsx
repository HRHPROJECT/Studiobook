"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarRange } from "lucide-react";
import HostShell from "@/components/host-shell";
import { Button } from "@/components/ui";
import { DISCIPLINES } from "@/lib/studios";

const input = "min-h-[50px] w-full rounded-2xl border border-greige bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-brand";

type Form = {
  name: string; discipline: string; city: string; district: string; address: string;
  pricePerHour: string; capacity: string; description: string; equipment: string; accessPMR: boolean; openWeekend: boolean;
};

export default function EditStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [f, setF] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/hote/studios/${id}`).then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d?.studio) { setError("Studio introuvable ou non autorisé."); return; }
      const s = d.studio;
      setF({
        name: s.name, discipline: s.discipline, city: s.city, district: s.district, address: s.address ?? "",
        pricePerHour: String(s.pricePerHour), capacity: String(s.capacity ?? 1), description: s.description,
        equipment: (s.equipment ?? []).join(", "), accessPMR: !!s.accessPMR, openWeekend: !!s.openWeekend,
      });
    });
  }, [id]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => p && ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f) return;
    setBusy(true); setError(null);
    const r = await fetch(`/api/hote/studios/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, pricePerHour: Number(f.pricePerHour), capacity: Number(f.capacity) || 1, equipment: f.equipment.split(",").map((s) => s.trim()).filter(Boolean) }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) router.push("/hote");
    else setError(d.error ?? "Enregistrement impossible.");
  };

  return (
    <HostShell title="Modifier le studio" backTo="/hote">
      {!f ? (
        <p className="p-8 text-center text-muted">{error ?? "Chargement…"}</p>
      ) : (
        <form onSubmit={submit} className="space-y-4 px-5 pt-5">
          {error && <div role="alert" className="flex items-center gap-2 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"><AlertCircle size={16} /> {error}</div>}

          <Link href={`/hote/studios/${id}/disponibilites`} className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5">
            <span className="flex items-center gap-3 font-semibold text-ink"><CalendarRange size={18} className="text-accent" /> Gérer les disponibilités</span>
            <span className="text-sm font-semibold text-gold-dark">Ouvrir</span>
          </Link>

          <L label="Nom" id="name"><input id="name" required value={f.name} onChange={set("name")} className={input} /></L>
          <L label="Discipline" id="discipline">
            <select id="discipline" value={f.discipline} onChange={set("discipline")} className={input}>
              {DISCIPLINES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Ville" id="city"><input id="city" required value={f.city} onChange={set("city")} className={input} /></L>
            <L label="Quartier" id="district"><input id="district" value={f.district} onChange={set("district")} className={input} /></L>
          </div>
          <L label="Adresse" id="address"><input id="address" value={f.address} onChange={set("address")} className={input} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Prix horaire (€)" id="price"><input id="price" inputMode="numeric" value={f.pricePerHour} onChange={set("pricePerHour")} className={input} /></L>
            <L label="Capacité" id="capacity"><input id="capacity" inputMode="numeric" value={f.capacity} onChange={set("capacity")} className={input} /></L>
          </div>
          <L label="Description" id="description"><textarea id="description" rows={4} value={f.description} onChange={set("description")} className={`${input} min-h-[110px] py-3`} /></L>
          <L label="Équipements (virgules)" id="equipment"><input id="equipment" value={f.equipment} onChange={set("equipment")} className={input} /></L>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm font-medium text-ink"><input type="checkbox" checked={f.accessPMR} onChange={set("accessPMR")} className="h-5 w-5 accent-[var(--color-brand)]" /> Accès PMR</label>
            <label className="flex items-center gap-3 text-sm font-medium text-ink"><input type="checkbox" checked={f.openWeekend} onChange={set("openWeekend")} className="h-5 w-5 accent-[var(--color-brand)]" /> Ouvert le week-end</label>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button>
          <div className="pb-4" />
        </form>
      )}
    </HostShell>
  );
}

function L({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>{children}</div>;
}
