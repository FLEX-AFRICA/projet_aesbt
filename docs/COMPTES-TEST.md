# Comptes de test

Jeu de démonstration, créé par `npm run comptes-test` dans le dépôt
`aesbt-api`. Chaque écran a de quoi s'afficher : file de validation non vide,
demandes de mentorat en attente, relation active, propositions à modérer,
signalements, messages de contact.

> **À ne jamais lancer en production.** Le script refuse de s'exécuter si
> `NODE_ENV` vaut `production`, et tous les comptes partagent le même mot de
> passe.

## Démarrer

Trois terminaux.

```bash
# 1. Backend — port 4000
cd aesbt-api
npm run comptes-test     # crée la base de démonstration
npm run dev
```

```bash
# 2. Médias — port 8081
cd aesbt-api
npm run medias
```

```bash
# 3. Frontend — port 3030
cd aesbt-connect-flexhub
npm run dev
```

Le site est sur **http://localhost:3030**. Aucune variable à passer à la
main : elles sont dans `aesbt-connect-flexhub/.env.local` et
`aesbt-api/.env`, tous deux hors versionnement.

Le frontend est sur 3030 et non sur 3000, qui est pris par un conteneur Docker
de la machine de développement. Le port est inscrit en trois endroits qui
doivent rester d'accord : les scripts `dev` et `start` du `package.json`,
`NEXT_PUBLIC_SITE_URL` dans `.env.local`, et `ALLOWED_ORIGINS` plus `SITE_URL`
dans `aesbt-api/.env`. Si l'un diverge, la connexion est refusée par CORS.

Le serveur de médias n'est nécessaire que pour voir les images téléversées.
Next les relaie sous `/medias`, donc aucune adresse absolue n'est à régler.

## Depuis un téléphone du même wifi

Le site est servi sur **http://192.168.11.105:3030** (l'IP du Mac). Rien
d'autre à faire : l'API est ouverte sur le réseau local (`HOST=0.0.0.0`),
l'origine du réseau local est autorisée, et le navigateur du téléphone appelle
l'API sur l'hôte de la page qu'il consulte, pas sur « localhost », qui
désignerait le téléphone lui-même.

Connexion, déconnexion, administration et espace membre fonctionnent donc
comme sur le Mac, où `http://localhost:3030` reste valable.

Si l'adresse ne répond pas :

- l'IP a pu changer (DHCP). La relire avec `ipconfig getifaddr en0`, puis
  reporter la nouvelle valeur dans `ALLOWED_ORIGINS` de `aesbt-api/.env` et
  redémarrer l'API. Le site, lui, répond sur n'importe quelle IP sans réglage.
- le téléphone ne répond pas au `ping` : le mode furtif du pare-feu macOS est
  actif. C'est normal, et sans effet sur le site.
- vérifier que le wifi n'isole pas les clients entre eux (« AP isolation »,
  fréquent sur les réseaux d'hôtel ou les réseaux invités).

## Se connecter, et changer de compte

Le lien **Connexion** est dans l'en-tête du site, à gauche du bouton
Inscription. La page est aussi accessible directement sur
**http://localhost:3030/connexion**.

La redirection suit le rôle du compte :

| Rôle | Destination |
| --- | --- |
| administrateur | `/admin` |
| mentor, étudiant | `/cellule` |

Un compte en attente, refusé ou suspendu part lui aussi vers `/cellule`, où un
écran lui explique sa situation : c'est plus clair qu'une page de connexion qui
refuse sans dire pourquoi.

Si vous arrivez d'une page protégée (`/admin/comptes` par exemple), la
connexion vous y ramène, à condition que votre rôle y ait accès : un étudiant
renvoyé vers `/admin` atterrirait sur un « accès réservé », il part donc vers
son espace.

Pour changer de compte, le bouton **Se déconnecter** est dans l'en-tête des
deux espaces, et sur chacun des écrans qui bloquent l'accès (compte en
attente, suspendu, droits insuffisants).

## Les comptes

Mot de passe commun : **`MotDePasseTest2026!`**

| Adresse | Nom | Rôle | Ce qu'il permet de voir |
| --- | --- | --- | --- |
| `admin@test.aesbt` | Fatou Compaoré | administratrice | Toute l'administration |
| `mentor@test.aesbt` | Ibrahim Sawadogo | mentor | Un accompagnement en cours, coordonnées révélées |
| `mentor2@test.aesbt` | Aminata Kaboré | mentor | Une demande reçue à accepter ou décliner |
| `etudiant@test.aesbt` | Awa Traoré | étudiante | Un accompagnement en cours, côté étudiant |
| `etudiant2@test.aesbt` | Paul Zongo | étudiant | Une demande envoyée, en attente |
| `attente@test.aesbt` | Salif Ouédraogo | étudiant | L'écran « inscription en cours d'examen » |
| `attente2@test.aesbt` | Mariam Sanou | étudiant | Idem, pour tester deux validations |
| `suspendu@test.aesbt` | Compte Suspendu | étudiant | L'écran « compte suspendu » |

## Parcours suggérés

### La règle centrale : les coordonnées

C'est le point le plus important du cahier des charges, et celui qu'il laissait
ouvert.

1. Connectez-vous en `etudiant2@test.aesbt`, allez sur **Trouver un mentor**.
   Aucun téléphone, aucun WhatsApp, aucune adresse e-mail n'apparaît.
2. Connectez-vous en `etudiant@test.aesbt`, allez sur **Mon mentorat**. Les
   coordonnées d'Ibrahim sont là, parce que l'accompagnement est actif.
3. Toujours en `etudiant@test.aesbt`, cliquez **Mettre fin à
   l'accompagnement**. Rechargez : les coordonnées ont disparu, le nom reste.

### Le circuit de validation (F03)

1. En `admin@test.aesbt`, allez sur **Comptes**, onglet **En attente**.
2. Validez Salif, refusez Mariam avec un motif.
3. Vérifiez dans **Journal** que les deux décisions sont consignées.
4. Connectez-vous en `attente@test.aesbt` : l'accès est maintenant ouvert.

### Le circuit de proposition de ressources

1. En `mentor@test.aesbt`, **Ressources** → **Proposer une ressource**.
2. En `admin@test.aesbt`, **Modération** : la proposition attend. Publiez-la ou
   rejetez-la avec un motif.
3. Retour en `mentor@test.aesbt` : le sort de la proposition s'affiche, motif
   compris.

### Le mentorat, côté mentor

1. En `mentor2@test.aesbt`, **Mon mentorat** : la demande de Paul attend.
2. Acceptez : les coordonnées s'ouvrent des deux côtés.
3. Ou déclinez, avec un mot d'explication.

### La rédaction

1. En `admin@test.aesbt`, **Publications** → **Nouveau contenu**.
2. Rédigez, enregistrez en brouillon : rien n'apparaît sur le site public.
3. Publiez : le contenu apparaît sur `/actualites`.
4. Essayez de le supprimer : refusé tant qu'il est en ligne. Archivez d'abord.

### La médiathèque

1. **Médiathèque** → ajoutez une photo. Le texte alternatif est exigé.
2. Utilisez-la comme couverture d'un contenu.
3. Essayez de la supprimer : refusé, avec le détail des usages.

## La double authentification

Elle est **désactivée en développement** (`EXIGER_2FA_ADMIN=false` dans
`aesbt-api/.env`), afin que vous puissiez explorer sans configurer une
application d'authentification.

Pour voir le parcours réel : passez la variable à `true`, redémarrez l'API,
puis connectez-vous en `admin@test.aesbt`. Un écran vous proposera d'activer la
double authentification. **En production, elle doit rester à `true`.**

## Remettre à zéro

```bash
cd aesbt-api
rm -rf data
npm run comptes-test
```
