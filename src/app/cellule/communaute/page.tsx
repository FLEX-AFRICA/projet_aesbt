import { redirect } from "next/navigation";

/** La rubrique Communauté s'ouvre sur les ressources partagées. */
export default function CommunautePage() {
  redirect("/cellule/communaute/ressources");
}
