# African Talents — Site de vote en ligne

Site de vote pour le concours musical, avec paiement Fapshi, classement en direct
et tableau de bord admin caché sur `/sen`.

## Stack

- **Next.js 14** (App Router) — frontend + backend (API routes) dans un seul projet
- **Supabase** (Postgres) — candidats, transactions, classement
- **Fapshi** — paiement Mobile Money / Orange Money
- **Tailwind CSS** + **Framer Motion** — design et animations
- **Geist** (police Vercel) — typographie

## 1. Créer le projet Supabase (5 minutes)

1. Va sur [supabase.com](https://supabase.com) → crée un compte gratuit → **New project**.
2. Une fois le projet créé, ouvre **SQL Editor** → **New query**, colle le contenu du
   fichier `supabase/schema.sql` fourni ici → **Run**. Cela crée toutes les tables.
3. Va dans **Project Settings > API** et récupère :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (⚠️ secrète, ne jamais l'exposer côté client) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Configurer Fapshi

1. Dans ton dashboard Fapshi, récupère `apiuser` et `apikey` (sandbox pour tester, live pour encaisser).
2. Renseigne `FAPSHI_API_USER`, `FAPSHI_API_KEY`, `FAPSHI_ENV=sandbox` (puis `live` plus tard).
3. Une fois le site déployé (étape 4), configure dans le dashboard Fapshi l'URL de webhook :
   `https://ton-domaine.com/api/fapshi/webhook`
   et note le secret de webhook si tu en définis un → `FAPSHI_WEBHOOK_SECRET`.

## 3. Variables d'environnement

Copie `.env.example` vers `.env.local` et remplis toutes les valeurs, y compris :
- `ADMIN_PASSWORD` : le mot de passe pour accéder à `/sen`
- `ADMIN_SESSION_SECRET` : une longue chaîne aléatoire (ex: génère avec `openssl rand -hex 32`)

## 4. Installer et lancer en local

```bash
npm install
npm run dev
```

Le site est disponible sur `http://localhost:3000`, l'admin sur `http://localhost:3000/sen`.

⚠️ Le webhook Fapshi ne peut pas atteindre `localhost`. Pour tester les paiements en local,
utilise un tunnel comme [ngrok](https://ngrok.com) et configure temporairement cette URL
comme webhook dans le dashboard Fapshi.

## 5. Déployer sur Vercel (recommandé, gratuit)

1. Pousse ce projet sur un dépôt GitHub.
2. Va sur [vercel.com](https://vercel.com) → **Add New Project** → importe le dépôt.
3. Dans les paramètres du projet, ajoute toutes les variables de `.env.local`.
4. Déploie. Récupère l'URL finale (ex: `https://african-talents.vercel.app`) et mets-la
   comme URL de webhook dans Fapshi (étape 2.3).

## 6. Ajouter tes candidats

Va sur `/sen`, connecte-toi avec `ADMIN_PASSWORD`, puis utilise le formulaire
"Ajouter un candidat". Un lien direct est généré automatiquement pour chaque
candidat (`/candidat/nom-du-candidat`) — utilise le bouton "Copier le lien"
pour le partager.

## Comment fonctionne un vote

1. L'électeur ouvre le lien direct d'un candidat, choisit un nombre de paquets de 10 votes.
2. Il est redirigé vers une page de paiement Fapshi (Mobile Money / Orange Money).
3. Fapshi notifie le site via webhook dès que le paiement est confirmé → les votes
   sont crédités automatiquement et apparaissent dans le classement.
4. En secours, la page de retour (`/merci`) revérifie aussi le statut auprès de
   Fapshi si le webhook met du temps à arriver.

## Notes de sécurité

- Le mot de passe admin protège uniquement `/sen/dashboard` (via `middleware.ts`).
  Pour une sécurité renforcée, tu peux migrer plus tard vers un vrai login
  (email + mot de passe via Supabase Auth).
- La clé `service_role` de Supabase et les clés Fapshi ne sont utilisées que dans
  les routes API (côté serveur) — jamais exposées au navigateur.
- Toute modification de votes passe par le backend ; le classement affiché
  provient toujours de la base de données, jamais d'un calcul côté client.

## Le logo

Le logo que tu as fourni est déjà placé dans `public/logo.jpg` et utilisé dans
l'en-tête et la page d'accueil. Remplace ce fichier si tu veux en changer.
