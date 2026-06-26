# StudioBook — État du projet (Project Status)

> Document de référence : ce qui est utilisé, ce qui fonctionne, ce qui reste à faire
> pour atteindre un niveau production. Dernière mise à jour : 2026-06-25.
> Légende statut : `[x]` fait et fonctionnel · `[~]` partiel / maquette · `[ ]` non implémenté.

---

## 1. Vue d'ensemble

StudioBook est une place de marché **mobile-first** pour réserver un studio créatif à l'heure
(musique, podcast, photo, vidéo, danse). L'application actuelle couvre le **parcours client**
de bout en bout (découverte → réservation → paiement simulé → gestion). Le **côté
propriétaire de studio (hôte)** et plusieurs intégrations réelles (paiement, OAuth, e-mails)
ne sont pas encore construits : voir §5 et §6.

État global : **prototype fonctionnel et persistant**, hébergeable, mais pas encore une
marketplace complète de production. Détail ci-dessous.

---

## 2. Stack technique et outils utilisés

### Framework et langage
- **Next.js 16.2.7** (App Router, Turbopack) — rendu serveur + routes API dans un seul projet.
- **React 19.2.4** — composants client pour les écrans interactifs.
- **TypeScript 5** — typage strict.

### UI / style
- **Tailwind CSS v4** (`@tailwindcss/postcss`) — design system par tokens dans `app/globals.css`
  (navy `#101827` + or `#C9A35A`, repris du prototype Figma).
- **lucide-react** — icônes.
- **clsx** — composition de classes conditionnelles.
- **next/font (Inter)** — police.
- **PWA** — `app/manifest.ts` (installable, thème navy).

### Données / backend
- **@libsql/client (Turso / libSQL)** — base SQLite-compatible.
  - En local : fichier `file:data/studiobook.db` (zéro config).
  - En production : **Turso** (cloud, gratuit) via `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
- **node:crypto** — hachage de mot de passe `scrypt`, génération de jetons de session.
- Schéma + seed automatiques au premier appel (`lib/server/db.ts`).

### Outils / infrastructure
- **Git + GitHub** — dépôt `HRHPROJECT/Studiobook` (poussé).
- **Turso** — base de données cloud (provisionnée, connectée, vérifiée sur appareil).
- **Render** — cible d'hébergement gratuit (`render.yaml` prêt, déploiement pas encore lancé).
- **Figma** — prototype de référence (navy + or, 12 écrans).
- Assets SVG de marque dans `public/brand/` et `Downloads/StudioBook_Assets/`.

---

## 3. Architecture

```
app/
  page.tsx                     01 Accueil
  recherche/page.tsx           02 Résultats / Explorer
  studio/[id]/page.tsx         03 Fiche studio
  studio/[id]/reserver/page.tsx 04 Choix du créneau
  connexion/page.tsx           05 Connexion / Inscription
  recapitulatif/page.tsx       06 Récapitulatif
  paiement/page.tsx            07 Paiement (simulé)
  confirmation/page.tsx        08 Confirmation
  reservations/page.tsx        09 Mes réservations
  reservations/[ref]/page.tsx  12 Détail réservation (billet + QR)
  messages/page.tsx            10 Messages (liste)
  messages/[id]/page.tsx          Fil de discussion (démo)
  profil/page.tsx              11 Profil
  favoris/page.tsx                Favoris
  carte/page.tsx                  Carte (factice)
  not-found.tsx                   404
  manifest.ts                     PWA
  api/
    auth/{signup,login,logout,me,quick}/route.ts
    bookings/route.ts  bookings/[ref]/route.ts
    favorites/route.ts
    studios/route.ts   studios/[id]/route.ts
components/  ui.tsx, studio-card, tab-bar, screen-header, logo
lib/
  studios.ts (catalogue), messages.ts (démo), format.ts, booking-context.tsx
  server/db.ts (libSQL + schéma + seed), server/auth.ts (scrypt + sessions)
```

- **Base** : tables `users, sessions, studios, studio_equipment, reviews, favorites, bookings`.
- **Auth** : mots de passe `scrypt`, sessions en cookie `httpOnly` + `secure` (prod), 30 jours.
- **État client** : `BookingProvider` (React Context) — utilisateur, brouillon de réservation,
  favoris, réservations.

---

## 4. Ce qui fonctionne (testé)

Vérifié en local et sur appareil (dev server via réseau local), données persistées dans Turso.

- [x] **Découverte** : accueil (vedette + recommandés), recherche avec **filtre par discipline**
      et **tri** (pertinence / prix / note), 8 studios seedés.
- [x] **Fiche studio** : description, équipements, localisation, avis (lecture), badges
      (vérifié / top hôte / PMR), CTA sticky.
- [x] **Parcours de réservation complet** : créneau → connexion → récapitulatif →
      paiement (simulé) → confirmation → billet (réf + code d'accès + QR déterministe).
- [x] **Frais de service 4,50 €** appliqués de façon cohérente (client + serveur). Total vérifié : 94,50 € pour 2 h à 45 €.
- [x] **Authentification réelle** : inscription (e-mail + mot de passe haché), connexion,
      session persistante, déconnexion. Boutons Google/Apple = comptes de démo instantanés.
- [x] **Favoris** : ajout/retrait persistés par utilisateur (protégés par authentification ;
      redirection vers la connexion si déconnecté).
- [x] **Mes réservations** : liste (onglets À venir / Passées), détail, **annulation**.
- [x] **Persistance réelle** : Turso conserve utilisateurs, sessions, réservations, favoris
      au redémarrage.
- [x] **Mobile-first**, **PWA** (installable), **404** soignée.
- [x] **Accessibilité de base (RGAA)** : `lang=fr`, un `<h1>` par écran, lien d'évitement,
      focus visible, `prefers-reduced-motion`, labels de formulaire, `aria-pressed` favoris,
      `aria-current` navigation, contraste de l'onglet actif corrigé.
- [x] **Prêt au déploiement** : code sur GitHub, base Turso connectée, `render.yaml` fourni.

---

## 5. Partiel / maquette (à compléter)

- [~] **Messagerie** : interface complète, mais **données statiques** (`lib/messages.ts`).
      L'envoi d'un message s'ajoute seulement à l'écran (pas de backend, pas de destinataire,
      pas de persistance, pas de temps réel).
- [~] **Filtres avancés** : les puces de discipline et le tri fonctionnent ; le bouton
      « filtres » (icône curseurs) est **décoratif** (pas de panneau prix / ville / PMR / week-end).
- [~] **Carte** : carte **factice** (grille + épingles décoratives), pas de vraie géoloc ni de
      fournisseur cartographique.
- [~] **Paiement** : **simulé** (pas de vrai Stripe). Une carte finissant par `0000` simule un refus.
- [~] **OAuth Google / Apple** : **comptes de démo**, pas de vrai flux OAuth.
- [~] **Disponibilités** : créneaux **codés en dur** (9h-19h, un créneau désactivé pour la démo).
      Pas de calendrier réel par studio, **pas de prévention de double réservation** (deux
      personnes peuvent réserver le même créneau).
- [~] **Images des studios** : **placeholders** (dégradé navy + icône). Les illustrations SVG
      produites ne sont pas encore intégrées ; aucune vraie photo.
- [~] **Avis** : en **lecture seule** ; impossible d'en soumettre un.
- [~] **Confirmation e-mail / SMS** : le texte indique « envoyé » mais **rien n'est réellement envoyé**.
- [~] **Bouton « Ajouter au calendrier »** : placeholder (pas de fichier `.ics`).

---

## 6. Non implémenté (manquant pour une vraie production)

### Fonctionnel marketplace
- [ ] **Types de compte / rôles** : inscription **client** vs **propriétaire de studio (hôte)**
      vs **les deux**. Aujourd'hui l'inscription ne propose aucun choix de rôle.
- [ ] **Espace hôte (côté studio)** entièrement : créer / éditer une annonce de studio, gérer
      les disponibilités, accepter / refuser des réservations, tableau de bord, revenus / payouts.
- [ ] **Moteur de disponibilité** réel + **prévention des conflits** (un créneau réservé doit
      être bloqué pour les autres).
- [ ] **Sous-pages Profil** : « Mes informations » (édition du profil), « Moyens de paiement »
      (cartes enregistrées), « Notifications » (préférences), « Aide et support » — toutes des
      placeholders aujourd'hui (ne font rien).
- [ ] **Soumission d'avis** après une réservation.

### Intégrations réelles
- [ ] **Paiements Stripe** réels (intentions de paiement, webhooks, reçus / factures).
- [ ] **OAuth Google / Apple** réels.
- [ ] **E-mails transactionnels** (confirmation, annulation) via un fournisseur (Resend, etc.).
- [ ] **SMS** (code d'accès) via un fournisseur.
- [ ] **Cartographie / géolocalisation** réelle (distance, recherche par zone).
- [ ] **Upload de médias** (vraies photos de studios).

### Compte et sécurité
- [ ] **Réinitialisation de mot de passe** + **vérification d'e-mail**.
- [ ] **Protection CSRF** sur les POST par cookie.
- [ ] **Rate limiting** (anti brute-force sur connexion / inscription).
- [ ] **Validation de schéma** côté API (ex. zod) — actuellement validation minimale manuelle.

### Qualité, ops, légal
- [ ] **Tests** (unitaires + e2e) — aucun pour l'instant.
- [ ] **CI/CD** avec étape de tests (Render auto-déploie sans garde-fou).
- [ ] **Observabilité** : logs structurés, monitoring d'erreurs (Sentry).
- [ ] **Pages légales** : CGV, politique de confidentialité (référencées, absentes).
- [ ] **Audit accessibilité complet** (axe) + correction du **contraste de la flèche retour**
      sur l'image de la fiche studio (blanc sur fond clair, peu visible — point que tu as entouré).
- [ ] **i18n** : français uniquement.
- [ ] **sitemap.xml / robots.txt**.

---

## 7. Réponses aux points entourés sur tes captures

- **Connexion — « Afficher », Google, Apple, « Créer un compte »** : « Afficher » fonctionne
  (montre/masque le mot de passe). Google/Apple créent un compte de démo (pas de vrai OAuth).
  « Créer un compte » bascule vers l'inscription, mais le formulaire ne demande que prénom /
  e-mail / mot de passe : **aucun choix client / hôte** (voir §6, à implémenter).
- **Résultats — barre + puces de filtre** : les puces (Tous / Musique / Podcast / Photo / …)
  filtrent réellement ; le bouton à curseurs ne fait rien (pas de panneau de filtres avancés).
- **Fiche studio — bande du haut entourée** : c'est la zone image (placeholder). La **flèche
  retour est blanche sur fond clair**, donc peu visible : bug de contraste à corriger. Le cœur
  (favori) fonctionne (redirige vers connexion si déconnecté).
- **Profil — liste entourée** : « Mes informations / Moyens de paiement / Notifications /
  Aide » sont des **placeholders** (aucune page derrière).
- **Messages — flèche retour** : fonctionne ; mais toute la messagerie est une **démo statique**.

---

## 8. État de l'hébergement

- [x] **GitHub** : code poussé sur `HRHPROJECT/Studiobook` (branche `master`).
- [x] **Turso** : base créée (`studiobook-hrhproject...turso.io`), connectée, données vérifiées.
- [ ] **Render** : `render.yaml` prêt ; déploiement non encore lancé. Étapes : Render →
      New → Blueprint → repo → renseigner `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` → Apply.

---

## 9. Feuille de route recommandée (priorisée)

**P0 — exactitude marketplace (le plus important)**
1. Rôles de compte : client / hôte / les deux (champ `role` sur `users`, choix à l'inscription).
2. Espace hôte : créer une annonce, gérer disponibilités, accepter/refuser les réservations.
3. Disponibilités réelles + **blocage des créneaux déjà réservés**.

**P1 — confiance et paiements**
4. Stripe réel (paiement + reçus).
5. E-mails / SMS transactionnels.
6. Soumission d'avis ; sous-pages Profil (édition infos, moyens de paiement, notifications).

**P2 — finition**
7. Vraies photos de studios ; vraie carte / géoloc ; OAuth réel ; panneau de filtres ;
   messagerie persistée.

**P3 — ops / conformité**
8. Tests + CI ; monitoring ; rate limiting + CSRF ; pages légales (CGV / RGPD) ; audit a11y.

---

## 10. Comment lancer

```bash
npm install
# local (SQLite fichier, zéro config) :
npm run dev
# ou branché sur Turso : créer .env.local avec TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
npm run build && npm run start
```

Compte de démo : boutons Google / Apple (session de test instantanée).
Paiement de démo : carte `4242 4242 4242 4242` réussit, `…0000` simule un refus.
Hôte de démo : `studio@demo.studiobook` / `demohost1` (propriétaire des studios seedés).

---

## 11. Mise à jour — passage en marketplace (2026-06-26)

### Désormais fait et vérifié de bout en bout
- [x] **Comptes à rôles** : client / hôte / les deux, choix à l'inscription, redirection par rôle.
- [x] **Espace hôte complet** : tableau de bord (studios, réservations, revenus, note), création
      et **édition** de studio, **gestion des disponibilités** (horaires par jour + dates bloquées),
      réservations reçues, revenus, messages. Chaque hôte ne gère que ses studios.
- [x] **Disponibilités réelles + anti double-réservation** : créneaux calculés par studio ;
      un créneau réservé devient indisponible ; conflit serveur renvoie 409 + alternatives.
- [x] **Marketplace réelle** : un studio créé par un hôte apparaît dans la recherche/accueil,
      est consultable et **réservable** par un client (vérifié : navigation 9 studios, réservation, total).
- [x] **Messagerie persistante** client ↔ hôte (conversations, fil, non-lus, accès réservé aux participants).
- [x] **Avis** : éligibilité après réservation terminée, publication, recalcul de la note du studio.
- [x] **Sous-pages Profil réelles** : informations, notifications (préférences), moyens de paiement, aide (FAQ + support).
- [x] **Calendrier .ics** réel (« Ajouter au calendrier »).
- [x] **Pages légales** : CGV, confidentialité, mentions légales, accessibilité, cookies (+ liens footer).
- [x] **SEO** : sitemap.xml, robots.txt ; **en-têtes de sécurité** (X-Frame-Options, Referrer-Policy, HSTS en prod…).
- [x] **Statuts de réservation** + traçabilité paiement (table `payments`, mode démo ou Stripe selon env).

### Reste à faire (prochaines itérations)
- [ ] **Stripe réel** : la table `payments` et la logique de statut existent ; brancher le vrai paiement
      (Payment Intents + webhook) quand `STRIPE_SECRET_KEY` est fourni.
- [ ] **E-mails / SMS réels** : adaptateurs à brancher (Resend / Twilio) ; le `.ics` est fait.
- [ ] **Panneau de filtres avancés** : discipline + tri sont actifs ; reste prix / ville / PMR / capacité.
- [ ] **Tests automatisés** (unitaires + e2e Playwright) et CI.
- [ ] **CSRF + rate limiting** (les en-têtes de sécurité sont en place).
- [ ] **Réinitialisation de mot de passe** (table `password_reset_tokens` prête).
- [ ] **Adaptation desktop/tablette** plus large (l'app reste en colonne mobile centrée).
- [ ] **Carte réelle** (Mapbox) et **upload de photos** de studios.
- [ ] **Espace admin / modération** (champs `status` prêts).

### Variables d'environnement (production)
Requises : `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
Optionnelles (activent le mode réel sinon démo) : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `TWILIO_*`, `MAPBOX_TOKEN`.
