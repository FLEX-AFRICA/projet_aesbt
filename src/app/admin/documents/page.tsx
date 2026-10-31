import { permanentRedirect } from "next/navigation";

/** Les documents sont fusionnés avec les ressources (public ou privé). */
export default function DocumentsPage(): never {
  permanentRedirect("/admin/ressources");
}
