import { UserRound } from "lucide-react";

import { appelApi } from "@/lib/api-admin";

import { EnTetePage } from "../_ui";
import { FormulaireProfil } from "./FormulaireProfil";

export const metadata = { title: "Mon profil" };

interface Moi {
  profil: {
    role: string;
    filiere_id: string | null;
    universite_id: string | null;
    niveau_id: string | null;
    annee_arrivee: number | null;
    bio: string | null;
    centres_interet: string | null;
    telephone: string | null;
    whatsapp: string | null;
  } | null;
  mentor: { presentation: string | null; capacite_max: number; disponible: number } | null;
  email: string;
  nom: string | null;
}

export default async function ProfilPage() {
  const [moi, { filieres }, { universites }, { niveaux }] = await Promise.all([
    appelApi<Moi>("/api/v1/me"),
    appelApi<{ filieres: { id: string; nom: string; slug: string }[] }>("/api/v1/filieres"),
    appelApi<{ universites: { id: string; nom: string }[] }>("/api/v1/universites"),
    appelApi<{ niveaux: { id: string; libelle: string }[] }>("/api/v1/niveaux"),
  ]);

  const p = moi.profil;
  const estMentor = p?.role === "mentor" || p?.role === "admin";

  return (
    <div>
      <EnTetePage
        icone={UserRound}
        titre="Mon profil"
        texte={`${moi.nom ? `${moi.nom}, ` : ""}${moi.email}`}
      />

      <FormulaireProfil
        estMentor={estMentor}
        filieres={filieres}
        universites={universites}
        niveaux={niveaux}
        initial={{
          filiere_id: p?.filiere_id ?? "",
          universite_id: p?.universite_id ?? "",
          niveau_id: p?.niveau_id ?? "",
          annee_arrivee: p?.annee_arrivee ? String(p.annee_arrivee) : "",
          bio: p?.bio ?? "",
          centres_interet: p?.centres_interet ?? "",
          telephone: p?.telephone ?? "",
          whatsapp: p?.whatsapp ?? "",
        }}
        mentorInitial={
          moi.mentor
            ? {
                presentation: moi.mentor.presentation ?? "",
                capacite_max: moi.mentor.capacite_max,
                disponible: Boolean(moi.mentor.disponible),
              }
            : null
        }
      />
    </div>
  );
}
