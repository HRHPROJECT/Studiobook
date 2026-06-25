# StudioBook

Réservez un studio créatif à l'heure partout en France — **musique, podcast, photo, vidéo, danse**.
Application **mobile-first**, accessible (RGAA / WCAG 2.1 AA), full-stack.

Stack : **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · SQLite (better-sqlite3)**.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
```

La base SQLite (`data/studiobook.db`) se crée et se remplit toute seule au premier appel API.

```bash
npm run build && npm run start   # build de production
npm run lint                     # ESLint
```

## Parcours (12 écrans)

Accueil → Résultats → Fiche studio → Choix du créneau → Connexion → Récapitulatif →
Paiement → Confirmation → Mes réservations → Détail réservation → Messages → Profil.

Compte démo : les boutons **Google / Apple** créent une session de test instantanée.
Paiement : une carte finissant par `0000` simule un refus (le reste réussit).

## Architecture

```
app/                 routes (écrans) + app/api/* (handlers)
  api/auth/*         signup, login, logout, me, quick (OAuth démo)
  api/bookings/*     création / liste / annulation
  api/favorites      toggle favoris (auth requise)
  api/studios/*      catalogue
components/          ui.tsx, studio-card, tab-bar, screen-header, logo
lib/                 studios (catalogue), messages, format, booking-context (état client)
  server/            db.ts (schéma + seed SQLite), auth.ts (scrypt + sessions cookie)
data/                studiobook.db (ignoré par git, recréé au runtime)
```

- **Auth** : mots de passe hachés `scrypt`, sessions en cookie `httpOnly` (30 j).
- **État client** : `BookingProvider` (React Context) — user, draft de réservation, favoris, bookings.
- **Design system** : tokens navy `#101827` + or `#C9A35A` dans `app/globals.css`.

## Accessibilité (RGAA)

- HTML `lang="fr"`, un seul `<h1>` par écran, lien d'évitement vers `#main`.
- `:focus-visible` visible partout, `prefers-reduced-motion` respecté.
- Labels de formulaire associés, boutons icône nommés (`aria-label`), `aria-pressed` sur les favoris.
- Navigation `aria-current="page"`, contrastes texte ≥ AA (l'or sert d'indicateur, jamais de seul texte sur blanc).

## Déploiement

> ⚠️ **GitHub Pages ne convient pas** : il ne sert que du statique, donc ni les routes `/api/*` ni SQLite.

**Option A — Vercel + Turso (gratuit, recommandé)**
Pousser le repo sur GitHub, importer dans Vercel. Le disque Vercel étant éphémère,
remplacer SQLite par **Turso** (libSQL, compatible SQLite) pour la persistance.

**Option B — Serveur Node persistant (SQLite conservé)**
Render / Railway / Fly.io avec un volume monté sur `data/`. Zéro changement de code.

---
Conçu pour le dossier *Chef de Projet Digital* (RNCP39602). Design de référence : prototype Figma navy + or, 12 écrans.
