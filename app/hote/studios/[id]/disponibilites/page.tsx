"use client";

import { use, useEffect, useState } from "react";
import { Check } from "lucide-react";
import HostShell from "@/components/host-shell";
import { Button } from "@/components/ui";
import clsx from "clsx";

const DAYS: { wd: number; label: string }[] = [
  { wd: 1, label: "Lundi" }, { wd: 2, label: "Mardi" }, { wd: 3, label: "Mercredi" },
  { wd: 4, label: "Jeudi" }, { wd: 5, label: "Vendredi" }, { wd: 6, label: "Samedi" }, { wd: 0, label: "Dimanche" },
];

type Rule = { active: boolean; startHour: number; endHour: number };

export default function AvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rules, setRules] = useState<Record<number, Rule>>({});
  const [exceptions, setExceptions] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/hote/studios/${id}/availability`).then((r) => r.json()).then((d) => {
      const map: Record<number, Rule> = {};
      for (const day of DAYS) map[day.wd] = { active: false, startHour: 9, endHour: 20 };
      for (const r of d.rules ?? []) map[r.weekday] = { active: true, startHour: r.startHour, endHour: r.endHour };
      setRules(map);
      setExceptions((d.exceptions ?? []).filter((e: { blocked: boolean }) => e.blocked).map((e: { date: string }) => e.date));
    });
  }, [id]);

  const update = (wd: number, patch: Partial<Rule>) => setRules((p) => ({ ...p, [wd]: { ...p[wd], ...patch } }));

  const save = async () => {
    setBusy(true); setSaved(false);
    const payload = DAYS.map((d) => ({ weekday: d.wd, ...rules[d.wd] })).filter((r) => r.active);
    await fetch(`/api/hote/studios/${id}/availability`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules: payload }) });
    setBusy(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleDate = async (date: string) => {
    if (!date) return;
    const r = await fetch(`/api/hote/studios/${id}/availability`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date }) });
    const d = await r.json();
    setExceptions((p) => (d.blocked ? [...p, date] : p.filter((x) => x !== date)));
    setNewDate("");
  };

  return (
    <HostShell title="Disponibilités" backTo={`/hote/studios/${id}/modifier`}>
      <div className="px-5 pt-5">
        <h2 className="text-base font-bold text-ink">Horaires d&apos;ouverture</h2>
        <p className="text-sm text-muted">Active les jours d&apos;ouverture et définis les heures.</p>

        <div className="mt-4 space-y-2.5">
          {DAYS.map((d) => {
            const r = rules[d.wd] ?? { active: false, startHour: 9, endHour: 20 };
            return (
              <div key={d.wd} className="rounded-2xl border border-line bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{d.label}</span>
                  <button
                    onClick={() => update(d.wd, { active: !r.active })}
                    role="switch"
                    aria-checked={r.active}
                    className={clsx("relative h-6 w-11 rounded-full transition", r.active ? "bg-brand" : "bg-greige")}
                  >
                    <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", r.active ? "left-[22px]" : "left-0.5")} />
                  </button>
                </div>
                {r.active && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <label className="text-muted">De</label>
                    <select value={r.startHour} onChange={(e) => update(d.wd, { startHour: Number(e.target.value) })} className="rounded-lg border border-greige px-2 py-1.5">
                      {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => <option key={h} value={h}>{h}h</option>)}
                    </select>
                    <label className="text-muted">à</label>
                    <select value={r.endHour} onChange={(e) => update(d.wd, { endHour: Number(e.target.value) })} className="rounded-lg border border-greige px-2 py-1.5">
                      {Array.from({ length: 16 }, (_, i) => i + 9).map((h) => <option key={h} value={h}>{h}h</option>)}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button onClick={save} className="mt-4 w-full" disabled={busy}>
          {busy ? "Enregistrement…" : saved ? "Enregistré ✓" : "Enregistrer les horaires"}
        </Button>

        <h2 className="mt-8 text-base font-bold text-ink">Dates bloquées</h2>
        <p className="text-sm text-muted">Bloque des dates spécifiques (congés, événements).</p>
        <div className="mt-3 flex gap-2">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="min-h-[48px] flex-1 rounded-2xl border border-greige bg-white px-4 text-[15px] outline-none focus:border-brand" />
          <Button size="md" onClick={() => toggleDate(newDate)}>Bloquer</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {exceptions.map((dt) => (
            <button key={dt} onClick={() => toggleDate(dt)} className="inline-flex items-center gap-1.5 rounded-full bg-[#edeae3] px-3 py-1.5 text-sm font-medium text-ink">
              {dt} <span aria-hidden className="text-muted">×</span>
            </button>
          ))}
          {exceptions.length === 0 && <p className="text-sm text-muted">Aucune date bloquée.</p>}
        </div>
        <div className="pb-6" />
      </div>
    </HostShell>
  );
}
