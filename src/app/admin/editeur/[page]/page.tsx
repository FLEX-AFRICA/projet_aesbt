import type { Metadata } from "next";
import Link from "next/link";

import { peutEditerContenus, sessionCourante } from "@/lib/api-admin";

import { EditeurVisuel } from "../_composants/EditeurVisuel";
import { lireChamps } from "../_lib/champs";
import { lireDetail } from "../_lib/detail";
import { pageEditable } from "../_lib/pages";
import { chargerMedias, chargerPage, chargerSoumission } from "../_lib/serveur";

export const metadata: Metadata = { title: "Éditeur visuel" };

function Message({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-medium text-ink">{titre}</h1>
        <p className="mt-3 text-[15px] text-muted-ink">{texte}</p>
        <Link
          href="/admin/editeur"
          className="mt-6 inline-block rounded-md bg-accent-blue px-4 py-2.5 text-[14px] font-semibold text-primary-foreground"
        >
          Retour aux pages éditables
        </Link>
      </div>
    </div>
  );
}

/** Éditeur visuel d'une page de marque (écran pleine hauteur, sans cadre d'administration). */
export default async function EditeurPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;

  const session = await sessionCourante();
  if (!peutEditerContenus(session)) {
    return <Message titre="Accès refusé" texte="Votre compte ne peut pas modifier les contenus." />;
  }

  const definition = pageEditable(page);
  if (!definition) {
    return (
      <Message
        titre="Page inconnue"
        texte="Cette page n'est pas éditable avec l'éditeur visuel, ou son aperçu n'existe pas encore."
      />
    );
  }

  const chargement = await chargerPage(page);
  if (chargement.statut === "inconnue") {
    return <Message titre="Page inconnue" texte="L'API ne connaît pas cette page." />;
  }
  if (chargement.statut === "erreur") {
    return <Message titre="Chargement impossible" texte={chargement.message} />;
  }

  const champs = lireChamps(chargement.reponse);
  if (!champs) {
    return <Message titre="Réponse inattendue" texte="L'API a renvoyé des données illisibles." />;
  }

  const detail = lireDetail(chargement.reponse, champs);
  if (!detail) {
    return <Message titre="Réponse inattendue" texte="L'API a renvoyé des données illisibles." />;
  }

  const [medias, soumission] = await Promise.all([
    chargerMedias(session.role),
    chargerSoumission(page),
  ]);

  return (
    <EditeurVisuel
      page={page}
      titre={definition.titre}
      champs={champs}
      medias={medias}
      estAdmin={session.role === "admin"}
      detail={detail}
      soumission={soumission}
    />
  );
}
