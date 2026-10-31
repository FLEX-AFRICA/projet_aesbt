"use client";

import { CircleCheck, Eye, EyeOff, MoreHorizontal, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDialog } from "@/components/ui-aesbt/StatusDialog";

import {
  ChampFormulaire,
  ChampSuggere,
  classeChamp,
  TableauDonnees,
  TiroirFormulaire,
} from "../_kit";
import type { Colonne } from "../_kit";
import { Indicateur } from "../_gestion/Indicateur";
import { BarreOutils } from "../_commun/BarreOutils";
import { useEnregistrement } from "../_commun/useEnregistrement";
import { nullSiVide, valider } from "../_commun/validation";
import {
  creerFiliereAdmin,
  creerNiveauAdmin,
  creerUniversiteAdmin,
  modifierFiliere,
  modifierNiveau,
  modifierUniversite,
} from "./actions";
import type { FiliereRef, NiveauRef, OngletRef, UniversiteRef } from "./onglets";

/** Valeurs renseignées, sans doublon, triées : suggestions de saisie. */
function distinctes(valeurs: (string | null)[]): string[] {
  return [...new Set(valeurs.filter((v): v is string => Boolean(v?.trim())))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

/** Entrée technique du jeu de départ : proposée par défaut dans les formulaires. */
function NoteTechnique() {
  return <p className="text-[12px] text-muted-ink">Entrée technique du jeu de départ</p>;
}

function EtatActif({ actif }: { actif: boolean }) {
  return (
    <Indicateur icone={actif ? CircleCheck : EyeOff} ton={actif ? "vert" : "gris"}>
      {actif ? "Active" : "Désactivée"}
    </Indicateur>
  );
}

function Actions({
  nom,
  onModifier,
  bascule,
}: {
  nom: string;
  onModifier: () => void;
  /** Active ou désactive l'entrée ; absent pour les niveaux. */
  bascule?: {
    actif: boolean;
    basculer: (actif: boolean) => Promise<{ ok: boolean; message?: string }>;
  };
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions pour ${nom}`}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-ink transition-colors hover:bg-frost-deep/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40 data-[state=open]:bg-frost-deep/50 data-[state=open]:text-ink"
          >
            <MoreHorizontal aria-hidden="true" className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={onModifier}>
            <Pencil aria-hidden="true" className="size-4" />
            Modifier
          </DropdownMenuItem>
          {bascule ? (
            <DropdownMenuItem
              onSelect={async () => {
                const r = await bascule.basculer(!bascule.actif);
                if (r.ok) router.refresh();
                else setErreur(r.message ?? "Modification impossible.");
              }}
            >
              {bascule.actif ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
              {bascule.actif ? "Désactiver" : "Activer"}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <StatusDialog
        open={erreur !== null}
        onOpenChange={(ouvert) => {
          if (!ouvert) setErreur(null);
        }}
        variant="error"
        title="Action impossible"
        description={erreur ?? undefined}
      />
    </>
  );
}

const champOrdre = z.string().regex(/^\d{1,3}$/, "Saisissez un nombre entre 0 et 999.");

// --- Filières ---------------------------------------------------------------

const schemaFiliere = z.object({
  nom: z.string().trim().min(2, "Au moins 2 caractères.").max(120, "120 caractères au plus."),
  domaine: z.string().trim().max(80, "80 caractères au plus."),
  ordre: champOrdre,
});

function TiroirFiliere({
  filiere,
  domaines,
  onFermer,
}: {
  filiere: FiliereRef | null;
  domaines: string[];
  onFermer: () => void;
}) {
  const router = useRouter();
  const [nom, setNom] = useState(filiere?.nom ?? "");
  const [domaine, setDomaine] = useState(filiere?.domaine ?? "");
  const [ordre, setOrdre] = useState(String(filiere?.ordre ?? 0));
  const [actif, setActif] = useState(filiere ? filiere.actif === 1 : true);
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  const enregistrer = () => {
    const v = valider(schemaFiliere, { nom, domaine, ordre });
    lancer(
      v.ok ? {} : v.erreurs,
      () => {
        const champs = {
          nom: nom.trim(),
          domaine: nullSiVide(domaine),
          ordre: Number(ordre),
          actif,
        };
        return filiere ? modifierFiliere(filiere.id, champs) : creerFiliereAdmin(champs);
      },
      () => {
        onFermer();
        router.refresh();
      },
    );
  };

  return (
    <TiroirFormulaire
      open
      onOpenChange={(ouvert) => !ouvert && onFermer()}
      titre={filiere ? "Modifier la filière" : "Nouvelle filière"}
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      <ChampFormulaire libelle="Nom" requis erreur={erreursChamps["nom"]}>
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={nom}
            maxLength={120}
            disabled={enCours}
            onChange={(e) => setNom(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Domaine"
        aide="Grand domaine de rattachement : Santé, Ingénierie... La saisie libre reste permise."
        erreur={erreursChamps["domaine"]}
      >
        {(p) => (
          <ChampSuggere
            {...p}
            value={domaine}
            onChange={setDomaine}
            suggestions={domaines}
            maxLength={80}
            disabled={enCours}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Ordre d'affichage"
        aide="Les plus petits nombres apparaissent en premier."
        erreur={erreursChamps["ordre"]}
      >
        {(p) => (
          <input
            {...p}
            type="number"
            min={0}
            max={999}
            className={classeChamp}
            value={ordre}
            disabled={enCours}
            onChange={(e) => setOrdre(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <label className="flex items-center gap-2 text-[14px] text-ink">
        <input
          type="checkbox"
          checked={actif}
          disabled={enCours}
          onChange={(e) => setActif(e.target.checked)}
          className="size-4"
        />
        Proposée dans les formulaires
      </label>
    </TiroirFormulaire>
  );
}

function OngletFiliere({ filieres }: { filieres: FiliereRef[] }) {
  const [edition, setEdition] = useState<FiliereRef | "nouveau" | null>(null);
  const domaines = distinctes(filieres.map((f) => f.domaine));

  const colonnes: Colonne<FiliereRef>[] = [
    {
      cle: "nom",
      titre: "Filière",
      valeurTri: (f) => f.nom,
      rendu: (f) => (
        <div className="min-w-[12rem]">
          <p className="font-medium text-ink">{f.nom}</p>
          {f.slug === "autre" ? <NoteTechnique /> : null}
        </div>
      ),
    },
    {
      cle: "domaine",
      titre: "Domaine",
      valeurTri: (f) => f.domaine,
      rendu: (f) => f.domaine ?? "Non renseigné",
    },
    { cle: "ordre", titre: "Ordre", valeurTri: (f) => f.ordre },
    {
      cle: "etat",
      titre: "État",
      valeurTri: (f) => f.actif,
      rendu: (f) => <EtatActif actif={f.actif === 1} />,
    },
    {
      cle: "actions",
      titre: "",
      classe: "w-14 text-right",
      rendu: (f) => (
        <Actions
          nom={f.nom}
          onModifier={() => setEdition(f)}
          bascule={{ actif: f.actif === 1, basculer: (actif) => modifierFiliere(f.id, { actif }) }}
        />
      ),
    },
  ];

  return (
    <>
      <BarreOutils libelle="Nouvelle filière" onClick={() => setEdition("nouveau")} />
      <TableauDonnees
        legende="Filières"
        lignes={filieres}
        colonnes={colonnes}
        idLigne={(f) => f.id}
        rechercheTexte={(f) => `${f.nom} ${f.domaine ?? ""}`}
        libelleRecherche="Rechercher une filière"
        taillePage={25}
        vide={{ titre: "Aucune filière", description: "Créez la première filière." }}
      />
      {edition !== null ? (
        <TiroirFiliere
          key={edition === "nouveau" ? "nouveau" : edition.id}
          filiere={edition === "nouveau" ? null : edition}
          domaines={domaines}
          onFermer={() => setEdition(null)}
        />
      ) : null}
    </>
  );
}

// --- Universités ------------------------------------------------------------

const schemaUniversite = z.object({
  nom: z.string().trim().min(2, "Au moins 2 caractères.").max(160, "160 caractères au plus."),
  ville: z.string().trim().max(80, "80 caractères au plus."),
  site_web: z
    .string()
    .trim()
    .max(300, "300 caractères au plus.")
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "Adresse complète commençant par https://.",
    ),
  ordre: champOrdre,
});

function TiroirUniversite({
  universite,
  villes,
  onFermer,
}: {
  universite: UniversiteRef | null;
  villes: string[];
  onFermer: () => void;
}) {
  const router = useRouter();
  const [nom, setNom] = useState(universite?.nom ?? "");
  const [ville, setVille] = useState(universite?.ville ?? "");
  const [siteWeb, setSiteWeb] = useState(universite?.site_web ?? "");
  const [ordre, setOrdre] = useState(String(universite?.ordre ?? 0));
  const [actif, setActif] = useState(universite ? universite.actif === 1 : true);
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  const enregistrer = () => {
    const v = valider(schemaUniversite, { nom, ville, site_web: siteWeb, ordre });
    lancer(
      v.ok ? {} : v.erreurs,
      () => {
        const champs = {
          nom: nom.trim(),
          ville: nullSiVide(ville),
          site_web: nullSiVide(siteWeb),
          ordre: Number(ordre),
          actif,
        };
        return universite
          ? modifierUniversite(universite.id, champs)
          : creerUniversiteAdmin(champs);
      },
      () => {
        onFermer();
        router.refresh();
      },
    );
  };

  return (
    <TiroirFormulaire
      open
      onOpenChange={(ouvert) => !ouvert && onFermer()}
      titre={universite ? "Modifier l'université" : "Nouvelle université"}
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      <ChampFormulaire libelle="Nom" requis erreur={erreursChamps["nom"]}>
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={nom}
            maxLength={160}
            disabled={enCours}
            onChange={(e) => setNom(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire libelle="Ville" erreur={erreursChamps["ville"]}>
        {(p) => (
          <ChampSuggere
            {...p}
            value={ville}
            onChange={setVille}
            suggestions={villes}
            maxLength={80}
            disabled={enCours}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Site web"
        aide="Adresse complète commençant par https://."
        erreur={erreursChamps["site_web"]}
      >
        {(p) => (
          <input
            {...p}
            type="url"
            inputMode="url"
            className={classeChamp}
            value={siteWeb}
            maxLength={300}
            disabled={enCours}
            onChange={(e) => setSiteWeb(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Ordre d'affichage"
        aide="Les plus petits nombres apparaissent en premier."
        erreur={erreursChamps["ordre"]}
      >
        {(p) => (
          <input
            {...p}
            type="number"
            min={0}
            max={999}
            className={classeChamp}
            value={ordre}
            disabled={enCours}
            onChange={(e) => setOrdre(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <label className="flex items-center gap-2 text-[14px] text-ink">
        <input
          type="checkbox"
          checked={actif}
          disabled={enCours}
          onChange={(e) => setActif(e.target.checked)}
          className="size-4"
        />
        Proposée dans les formulaires
      </label>
    </TiroirFormulaire>
  );
}

function OngletUniversite({ universites }: { universites: UniversiteRef[] }) {
  const [edition, setEdition] = useState<UniversiteRef | "nouveau" | null>(null);
  const villes = distinctes(universites.map((u) => u.ville));

  const colonnes: Colonne<UniversiteRef>[] = [
    {
      cle: "nom",
      titre: "Université",
      valeurTri: (u) => u.nom,
      rendu: (u) => <span className="font-medium text-ink">{u.nom}</span>,
    },
    {
      cle: "ville",
      titre: "Ville",
      valeurTri: (u) => u.ville,
      rendu: (u) => u.ville ?? "Non renseignée",
    },
    { cle: "ordre", titre: "Ordre", valeurTri: (u) => u.ordre },
    {
      cle: "etat",
      titre: "État",
      valeurTri: (u) => u.actif,
      rendu: (u) => <EtatActif actif={u.actif === 1} />,
    },
    {
      cle: "actions",
      titre: "",
      classe: "w-14 text-right",
      rendu: (u) => (
        <Actions
          nom={u.nom}
          onModifier={() => setEdition(u)}
          bascule={{
            actif: u.actif === 1,
            basculer: (actif) => modifierUniversite(u.id, { actif }),
          }}
        />
      ),
    },
  ];

  return (
    <>
      <BarreOutils libelle="Nouvelle université" onClick={() => setEdition("nouveau")} />
      <TableauDonnees
        legende="Universités"
        lignes={universites}
        colonnes={colonnes}
        idLigne={(u) => u.id}
        rechercheTexte={(u) => `${u.nom} ${u.ville ?? ""}`}
        libelleRecherche="Rechercher une université"
        taillePage={25}
        vide={{ titre: "Aucune université", description: "Créez la première université." }}
      />
      {edition !== null ? (
        <TiroirUniversite
          key={edition === "nouveau" ? "nouveau" : edition.id}
          universite={edition === "nouveau" ? null : edition}
          villes={villes}
          onFermer={() => setEdition(null)}
        />
      ) : null}
    </>
  );
}

// --- Niveaux ----------------------------------------------------------------

const schemaNiveau = z.object({
  libelle: z.string().trim().min(1, "Saisissez un libellé.").max(40, "40 caractères au plus."),
  ordre: champOrdre,
});

function TiroirNiveau({ niveau, onFermer }: { niveau: NiveauRef | null; onFermer: () => void }) {
  const router = useRouter();
  const [libelle, setLibelle] = useState(niveau?.libelle ?? "");
  const [ordre, setOrdre] = useState(String(niveau?.ordre ?? 0));
  const { enCours, erreur, erreursChamps, lancer } = useEnregistrement();

  const enregistrer = () => {
    const v = valider(schemaNiveau, { libelle, ordre });
    lancer(
      v.ok ? {} : v.erreurs,
      async () => {
        if (niveau) {
          return modifierNiveau(niveau.id, { libelle: libelle.trim(), ordre: Number(ordre) });
        }
        const cree = await creerNiveauAdmin(libelle.trim());
        // L'ordre saisi s'applique après la création, qui attribue le dernier rang.
        if (cree.ok && cree.id && Number(ordre) > 0) {
          return modifierNiveau(cree.id, { ordre: Number(ordre) });
        }
        return cree;
      },
      () => {
        onFermer();
        router.refresh();
      },
    );
  };

  return (
    <TiroirFormulaire
      open
      onOpenChange={(ouvert) => !ouvert && onFermer()}
      titre={niveau ? "Modifier le niveau" : "Nouveau niveau"}
      onSubmit={enregistrer}
      enCours={enCours}
      erreur={erreur}
    >
      <ChampFormulaire libelle="Libellé" requis erreur={erreursChamps["libelle"]}>
        {(p) => (
          <input
            {...p}
            className={classeChamp}
            value={libelle}
            maxLength={40}
            disabled={enCours}
            onChange={(e) => setLibelle(e.target.value)}
          />
        )}
      </ChampFormulaire>
      <ChampFormulaire
        libelle="Ordre d'affichage"
        aide="Les plus petits nombres apparaissent en premier."
        erreur={erreursChamps["ordre"]}
      >
        {(p) => (
          <input
            {...p}
            type="number"
            min={0}
            max={999}
            className={classeChamp}
            value={ordre}
            disabled={enCours}
            onChange={(e) => setOrdre(e.target.value)}
          />
        )}
      </ChampFormulaire>
    </TiroirFormulaire>
  );
}

function OngletNiveau({ niveaux }: { niveaux: NiveauRef[] }) {
  const [edition, setEdition] = useState<NiveauRef | "nouveau" | null>(null);

  const colonnes: Colonne<NiveauRef>[] = [
    {
      cle: "libelle",
      titre: "Niveau",
      valeurTri: (n) => n.libelle,
      rendu: (n) => (
        <div className="min-w-[12rem]">
          <p className="font-medium text-ink">{n.libelle}</p>
          {n.id === "AUTRE" ? <NoteTechnique /> : null}
        </div>
      ),
    },
    { cle: "code", titre: "Code", valeurTri: (n) => n.id, rendu: (n) => n.id },
    { cle: "ordre", titre: "Ordre", valeurTri: (n) => n.ordre },
    {
      cle: "actions",
      titre: "",
      classe: "w-14 text-right",
      rendu: (n) => <Actions nom={n.libelle} onModifier={() => setEdition(n)} />,
    },
  ];

  return (
    <>
      <BarreOutils libelle="Nouveau niveau" onClick={() => setEdition("nouveau")} />
      <TableauDonnees
        legende="Niveaux"
        lignes={niveaux}
        colonnes={colonnes}
        idLigne={(n) => n.id}
        vide={{ titre: "Aucun niveau", description: "Créez le premier niveau." }}
      />
      {edition !== null ? (
        <TiroirNiveau
          key={edition === "nouveau" ? "nouveau" : edition.id}
          niveau={edition === "nouveau" ? null : edition}
          onFermer={() => setEdition(null)}
        />
      ) : null}
    </>
  );
}

// --- Assemblage -------------------------------------------------------------

export function Referentiels({
  onglet,
  filieres,
  universites,
  niveaux,
}: {
  onglet: OngletRef;
  filieres: FiliereRef[];
  universites: UniversiteRef[];
  niveaux: NiveauRef[];
}) {
  switch (onglet) {
    case "filieres":
      return <OngletFiliere filieres={filieres} />;
    case "universites":
      return <OngletUniversite universites={universites} />;
    case "niveaux":
      return <OngletNiveau niveaux={niveaux} />;
  }
}
