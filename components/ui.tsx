import Link from "next/link";
import { Star } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

type Variant = "primary" | "gold" | "ghost" | "outline";
type Size = "lg" | "md" | "sm";

const variants: Record<Variant, string> = {
  // navy fond + texte or — CTA principal du prototype
  primary: "bg-brand text-accent hover:bg-brand-600",
  // or fond + texte navy — CTA de validation (connexion, paiement)
  gold: "bg-accent text-brand hover:bg-accent-600",
  ghost: "bg-surface text-ink hover:bg-line",
  outline: "border-[1.5px] border-brand bg-transparent text-ink hover:bg-surface",
};

const sizes: Record<Size, string> = {
  lg: "min-h-[52px] px-6 text-base",
  md: "min-h-[44px] px-5 text-sm",
  sm: "min-h-[40px] px-4 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  children,
  variant = "primary",
  size = "lg",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  size = "lg",
  className,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <Link href={href} className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "gold" | "success" | "muted" | "warning";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "brand" && "bg-brand/10 text-brand",
        tone === "gold" && "bg-accent/15 text-gold-dark",
        tone === "success" && "bg-success/12 text-success",
        tone === "warning" && "bg-[#f4a23715] text-[#b5760f]",
        tone === "muted" && "bg-surface text-muted"
      )}
    >
      {children}
    </span>
  );
}

export function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-ink">
      <Star size={size} className="fill-accent text-accent" />
      {rating.toFixed(1).replace(".", ",")}
    </span>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-bold text-ink">{children}</h2>;
}

/** Pill de discipline / filtre — sélectionné = navy plein, sinon = blanc bordé greige. */
export function Chip({
  children,
  selected = false,
  className,
  ...props
}: {
  children: ReactNode;
  selected?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition",
        selected
          ? "bg-brand text-white"
          : "border border-greige bg-white text-ink hover:border-brand",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Champ texte étiqueté, accessible (label associé). */
export function Field({
  label,
  id,
  hint,
  className,
  ...props
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input
        id={id}
        className={clsx(
          "min-h-[52px] w-full rounded-2xl border border-greige bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-brand",
          className
        )}
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
