# AESBT — site web

Site officiel de l'**Association des Étudiants et Stagiaires Burkinabè en Tunisie** (AESBT).

Il présente l'association et sa vie communautaire : présentation et bureau,
actualités, galerie photos, centre de ressources (guides d'installation,
démarches, études en Tunisie), agenda des événements et formulaire de contact.
Il hébergera également la rubrique « Cellule Scientifique » : mentorat entre
étudiants et partage de ressources académiques.

> 🚧 **Projet en construction.** Le contenu et le design évoluent encore. Les
> coordonnées officielles, réseaux sociaux et chiffres restent à confirmer par
> l'association (emplacements marqués `TODO` dans `src/config/site.ts`) :
> aucune donnée n'est inventée.

## Architecture

Le projet est séparé en deux dépôts, pour que le frontend tienne dans le
palier gratuit de Vercel pendant que le backend reste auto-hébergé.

```
aesbt.org        →  Vercel        ce dépôt (Next.js)
api.aesbt.org    →  VPS / Caddy   ../aesbt-api (Fastify + SQLite)
media.aesbt.org  →  VPS / Caddy   volume des médias
```

Le backend vit dans [`../aesbt-api`](../aesbt-api). Les pages publiques le
lisent dès que `NEXT_PUBLIC_API_URL` est renseignée ; sans elle, le site
retombe sur les données locales de `src/data/` et le build aboutit quand
même.

## Pile

- **Next.js 16** (App Router), React 19
- TypeScript strict, Tailwind CSS v4
- Composants Radix UI / shadcn, registres Kokonut UI et Componentry
- Animations : framer-motion, anime.js, lenis, three.js
- Contenu éditorial dans `src/data/`, configuration centrale dans
  `src/config/site.ts`

Les lectures de données se font dans des composants serveur ; aucune
bibliothèque de requêtes côté client n'est nécessaire.

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # si le fichier n'existe pas encore
npm run dev        # http://localhost:3030
npm run build      # build de production
npm run start      # servir le build sur le port 3030
npm run typecheck  # contrôle de types
npm run lint
```

Node.js 24 recommandé.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site, base des URL canoniques et Open Graph |
| `NEXT_PUBLIC_API_URL` | URL de l'API (`https://api.aesbt.org`, `http://localhost:4000` en local) |
| `NEXT_PUBLIC_MEDIA_URL` | URL des médias (`https://media.aesbt.org`) |

Sans `NEXT_PUBLIC_SITE_URL`, les URL canoniques pointent vers `localhost:3030`.

En développement, ces valeurs vivent dans `.env.local`, lu automatiquement par
Next. Sur Vercel, elles se renseignent dans les réglages du projet.

> Ces variables sont lues en **notation point** (`process.env.NEXT_PUBLIC_API_URL`)
> et non en notation crochets : Next ne remplace que la première au moment du
> build, et une référence en crochets arriverait vide dans le navigateur. Les
> clés sont déclarées dans `src/env.d.ts` pour que la notation point passe le
> contrôle de types.

## Structure

```
src/
├── app/                   routes Next.js (App Router)
│   ├── layout.tsx         métadonnées globales, polices auto-hébergées
│   ├── page.tsx           accueil
│   ├── actualites/        liste et détail
│   ├── galerie/           albums et visionneuse
│   ├── ressources/        centre de ressources
│   ├── association/, evenements/, contact/, inscription/
│   ├── admin/             back-office (tableau de bord, modération, rédaction)
│   ├── cellule/           espace membre (mentorat, ressources, profil)
│   ├── connexion/, securite/
│   ├── (prototypes)/      explorations de design, en noindex
│   ├── sitemap.ts, robots.ts
├── components/            composants d'affichage, indépendants du routage
├── config/site.ts         configuration centrale
├── data/                  contenu éditorial (provisoire)
├── lib/                   utilitaires
└── styles.css             design system Tailwind (jetons en oklch)
```

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) : plan de construction et arbitrages en
  attente
- [`docs/PROTOTYPES.md`](docs/PROTOTYPES.md) : pages de design à arbitrer
- [`docs/GUIDE-ADMINISTRATEUR.md`](docs/GUIDE-ADMINISTRATEUR.md) : guide
  d'utilisation pour le bureau
- [`docs/COMPTES-TEST.md`](docs/COMPTES-TEST.md) : comptes de démonstration et
  parcours à essayer
- [`AGENTS.md`](AGENTS.md) : conventions pour les registres de composants

## Référencement

Chaque page porte ses métadonnées, ses balises Open Graph et son URL
canonique. Le plan du site et `robots.txt` sont générés depuis les données.
Les pages de prototypage sont en `noindex` et absentes du plan du site.
