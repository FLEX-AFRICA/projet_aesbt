import { permanentRedirect } from "next/navigation";

/** La médiathèque est devenue l'onglet « Toutes les images » de la Galerie. */
export default function MediathequePage() {
  permanentRedirect("/admin/galerie?vue=images");
}
