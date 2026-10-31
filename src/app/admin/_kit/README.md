# Kit d'administration standard

Composants communs des écrans de données (albums, événements, membres, etc.).
Import unique : `import { ... } from "../_kit"` (ajuster le chemin relatif).
Les vrais écrans servent d'exemples complets :

| Besoin                                                          | Écran de référence              |
| --------------------------------------------------------------- | ------------------------------- |
| Tableau, tiroir de formulaire, statuts, suppression, couverture | `albums/`, `evenements/`        |
| Liste filtrée par entité et réordonnancement                    | `membres/`                      |
| Édition en ligne dans un tableau                                | `statistiques/`                 |
| Statut restreint (`actionsDisponibles`)                         | `ressources/`                   |
| Gestion d'une liste ordonnée (ajout, légende, ordre)            | `albums/[id]/GestionPhotos.tsx` |

Briques communes aux écrans, hors du kit : `../_commun/` (`serveur.ts` pour les
server actions, `validation.ts` avec zod, `useEnregistrement`, `ActionsLigne`,
`ChampCouverture`, `BarreOutils`, `PageListe`). Chaque section a son `actions.ts`.

## TableauDonnees

Tableau générique : colonnes déclaratives, tri par colonne (si `valeurTri`), recherche
(si `rechercheTexte`), pagination côté client, états vide, chargement et erreur.

```tsx
const colonnes: Colonne<Evenement>[] = [
  { cle: "titre", titre: "Titre", valeurTri: (e) => e.titre },
  { cle: "statut", titre: "Statut", rendu: (e) => <BadgeStatut statut={e.statut} /> },
];

<TableauDonnees
  legende="Événements"
  lignes={evenements}
  colonnes={colonnes}
  idLigne={(e) => e.id}
  rechercheTexte={(e) => e.titre}
  taillePage={10}
  vide={{ titre: "Aucun événement" }}
/>;
```

## BadgeStatut

`<BadgeStatut statut="publie" />` avec `brouillon`, `en_attente`, `publie` ou `archive`.

## TiroirFormulaire et ChampFormulaire

Panneau latéral avec Enregistrer et Annuler. `enCours` verrouille le tiroir, `erreur`
affiche une erreur générale. `ChampFormulaire` relie libellé, aide et erreur de champ.

```tsx
<TiroirFormulaire open={ouvert} onOpenChange={setOuvert} titre="Nouvel événement"
  onSubmit={enregistrer} enCours={enCours} erreur={erreur}>
  <ChampFormulaire libelle="Titre" requis erreur={erreurTitre}>
    {(p) => <input {...p} className={classeChamp} value={titre} onChange={...} />}
  </ChampFormulaire>
</TiroirFormulaire>
```

## SelecteurMedia

Choix d'une image de la médiathèque. La liste vient du serveur : charger avec
`mediasDisponibles()` (`publications/_medias.ts`) dans une page serveur, puis la passer
en prop à un composant client. `name` ajoute un champ caché pour un formulaire natif.

```tsx
<SelecteurMedia libelle="Couverture" medias={medias} valeur={mediaId} onChange={setMediaId} />
```

## BarreActionsStatut

Publier, Archiver, Repasser en brouillon (selon le statut) et Voir sur le site, avec
confirmation et popup d'erreur (StatusDialog). `peutPublier={false}` désactive les
changements de statut (rôle éditeur). `onChangerStatut` renvoie `{ ok, message? }`,
comme les server actions de `actions.ts`.

```tsx
<BarreActionsStatut
  statut={e.statut}
  peutPublier={estAdmin}
  urlSite="/evenements"
  onChangerStatut={(cible) => changerStatutEvenement(e.id, cible)}
/>
```

## EnTetePageAdmin

Titre, description, action principale (lien `href` ou bouton `onClick`), actions
secondaires en `children`.

```tsx
<EnTetePageAdmin
  titre="Événements"
  description="..."
  action={{ libelle: "Nouveau", href: "/admin/evenements/nouveau" }}
/>
```

## ChampSuggere

Champ texte avec liste de suggestions (combobox ARIA). La saisie libre reste TOUJOURS
permise : la liste aide, elle ne contraint pas. Filtrage insensible à la casse et aux
accents, flèches haut et bas, Entrée pour choisir, Échap pour fermer la liste (sans
fermer le tiroir), clic pour choisir.

Props : `value`, `onChange(valeur)`, `suggestions?: readonly string[]`,
`useSuggestions?: () => readonly string[]` (alternative par hook), `placeholder`, `id`,
`required`, `disabled`, `maxLength`, `aria-invalid`, `aria-describedby`, `className`.

Les suggestions viennent de l'API (`GET /api/v1/admin/suggestions?champ=role,lieu`, valeurs
distinctes triées par fréquence). Champs autorisés : `role`, `filiere`, `domaine`,
`universite`, `ville`, `lieu`, `categorie`. Une page serveur les charge, les tiroirs les
reçoivent en props :

```tsx
// page.tsx (serveur)
const suggestions = await chargerSuggestions(["role"]); // ../_commun/suggestions
<ListeMembres suggestions={suggestions} ... />

// TiroirMembre.tsx (client)
<ChampFormulaire libelle="Rôle" requis>
  {(p) => <ChampSuggere {...p} value={role} onChange={setRole} suggestions={suggestions.role} />}
</ChampFormulaire>
```
