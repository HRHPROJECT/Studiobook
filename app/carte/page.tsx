"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, List, Star, ChevronRight } from "lucide-react";
import { STUDIOS } from "@/lib/studios";
import { euro } from "@/lib/format";

// Mock map coordinates (% of the map area) for the pilot studios.
const PINS: { id: string; top: number; left: number }[] = [
  { id: "studio-lumiere", top: 38, left: 42 },
  { id: "atelier-sonore", top: 22, left: 22 },
  { id: "podcast-corner", top: 28, left: 70 },
  { id: "studio-mistral", top: 56, left: 30 },
  { id: "studio-cadrage", top: 62, left: 64 },
  { id: "blue-note", top: 48, left: 84 },
];

export default function CartePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("studio-lumiere");
  const selected = STUDIOS.find((s) => s.id === selectedId) ?? STUDIOS[0];

  return (
    <div>
      <h1 className="sr-only">Carte des studios</h1>
      {/* Barre supérieure */}
      <div className="flex items-center gap-2 px-3.5 py-2">
        <button
          onClick={() => router.back()}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand"
        >
          <ArrowLeft size={21} />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-surface px-4 py-2.5">
          <Search size={17} className="text-muted" aria-hidden />
          <span className="text-sm font-semibold text-ink">Photo · Paris</span>
        </div>
        <Link
          href="/recherche"
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
        >
          <List size={16} /> Liste
        </Link>
      </div>

      {/* Carte */}
      <div
        className="relative h-[600px] w-full overflow-hidden bg-surface"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #e5e1f0 0 1px, transparent 1px 46px), repeating-linear-gradient(90deg, #e5e1f0 0 1px, transparent 1px 52px)",
        }}
        role="img"
        aria-label="Carte des studios disponibles à Paris"
      >
        {/* Décor : parc + rivière */}
        <div className="absolute right-[-40px] bottom-10 h-48 w-64 rotate-12 rounded-[40%] bg-success/15" aria-hidden />
        <div className="absolute left-0 top-1/2 h-3 w-full -rotate-6 bg-info/20" aria-hidden />

        {/* Position utilisateur */}
        <div className="absolute" style={{ top: "46%", left: "47%" }} aria-hidden>
          <span className="absolute -left-3 -top-3 h-7 w-7 rounded-full bg-info/25" />
          <span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-info shadow" />
        </div>

        {/* Épingles prix */}
        {PINS.map((p) => {
          const studio = STUDIOS.find((s) => s.id === p.id);
          if (!studio) return null;
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{ top: `${p.top}%`, left: `${p.left}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[13px] font-bold shadow-md transition ${
                active
                  ? "z-10 scale-110 bg-brand text-white"
                  : "border border-line bg-white text-ink hover:scale-105"
              }`}
            >
              {euro(studio.pricePerHour)}
            </button>
          );
        })}

        {/* Carte studio sélectionné */}
        <Link
          href={`/studio/${selected.id}`}
          className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-xl shadow-brand/15"
        >
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${"grad-" + selected.discipline}`}>
            <span className="text-lg font-black text-accent">{euro(selected.pricePerHour)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-bold text-ink">{selected.name}</p>
              <Star size={13} className="shrink-0 fill-accent text-accent" />
              <span className="text-sm font-semibold text-ink">{selected.rating.toFixed(1).replace(".", ",")}</span>
            </div>
            <p className="truncate text-sm text-muted">
              {selected.district} · Dès {euro(selected.pricePerHour)}/h
            </p>
          </div>
          <ChevronRight size={22} className="shrink-0 text-muted" />
        </Link>
      </div>
    </div>
  );
}
