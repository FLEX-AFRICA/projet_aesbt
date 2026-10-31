import { AESBT_PHOTOS } from "@/components/home/themes";

/**
 * Fond « mur de la communauté » : plusieurs images réelles de l'AESBT
 * assemblées en mosaïque, fondues entre elles et unifiées par un voile sombre
 * aux teintes de la charte. Donne de la matière au hero sans surcharger.
 *
 * La photo du collectif occupe la plus grande tuile ; les affiches, plus
 * petites et désaturées, servent de texture. Un dégradé final garantit la
 * lisibilité du texte posé par-dessus.
 */
export function MosaicBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Grille de tuiles */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
        {/* Grande tuile : le collectif (pièce maîtresse, nette) */}
        <img
          src={AESBT_PHOTOS.staff}
          alt=""
          className="col-span-4 row-span-4 h-full w-full object-cover object-top"
        />
        {/* Colonne droite : affiches réduites à une texture (floutées,
            désaturées) — elles ne doivent pas se lire, juste donner de la
            matière et de la couleur. */}
        <img
          src={AESBT_PHOTOS.jeppc}
          alt=""
          className="col-span-2 row-span-2 h-full w-full scale-110 object-cover opacity-70 blur-[6px] saturate-[0.7]"
        />
        <img
          src={AESBT_PHOTOS.weekend}
          alt=""
          className="col-span-2 row-span-2 h-full w-full scale-110 object-cover opacity-70 blur-[6px] saturate-[0.7]"
        />
      </div>

      {/* Couture : fondu entre la photo nette et les textures de droite */}
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-transparent via-black/10 to-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_45%,transparent_25%,rgba(0,0,0,0.35)_100%)]" />

      {/* Teinte unificatrice (chaude, charte AESBT) en mélange */}
      <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-[#2a0f0b]/80 via-[#1a1a1a]/65 to-[#3a2a0a]/70" />

      {/* Dégradé de lisibilité (sombre en bas et à gauche) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Grain fin pour casser l'aspect « plat » */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
