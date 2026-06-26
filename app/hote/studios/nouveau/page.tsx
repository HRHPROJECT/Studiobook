"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import HostShell from "@/components/host-shell";
import { Button } from "@/components/ui";
import { DISCIPLINES } from "@/lib/studios";

const input = "min-h-[50px] w-full rounded-2xl border border-greige bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-brand";

export default function NewStudioPage() {
  const router = useRouter();
  const [f, setF] = useState({
    name: "", discipline: "musique", city: "", district: "", address: "",
    pricePerHour: "", capacity: "", description: "", equipment: "", photos: "", accessPMR: false, openWeekend: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/hote/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        pricePerHour: Number(f.pricePerHour),
        capacity: Number(f.capacity) || 1,
        equipment: f.equipment.split(",").map((s) => s.trim()).filter(Boolean),
        photos: f.photos.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) router.push("/hote");
    else setError(data.error ?? "Création impossible.");
  };

  return (
    <HostShell title="Nouveau studio" backTo="/hote">
      <form onSubmit={submit} className="space-y-4 px-5 pt-5">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        <Labeled label="Nom du studio" htmlFor="name">
          <input id="name" required value={f.name} onChange={set("name")} placeholder="Studio Lumière" className={input} />
        </Labeled>

        <Labeled label="Discipline" htmlFor="discipline">
          <select id="discipline" value={f.discipline} onChange={set("discipline")} className={input}>
            {DISCIPLINES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </Labeled>

        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Ville" htmlFor="city">
            <input id="city" required value={f.city} onChange={set("city")} placeholder="Paris" className={input} />
          </Labeled>
          <Labeled label="Quartier" htmlFor="district">
            <input id="district" value={f.district} onChange={set("district")} placeholder="Paris 11e" className={input} />
          </Labeled>
        </div>

        <Labeled label="Adresse" htmlFor="address">
          <input id="address" value={f.address} onChange={set("address")} placeholder="12 rue Oberkampf, 75011 Paris" className={input} />
        </Labeled>

        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Prix horaire (€)" htmlFor="price">
            <input id="price" inputMode="numeric" required value={f.pricePerHour} onChange={set("pricePerHour")} placeholder="45" className={input} />
          </Labeled>
          <Labeled label="Capacité (pers.)" htmlFor="capacity">
            <input id="capacity" inputMode="numeric" value={f.capacity} onChange={set("capacity")} placeholder="4" className={input} />
          </Labeled>
        </div>

        <Labeled label="Description" htmlFor="description" hint="Au moins 20 caractères.">
          <textarea id="description" required value={f.description} onChange={set("description")} rows={4}
            placeholder="Studio acoustique de 35 m², cabine traitée, matériel haut de gamme…"
            className={`${input} min-h-[110px] py-3`} />
        </Labeled>

        <Labeled label="Équipements" htmlFor="equipment" hint="Séparés par des virgules.">
          <input id="equipment" value={f.equipment} onChange={set("equipment")} placeholder="Piano, Console, Casques ×4, Wi-Fi" className={input} />
        </Labeled>

        <Labeled label="Photos" htmlFor="photos" hint="Une URL d'image par ligne (https://…).">
          <textarea id="photos" value={f.photos} onChange={set("photos")} rows={2} placeholder="https://exemple.com/studio-1.jpg" className={`${input} min-h-[70px] py-3`} />
        </Labeled>

        <div className="space-y-2">
          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <input type="checkbox" checked={f.accessPMR} onChange={set("accessPMR")} className="h-5 w-5 accent-[var(--color-brand)]" />
            Accès PMR
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <input type="checkbox" checked={f.openWeekend} onChange={set("openWeekend")} className="h-5 w-5 accent-[var(--color-brand)]" />
            Ouvert le week-end
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Création…" : "Publier le studio"}
        </Button>
        <p className="pb-4 text-center text-xs text-muted">
          Disponibilités par défaut : 9h-20h. Tu pourras les ajuster ensuite.
        </p>
      </form>
    </HostShell>
  );
}

function Labeled({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
