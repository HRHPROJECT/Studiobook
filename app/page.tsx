"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DISCIPLINES, type StudioSummary } from "@/lib/studios";
import StudioCard from "@/components/studio-card";
import { Chip } from "@/components/ui";

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState("musique");
  const [studios, setStudios] = useState<StudioSummary[]>([]);

  useEffect(() => {
    fetch("/api/studios?sort=note").then((r) => r.json()).then((d) => setStudios(d.studios ?? []));
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/recherche?q=${encodeURIComponent(q)}&discipline=${active}`);
  };

  const featured = studios[0];
  const recommended = studios.slice(1, 5);

  return (
    <div>
      {/* Hero navy */}
      <section className="gold-sheen bg-brand px-5 pb-7 pt-6 text-white">
        <p className="text-sm font-bold tracking-wide text-accent">StudioBook</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">Trouve ton studio.</h1>
        <p className="mt-1.5 text-[15px] text-white/70">
          Réserve un espace créatif, près de chez toi.
        </p>
      </section>

      {/* Search bar (chevauche le hero) */}
      <div className="-mt-6 px-5">
        <form onSubmit={submit} role="search" className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 card-shadow">
          <Search size={20} className="text-muted" aria-hidden />
          <label htmlFor="home-search" className="sr-only">Rechercher un studio</label>
          <input
            id="home-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Paris 11e · Studio musique…"
            className="min-h-[40px] flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            aria-label="Filtres"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand"
          >
            <SlidersHorizontal size={18} />
          </button>
        </form>
      </div>

      {/* Discipline chips */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-5">
        {DISCIPLINES.map((d) => (
          <Chip
            key={d.id}
            selected={active === d.id}
            onClick={() => setActive(d.id)}
          >
            {d.label}
          </Chip>
        ))}
      </div>

      {/* Studios en vedette */}
      <section className="px-5 pt-6">
        <h2 className="text-lg font-bold text-ink">Studios en vedette</h2>
        <div className="mt-3">
          {featured ? <StudioCard studio={featured} /> : <div className="h-72 animate-pulse rounded-2xl bg-[#edeae3]" />}
        </div>
      </section>

      {/* Recommandés */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recommandés près de toi</h2>
          <button onClick={() => router.push("/recherche")} className="text-sm font-semibold text-gold-dark">
            Tout voir
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {recommended.map((s) => (
            <StudioCard key={s.id} studio={s} />
          ))}
        </div>
      </section>

      <p className="px-5 py-6 text-center text-xs text-muted">
        StudioBook V1 — Paris · Lyon · Marseille · {studios.length} studios
      </p>
    </div>
  );
}
