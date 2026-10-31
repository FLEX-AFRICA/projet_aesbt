/**
 * Variables d'environnement du projet.
 *
 * Cette déclaration n'est pas cosmétique : Next remplace les références à
 * `process.env.NEXT_PUBLIC_*` au moment du build, mais **uniquement en
 * notation point**. En notation crochets, le remplacement n'a pas lieu et la
 * valeur arrive vide dans le navigateur.
 *
 * Or le `noPropertyAccessFromIndexSignature` de ce projet interdit la
 * notation point sur une signature d'index. Déclarer ces clés comme de
 * vraies propriétés lève l'interdiction et rend le remplacement possible.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** URL publique du site, base des URL canoniques et Open Graph. */
      NEXT_PUBLIC_SITE_URL?: string;
      /** URL de l'API (aesbt-api). */
      NEXT_PUBLIC_API_URL?: string;
      /** URL des médias, servis par Caddy depuis le volume du VPS. */
      NEXT_PUBLIC_MEDIA_URL?: string;
      /** Jeton partagé avec le backend pour la régénération des pages. */
      REVALIDATE_SECRET?: string;
    }
  }
}

export {};
