# Plan de construction AESBT

Document de cadrage technique et de reprise.
Dernière mise à jour : 24 octobre 2026.

Il répond au `Cahier_de_charges_cellule_scientifique.pdf` (exigences F01 à
F61) et l'étend à la gestion de l'ensemble du site, pas seulement de la
rubrique « Cellule Scientifique ».

---

## 1. Architecture

### 1.1 Deux dépôts

Le frontend tient dans le palier gratuit de Vercel, le backend reste
auto-hébergé sur le VPS de l'association.

```
aesbt.org        →  Vercel        aesbt-connect-flexhub (ce dépôt)
api.aesbt.org    →  VPS / Caddy   aesbt-api
media.aesbt.org  →  VPS / Caddy   volume des médias
```

Les trois noms partagent le même domaine enregistrable, donc le navigateur
les considère « same-site ». Le cookie de session circule normalement :

```
Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Domain=.aesbt.org; Path=/
```

C'est la raison pour laquelle le domaine propre est une dépendance technique
et non un confort. Sur `*.vercel.app`, Safari et Chrome bloqueraient le
cookie.

### 1.2 Pile

| Couche | Choix |
| --- | --- |
| Frontend | Next.js 16, App Router, React 19 |
| UI | Tailwind CSS 4, shadcn/ui, Radix |
| Hébergement frontend | Vercel, palier gratuit |
| Backend | Node.js 24 LTS, Fastify 5 |
| Base | SQLite (`better-sqlite3`), mode WAL |
| Accès données | Kysely |
| Authentification | Better Auth 1.7, argon2id |
| Images | sharp |
| Conteneurisation | Docker Compose |
| Reverse proxy, TLS | Caddy |
| Sauvegardes | Litestream vers Cloudflare R2 |
| Supervision | Uptime Kuma |

Aucun abonnement payant. Seul coût récurrent : le nom de domaine.

### 1.3 Volume de données

```
/data                      volume Docker, disque LOCAL du VPS
├── db/aesbt.db            SQLite en mode WAL
└── media/AAAA/MM/
    ├── <uuid>.webp        2000 px
    ├── <uuid>-md.webp     1200 px
    └── <uuid>-thumb.webp  400 px
```

Les octets des médias vivent sur le volume, jamais dans la base, afin
qu'elle reste de quelques mégaoctets et donc répliquable en continu.

Contrainte impérative : disque **local**. SQLite ne supporte ni NFS ni CIFS,
dont le verrouillage de fichiers est défaillant, et la base serait corrompue.

---

## 2. Frontend : fait

- [x] Next.js 16 App Router, TypeScript strict, Tailwind 4
- [x] Toutes les pages publiques portées : accueil, association, actualités
      (liste et détail), galerie (albums et visionneuse), ressources,
      événements, contact, inscription
- [x] Métadonnées, Open Graph et URL canoniques par page : un lien partagé
      sur Facebook ou WhatsApp affiche un aperçu complet
- [x] `sitemap.xml` et `robots.txt` générés depuis les données
- [x] Polices auto-hébergées par `next/font`, aucun appel à Google Fonts
- [x] Pages d'erreur et 404 en français, `lang="fr"`
- [x] Sept pages de prototypage conservées en `noindex`, hors plan du site
      (voir `PROTOTYPES.md`)
- [x] Aucune dépendance héritée de l'outillage précédent
- [x] 0 vulnérabilité, 0 erreur de type, 0 erreur de lint

### Dette technique relevée

Six fichiers d'animation portent une directive `@ts-nocheck` : ils violent
`noUncheckedIndexedAccess` et `exactOptionalPropertyTypes`, pour 68 cas au
total. Ces violations n'avaient jamais été visibles car la construction
précédente ne lançait pas `tsc`, contrairement à celle de Next.

- `src/components/kokonutui/flow-field.tsx`
- `src/components/kokonutui/halftone-background.tsx`
- `src/components/kokonutui/lightbox-grid.tsx`
- `src/components/kokonutui/card-stack.tsx`
- `src/components/hero-lab/mascots/registry.ts`
- `src/components/ui/case-study-flip-stack.tsx`

À résorber fichier par fichier. Les quatre premiers viennent du registre
Kokonut UI et doivent rester réinstallables par la CLI shadcn.

---

## 3. Frontend : reste à faire

- [x] Pages publiques branchées sur l'API, en composants serveur, avec repli
      sur les données locales si l'API n'est pas configurée
- [x] Régénération déclenchée par le webhook du backend à la publication
- [x] Back-office `/admin` : tableau de bord, validation des comptes,
      modération, publications, messages, paramètres
- [x] Connexion avec étape TOTP
- [x] Rédaction et modification de contenu, avec sélecteur de couverture et
      publication différée
- [x] Médiathèque : téléversement, aperçu, suppression protégée
- [x] Activation de la double authentification, hors du layout
      d'administration pour ne pas s'auto-exclure
- [x] Journal d'audit consultable et paginé
- [x] Espace membre `/cellule` : accueil, recherche de mentors, demandes,
      relations avec révélation des coordonnées, ressources, profil
- [x] Écrans distincts pour chaque statut bloquant (en attente, refusé,
      suspendu) plutôt qu'une redirection en boucle
- [ ] Images servies depuis `media.aesbt.org` en `srcset` explicite, avec
      `images.unoptimized` : les dérivés sont déjà produits par le backend,
      l'optimisation Vercel ferait double emploi et consommerait le quota
- [ ] Données structurées JSON-LD, flux RSS des actualités
- [ ] Recette : parcours complet, mobile, aperçus sociaux, Lighthouse

---

## 4. Backend

L'avancement détaillé, lot par lot, vit dans le README du dépôt `aesbt-api`.
Résumé :

| Lot | Objet | État |
| --- | --- | --- |
| B0 | Socle, sécurité, Docker, sauvegardes | fait |
| B1 | Comptes et authentification (F01 à F05) | fait |
| B2 | Mentorat (F10 à F14) | fait |
| B3 | Ressources (F20 à F23) et référentiels | fait |
| B4 | Publications (F30, F31, F41 à F43, F51, F52, F61) | fait |
| B5 | Médias | fait |
| B6 | Reprise du contenu du site, branchement du frontend | fait |
| B7 | Back-office et espace membre | fait |

---

## 5. Arbitrages à faire trancher par la cellule scientifique

Ces points bloquent la conception et ne figurent pas au cahier des charges.

| # | Question | Impact si non tranché | État |
| --- | --- | --- | --- |
| 1 | Après acceptation d'une demande, **comment le mentor et l'étudiant se contactent-ils** ? | Le critère d'acceptation n°1 serait satisfait sans rendre aucun service | **tranché** : coordonnées révélées aux deux parties pendant la relation active uniquement |
| 2 | **Référentiel des filières, universités et matières** : qui fournit la liste initiale ? | F10, F11, F21 et F22 irréalisables sans elle | **débloqué** : saisissable depuis l'administration ; amorce de 12 filières en place, liste officielle attendue |
| 3 | **Sur quel critère un administrateur valide-t-il une inscription** ? | L'administrateur est bloqué dès la première demande | ouvert |
| 4 | **Volumétrie attendue** : 50, 500 ou 2000 étudiants ? | Conditionne le dimensionnement | ouvert |
| 5 | **Dépôt de fichiers PDF** pour les ressources : version 1 ou 2 ? | Déterminé par défaut à la version 2 | ouvert |
| 6 | **Annonces (F30) et rubrique Événements** : une seule source ou deux ? | Risque de deux systèmes concurrents | ouvert |
| 7 | **Capacité maximale** de mentorés par mentor ? | Un mentor populaire recevrait des dizaines de demandes | **tranché** : réglable par chaque mentor, 3 par défaut |
| 8 | Sort des sept pages de prototypage | Périmètre de maintenance | ouvert, voir `PROTOTYPES.md` |
| 9 | Un étudiant peut-il accumuler plusieurs mentors, et jusqu'à combien ? | Aucune limite aujourd'hui | ouvert |

---

## 6. Critères d'acceptation

Le §9 du cahier des charges ne couvrait ni les annonces, ni l'excellence, ni
les actualités scientifiques, ni la réinitialisation de mot de passe. Liste
complétée, avec l'état de chaque point.

| Critère | État |
| --- | --- |
| Un étudiant s'inscrit, reçoit un e-mail de vérification, et reste en attente | fait |
| Un administrateur valide ou refuse avec motif, et le demandeur est notifié | fait |
| Un étudiant recherche un mentor par filière et lui envoie une demande | fait |
| Un mentor accepte, et les coordonnées deviennent visibles des deux parties seules | fait |
| Une demande sans réponse expire automatiquement | fait |
| Une relation peut être clôturée par l'une ou l'autre partie | fait |
| Un utilisateur signale un comportement inapproprié, un administrateur le traite | fait |
| Les ressources sont consultables et filtrables par filière, matière et niveau | fait |
| Un mentor propose une ressource, un administrateur la valide ou la rejette | fait |
| Un administrateur gère le cycle de vie de chaque type de contenu | fait |
| Un étudiant réinitialise son mot de passe par e-mail | fait |
| Un compte administrateur peut activer la double authentification | fait |
| Toute action administrateur apparaît au journal d'audit | fait |
| Un utilisateur exporte puis supprime ses données personnelles | fait |
| L'interface est utilisable sur mobile, tablette et ordinateur | fait |
| La double authentification est **imposée** aux administrateurs | fait |
| Une restauration de sauvegarde a été testée et documentée | **à faire avant la mise en production** |
