import Link from "next/link";
import { notFound } from "next/navigation";

import { ErrorState } from "@/components/ui-aesbt/States";
import { chargerAlbum, chargerEvenementsLiables } from "@/lib/api-admin-galerie";

import { estAdministrateur } from "../../_commun/serveur";
import { mediasDisponibles } from "../../publications/_medias";
import { EnTeteAlbum } from "./EnTeteAlbum";
import { GestionPhotos } from "./GestionPhotos";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { donnees } = await chargerAlbum(id);
  return { title: donnees?.titre ?? "Album" };
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ donnees, erreur, introuvable }, medias, evenements, admin] = await Promise.all([
    chargerAlbum(id),
    mediasDisponibles(),
    chargerEvenementsLiables(),
    estAdministrateur(),
  ]);

  if (introuvable) notFound();

  return (
    <div>
      <Link
        href="/admin/galerie"
        className="text-[13px] font-semibold text-accent-blue hover:underline"
      >
        Retour à la galerie
      </Link>
      {erreur || !donnees ? (
        <div className="mt-6">
          <ErrorState message={erreur ?? "L'album n'a pas pu être chargé."} />
        </div>
      ) : (
        <>
          <EnTeteAlbum
            album={donnees}
            medias={medias}
            evenements={evenements}
            peutPublier={admin}
          />
          <GestionPhotos
            key={donnees.id}
            album={donnees}
            photosInitiales={donnees.photos}
            medias={medias}
          />
        </>
      )}
    </div>
  );
}
