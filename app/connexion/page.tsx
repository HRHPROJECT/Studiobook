"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, AlertCircle } from "lucide-react";
import { useBooking, type Role, type User } from "@/lib/booking-context";
import clsx from "clsx";

const ROLE_OPTIONS: { value: Role; label: string; hint: string }[] = [
  { value: "client", label: "Je réserve un studio", hint: "Trouver et réserver des espaces créatifs" },
  { value: "host", label: "Je propose mon studio", hint: "Mettre mon studio en location" },
  { value: "both", label: "Les deux", hint: "Réserver et proposer" },
];

export default function ConnexionPage() {
  const router = useRouter();
  const { signIn, signUp, signInQuick, draft } = useBooking();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const routeAfterAuth = (u: User | null | undefined) => {
    if (draft) router.push("/recapitulatif");
    else if (u && (u.role === "host" || u.role === "both")) router.push("/hote");
    else router.push("/");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = isSignup ? await signUp(name, email, pwd, role) : await signIn(email, pwd);
    setBusy(false);
    if (res.ok) routeAfterAuth(res.user);
    else setError(res.error ?? "Une erreur est survenue.");
  };

  const quick = async (provider: "apple" | "google") => {
    setBusy(true);
    const u = await signInQuick(provider);
    setBusy(false);
    routeAfterAuth(u);
  };

  const fieldClass =
    "min-h-[54px] w-full rounded-2xl border border-navy-700 bg-navy-700 px-4 text-[15px] text-white outline-none transition placeholder:text-white/40 focus:border-accent";

  return (
    <div className="min-h-screen bg-brand px-6 pb-10 pt-14 text-white">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="text-[26px] font-extrabold text-accent">StudioBook</h1>
          <p className="mt-1 text-[15px] text-white/70">
            {draft
              ? "Dernière étape avant ta réservation."
              : isSignup
                ? "Crée ton compte en quelques secondes."
                : "Connecte-toi pour réserver ton studio."}
          </p>
        </div>

        {error && (
          <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl bg-error/20 px-3 py-2.5 text-sm text-[#ffb3a8]">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-3">
          {isSignup && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-white/80">Je souhaite&nbsp;:</legend>
                <div className="grid gap-2" role="radiogroup">
                  {ROLE_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className={clsx(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition",
                        role === o.value ? "border-accent bg-accent/10" : "border-navy-700 bg-navy-700"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={o.value}
                        checked={role === o.value}
                        onChange={() => setRole(o.value)}
                        className="mt-0.5 h-5 w-5 accent-[var(--color-accent)]"
                      />
                      <span>
                        <span className="block font-bold text-white">{o.label}</span>
                        <span className="block text-[13px] text-white/60">{o.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label htmlFor="name" className="sr-only">Prénom</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom" className={fieldClass} />
            </>
          )}

          <label htmlFor="email" className="sr-only">Adresse e-mail</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="houssam@email.com" className={fieldClass} />

          <div className="relative">
            <label htmlFor="pwd" className="sr-only">Mot de passe</label>
            <input
              id="pwd"
              type={show ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder={isSignup ? "6 caractères minimum" : "••••••••••"}
              className={`${fieldClass} pr-24`}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-accent">
              {show ? <EyeOff size={18} /> : "Afficher"}
            </button>
          </div>

          <button type="submit" disabled={busy} className="min-h-[54px] w-full rounded-2xl bg-accent text-base font-bold text-brand transition active:scale-[0.99] disabled:opacity-50">
            {busy ? "…" : isSignup ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-white/40">
          <span className="h-px flex-1 bg-white/15" /> ou continuer avec <span className="h-px flex-1 bg-white/15" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => quick("google")} disabled={busy} className="min-h-[52px] rounded-2xl border border-navy-700 bg-navy-700 font-semibold text-white/90 transition active:scale-[0.99] disabled:opacity-50">
            <span className="font-bold text-accent">G</span>&nbsp; Google
          </button>
          <button onClick={() => quick("apple")} disabled={busy} className="min-h-[52px] rounded-2xl border border-navy-700 bg-navy-700 font-semibold text-white/90 transition active:scale-[0.99] disabled:opacity-50">
             Apple
          </button>
        </div>

        <button onClick={() => { setMode(isSignup ? "login" : "signup"); setError(null); }} className="mt-7 w-full text-center text-sm font-semibold text-accent">
          {isSignup ? "Déjà un compte ?  Se connecter" : "Pas encore de compte ?  Créer un compte"}
        </button>

        <p className="mt-5 text-center text-xs leading-relaxed text-white/40">
          En continuant, tu acceptes nos{" "}
          <a href="/cgv" className="underline">CGV</a> et notre{" "}
          <a href="/confidentialite" className="underline">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
