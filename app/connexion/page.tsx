"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useBooking } from "@/lib/booking-context";

export default function ConnexionPage() {
  const router = useRouter();
  const { signIn, signUp, signInQuick, draft } = useBooking();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const done = () => router.push(draft ? "/recapitulatif" : "/profil");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = isSignup ? await signUp(name, email, pwd) : await signIn(email, pwd);
    setBusy(false);
    if (res.ok) done();
    else setError(res.error ?? "Une erreur est survenue.");
  };

  const quick = async (provider: "apple" | "google") => {
    setBusy(true);
    await signInQuick(provider);
    setBusy(false);
    done();
  };

  const fieldClass =
    "min-h-[54px] w-full rounded-2xl border border-navy-700 bg-navy-700 px-4 text-[15px] text-white outline-none transition placeholder:text-white/40 focus:border-accent";

  return (
    <div className="min-h-screen bg-brand px-6 pb-10 pt-14 text-white">
      <div className="text-center">
        <h1 className="text-[26px] font-extrabold text-accent">StudioBook</h1>
        <p className="mt-1 text-[15px] text-white/70">
          {draft ? "Dernière étape avant ta réservation." : "Connecte-toi pour réserver ton studio."}
        </p>
      </div>

      {error && (
        <div role="alert" className="mx-auto mt-6 flex max-w-sm items-center gap-2 rounded-xl bg-error/20 px-3 py-2.5 text-sm text-[#ffb3a8]">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-7 space-y-3">
        {isSignup && (
          <input
            aria-label="Prénom"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom"
            className={fieldClass}
          />
        )}
        <input
          aria-label="Adresse e-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="houssam@email.com"
          className={fieldClass}
        />
        <div className="relative">
          <input
            aria-label="Mot de passe"
            type={show ? "text" : "password"}
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder={isSignup ? "6 caractères minimum" : "••••••••••"}
            className={`${fieldClass} pr-20`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-accent"
          >
            {show ? <EyeOff size={18} /> : "Afficher"}
          </button>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="min-h-[54px] w-full rounded-2xl bg-accent text-base font-bold text-brand transition active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? "…" : isSignup ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-white/40">
        <span className="h-px flex-1 bg-white/15" /> ou continuer avec <span className="h-px flex-1 bg-white/15" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => quick("google")} className="min-h-[52px] rounded-2xl border border-navy-700 bg-navy-700 font-semibold text-white/90 transition active:scale-[0.99]">
          <span className="font-bold text-accent">G</span>&nbsp; Google
        </button>
        <button onClick={() => quick("apple")} className="min-h-[52px] rounded-2xl border border-navy-700 bg-navy-700 font-semibold text-white/90 transition active:scale-[0.99]">
           Apple
        </button>
      </div>

      <button
        onClick={() => { setMode(isSignup ? "login" : "signup"); setError(null); }}
        className="mt-7 w-full text-center text-sm font-semibold text-accent"
      >
        {isSignup ? "Déjà un compte ?  Se connecter" : "Pas encore de compte ?  Créer un compte"}
      </button>

      <p className="mt-5 text-center text-xs leading-relaxed text-white/40">
        En continuant, tu acceptes nos CGV et notre politique de confidentialité.
      </p>
    </div>
  );
}
