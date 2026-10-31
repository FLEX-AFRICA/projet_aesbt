import { permanentRedirect } from "next/navigation";

/** Les albums sont désormais dans la Galerie. */
export default function AlbumsPage() {
  permanentRedirect("/admin/galerie");
}
