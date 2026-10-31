# Pages de prototypage à arbitrer

Explorations de design conservées en ligne pour que tu puisses les comparer
en vrai avant de décider lesquelles garder.

Toutes sont en **`noindex, nofollow`** et **absentes du plan du site**
(`sitemap.xml`) : elles ne seront ni référencées par Google, ni proposées en
aperçu sur les réseaux sociaux. Elles ne sont liées depuis aucune page
publique, il faut en connaître l'adresse.

En local : `npm run dev`, puis les adresses ci-dessous sur
`http://localhost:9000`.

## La liste

| # | Adresse | Ce que c'est | Composant principal |
| --- | --- | --- | --- |
| 1 | `/version-1` | Immersif, épuré centré | `hero-lab/LabPage` (`layout="epure"`) |
| 2 | `/version-2` | Immersif, infos aux coins | `hero-lab/LabPage` (`layout="coins"`) |
| 3 | `/version-3` | Immersif, asymétrique | `hero-lab/LabPage` (`layout="asymetrique"`) |
| 4 | `/version-4` | Variante sobre et rapide, sans animation au défilement | `ui-v2/LandingV2` |
| 5 | `/anim-lab` | Comparaison des carrousels photo 3D en CSS pur (Reel, Belt, Spiral, Tunnel) | `hero-lab/PhotoReel`, `hero-lab/PhotoRing` |
| 6 | `/apercu-fenetre` | Les 3 versions de « Fenêtre de l'étudiant », à la suite | `FenetreBandDeck`, `FenetreBandGallery`, `FenetreBandFlip` |
| 7 | `/accueil-classique` | Variante classique de l'accueil, avec scène 3D | `immersive/ClientHeroScene` + sections |

La page d'accueil réellement en service est `/`, rendue par
`hero-lab/AuroraPage`. C'est à elle que les 7 pages ci-dessus doivent être
comparées.

## Décisions attendues

Pour chaque ligne : **garder**, **fusionner dans l'accueil**, ou **supprimer**.

Trois regroupements rendent l'arbitrage plus simple :

- **Versions 1 à 4** : quatre mises en page concurrentes pour l'accueil. Il
  n'en faut vraisemblablement qu'une, ou aucune si `/` convient.
- **`/apercu-fenetre`** : page de comparaison explicitement temporaire, créée
  pour choisir entre trois traitements de « Fenêtre de l'étudiant ». Une fois
  le choix fait, la page disparaît et seul le composant retenu survit.
- **`/anim-lab`** : atelier technique, sans contenu éditorial.

## Ce que coûte le maintien

Rien en production : ces pages sont pré-générées en statique, ne sont liées
nulle part et n'apparaissent pas au référencement.

Le coût est en maintenance. Les composants qu'elles mobilisent
(`hero-lab/`, `ui-v2/`, `immersive/`, `kokonutui/`) pèsent l'essentiel des
dépendances d'animation du projet : framer-motion, anime.js, lenis, three.js
et `@react-three/drei`. Quatre des six fichiers en dette `@ts-nocheck`
(section A-bis de `PLAN.md`) ne servent qu'à ces prototypes.

Autrement dit : trancher permettra sans doute de retirer des dépendances et
une partie de la dette technique. Rien ne presse.

## Suppression d'une page

Supprimer son dossier sous `src/app/(prototypes)/`, puis vérifier avec
`npx eslint .` et `npx tsc --noEmit` si les composants qu'elle utilisait
deviennent orphelins.
