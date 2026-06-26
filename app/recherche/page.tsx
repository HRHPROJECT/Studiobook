"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, SlidersHorizontal, Map as MapIcon } from "lucide-react";
import { DISCIPLINES, type Discipline, type StudioSummary } from "@/lib/studios";
import StudioCard from "@/components/studio-card";
import { Chip } from "@/components/ui";

function ResultsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialDisc = (params.get("discipline") as Discipline | null) ?? "all";

  const [q, setQ] = useState(params.get("q") ?? "");
  const [discipline, setDiscipline] = useState<Discipline | "all">(
    DISCIPLINES.some((d) => d.id === initialDisc) ? (initialDisc as Discipline) : "all"
  );
  const [sort, setSort] = useState<"pertinence" | "prix" | "note">("pertinence");
  const [results, setResults] = useState<StudioSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (discipline !== "all") sp.set("discipline", discipline);
    sp.set("sort", sort);
    const t = setTimeout(() => {
      fetch(`/api/studios?${sp.toString()}`).then((r) => r.json()).then((d) => setResults(d.studios ?? [])).finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(t);
  }, [q, discipline, sort]);

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-line bg-white px-4 py-3">
        <h1 className="sr-only">Résultats de recherche de studios</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
            <ArrowLeft size={22} />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5">
            <Search size={18} className="text-muted" aria-hidden />
            <label htmlFor="results-search" className="sr-only">Rechercher</label>
            <input id="results-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Paris 11e · Musique"
              className="min-h-[24px] flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
            <SlidersHorizontal size={17} className="text-accent" aria-hidden />
          </div>
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          <Chip selected={discipline === "all"} onClick={() => setDiscipline("all")}>Tous</Chip>
          {DISCIPLINES.map((d) => (
            <Chip key={d.id} selected={discipline === d.id} onClick={() => setDiscipline(d.id)}>{d.label}</Chip>
          ))}
        </div>
      </header>

      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-sm font-semibold text-muted">
          {loading ? "Recherche…" : `${results.length} studio${results.length > 1 ? "s" : ""} disponible${results.length > 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm font-semibold text-ink">
            <span className="text-muted">Trier&nbsp;:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-transparent font-semibold text-ink outline-none" aria-label="Trier les résultats">
              <option value="pertinence">Pertinence</option>
              <option value="prix">Prix</option>
              <option value="note">Note</option>
            </select>
          </label>
          <button onClick={() => router.push("/carte")} aria-label="Voir la carte" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink">
            <MapIcon size={17} />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {!loading && results.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-8 text-center">
            <p className="font-bold text-ink">Aucun studio trouvé</p>
            <p className="mt-1 text-sm text-muted">Essaie une autre recherche ou élargis tes filtres.</p>
          </div>
        ) : (
          results.map((s) => <StudioCard key={s.id} studio={s} />)
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Chargement…</div>}>
      <ResultsInner />
    </Suspense>
  );
}
