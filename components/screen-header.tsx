"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

/** En-tête d'écran réutilisable : flèche retour + titre, fond clair ou navy. */
export default function ScreenHeader({
  title,
  tone = "light",
  right,
  backTo,
}: {
  title?: string;
  tone?: "light" | "navy";
  right?: ReactNode;
  backTo?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={clsx(
        "sticky top-0 z-30 flex items-center gap-3 px-4 py-3",
        tone === "navy" ? "bg-brand text-white" : "border-b border-line bg-white text-ink"
      )}
    >
      <button
        onClick={() => (backTo ? router.push(backTo) : router.back())}
        aria-label="Retour"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5"
      >
        <ArrowLeft size={22} />
      </button>
      {title && <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </header>
  );
}
