import { appelApi } from "@/lib/api-admin";

import { EnTetePageAdmin } from "../_kit";
import { FormulaireParametres } from "./FormulaireParametres";

export const metadata = { title: "Paramètres" };

export default async function ParametresPage() {
  const { parametres } = await appelApi<{ parametres: Record<string, string | null> }>(
    "/api/v1/parametres",
  );

  return (
    <div>
      <EnTetePageAdmin
        titre="Paramètres"
        description="Coordonnées et réseaux sociaux affichés sur le site public. Laisser un champ vide le fait disparaître des pages plutôt que d'afficher une valeur approximative."
      />

      <FormulaireParametres valeursInitiales={parametres} />
    </div>
  );
}
