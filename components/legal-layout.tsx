import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Mise en page commune des pages légales (style sobre, cohérent avec la marque). */
export default function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream pb-16">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <Link href="/profil" aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
      </header>
      <article className="legal mx-auto max-w-2xl px-5 py-6 text-[15px] leading-relaxed text-ink [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-muted [&_p]:text-muted">
        {children}
      </article>
    </div>
  );
}
