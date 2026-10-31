import { Images } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/ui-aesbt/States";
import { chargerAlbums, chargerEvenementsLiables, chargerImages } from "@/lib/api-admin-galerie";
import { cn } from "@/lib/utils";

import { EnTetePageAdmin } from "../_kit";
import { PageListe } from "../_commun/PageListe";
import { estAdministrateur } from "../_commun/serveur";
import { mediasDisponibles } from "../publications/_medias";
import { GrilleAlbums } from "./GrilleAlbums";
import { VueImages } from "./VueImages";

export const metadata = { title: "Galerie" };

const ONGLETS = [
  { cle: "albums", libelle: "Albums", href: "/admin/galerie" },
  { cle: "images", libelle: "Toutes les images", href: "/admin/galerie?vue=images" },
] as const;

export default async function GaleriePage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string | string[] }>;
}) {
  const { vue } = await searchParams;
  const vueImages = vue === "images";

  return (
    <div>
      <EnTetePageAdmin
        icone={Images}
        titre="Galerie"
        description="Les albums photo de l'association, publiés sur le site une fois prêts. Un album a un nom, des photos, et peut être lié à un événement."
      />

      <nav aria-label="Vues de la galerie" className="mt-6 flex gap-1 border-b border-line">
        {ONGLETS.map((o) => {
          const actif = (o.cle === "images") === vueImages;
          return (
            <Link
              key={o.cle}
              href={o.href}
              {...(actif ? { "aria-current": "page" as const } : {})}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40",
                actif
                  ? "border-accent-blue text-accent-blue"
                  : "border-transparent text-muted-ink hover:text-ink",
              )}
            >
              {o.libelle}
            </Link>
          );
        })}
      </nav>

      <p className="mt-4 max-w-[75ch] rounded-lg bg-surface/60 px-4 py-3 text-[13px] leading-relaxed text-muted-ink">
        {vueImages
          ? "Cette bibliothèque contient tous les fichiers téléversés. Elle sert aussi aux couvertures et aux pages du site, pas seulement aux albums : supprimer un album ne supprime jamais ses images."
          : "Un album regroupe des photos sous un nom. Vous pouvez y ajouter des photos directement ou les choisir dans la bibliothèque d'images, qui sert aussi aux couvertures et aux pages du site."}
      </p>

      {vueImages ? <ContenuImages /> : <ContenuAlbums />}
    </div>
  );
}

async function ContenuAlbums() {
  const [{ donnees, erreur }, medias, evenements, admin] = await Promise.all([
    chargerAlbums(),
    mediasDisponibles(),
    chargerEvenementsLiables(),
    estAdministrateur(),
  ]);

  return (
    <PageListe erreur={erreur}>
      <GrilleAlbums
        albums={donnees ?? []}
        medias={medias}
        evenements={evenements}
        peutPublier={admin}
      />
    </PageListe>
  );
}

async function ContenuImages() {
  const { donnees, erreur } = await chargerImages();
  return (
    <div className="mt-8">
      {erreur || !donnees ? (
        <ErrorState message={erreur ?? "Les images n'ont pas pu être chargées."} />
      ) : (
        <VueImages images={donnees} />
      )}
    </div>
  );
}
