/**
 * Petit graphique en barres, une seule série.
 *
 * Volontairement en SVG inline, sans bibliothèque : six barres ne justifient
 * pas 100 Ko de dépendance.
 *
 * Trois de ces graphiques sont affichés côte à côte en petits multiples.
 * C'est ce qui permet d'utiliser une teinte différente par mesure sans que
 * la couleur ne porte l'identité : chaque graphique est seul de sa série et
 * son titre le nomme. La légende est donc inutile, et l'écart de perception
 * entre le doré et le vert en protanopie n'a pas d'incidence, les deux
 * n'apparaissant jamais dans le même tracé.
 */

export interface PointMensuel {
  /** Mois au format AAAA-MM. */
  mois: string;
  valeur: number;
}

const MOIS_COURTS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

function libelleMois(cle: string): string {
  const index = Number(cle.slice(5, 7)) - 1;
  return MOIS_COURTS[index] ?? cle;
}

/** Barre à sommet arrondi, ancrée sur la ligne de base. */
function cheminBarre(x: number, y: number, largeur: number, hauteur: number, rayon: number) {
  const r = Math.min(rayon, largeur / 2, hauteur);
  return [
    `M ${x} ${y + hauteur}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + largeur - r} ${y}`,
    `Q ${x + largeur} ${y} ${x + largeur} ${y + r}`,
    `L ${x + largeur} ${y + hauteur}`,
    "Z",
  ].join(" ");
}

export function MiniBarres({
  titre,
  points,
  couleur,
  unite,
}: {
  titre: string;
  points: PointMensuel[];
  couleur: string;
  unite: string;
}) {
  const LARGEUR = 260;
  const HAUTEUR = 96;
  const BASE = HAUTEUR - 18;
  const ECART = 2;

  const max = Math.max(1, ...points.map((p) => p.valeur));
  const pas = LARGEUR / Math.max(1, points.length);
  const largeurBarre = Math.max(6, pas - ECART * 2);

  const total = points.reduce((somme, p) => somme + p.valeur, 0);
  const dernier = points.at(-1);

  return (
    <figure className="rounded-xl border border-line bg-surface/60 p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink">{titre}</span>
        <span className="text-[12px] text-muted-ink">{total} sur 6 mois</span>
      </figcaption>

      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`${titre} : ${total} au total sur les six derniers mois.`}
      >
        {/* Ligne de base, volontairement discrète. */}
        <line
          x1="0"
          y1={BASE + 0.5}
          x2={LARGEUR}
          y2={BASE + 0.5}
          stroke="var(--color-line)"
          strokeWidth="1"
        />

        {points.map((point, index) => {
          const x = index * pas + (pas - largeurBarre) / 2;
          const hauteur = point.valeur === 0 ? 0 : (point.valeur / max) * (BASE - 14);

          return (
            <g key={point.mois}>
              {/* Zone de survol plus large que la barre. */}
              <rect x={index * pas} y="0" width={pas} height={BASE} fill="transparent">
                <title>{`${libelleMois(point.mois)} : ${point.valeur} ${unite}`}</title>
              </rect>

              {hauteur > 0 ? (
                <path d={cheminBarre(x, BASE - hauteur, largeurBarre, hauteur, 4)} fill={couleur} />
              ) : (
                /*
                 * Mois sans activité : un trait au ras de la ligne de base.
                 * Une barre absente se lit « donnée manquante », ce trait se
                 * lit « rien ne s'est passé ». Ce n'est pas la même chose.
                 */
                <line
                  x1={x}
                  y1={BASE - 1}
                  x2={x + largeurBarre}
                  y2={BASE - 1}
                  stroke="var(--color-line)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              <text
                x={index * pas + pas / 2}
                y={HAUTEUR - 4}
                textAnchor="middle"
                className="fill-[var(--color-muted-ink)] text-[9px]"
              >
                {libelleMois(point.mois)}
              </text>
            </g>
          );
        })}

        {/*
          Étiquette directe sur le dernier mois seulement : c'est la valeur que
          l'on vient lire. Les autres se survolent.
        */}
        {dernier && dernier.valeur > 0 ? (
          <text
            x={LARGEUR - pas / 2}
            y={BASE - (dernier.valeur / max) * (BASE - 14) - 5}
            textAnchor="middle"
            className="fill-[var(--color-ink)] text-[10px] font-semibold"
          >
            {dernier.valeur}
          </text>
        ) : null}
      </svg>

      {/* Équivalent textuel, pour les lecteurs d'écran et l'impression. */}
      <details className="mt-2">
        <summary className="cursor-pointer text-[11px] text-muted-ink">Voir les chiffres</summary>
        <table className="mt-2 w-full text-[12px]">
          <thead>
            <tr className="text-left text-muted-ink">
              <th scope="col" className="font-medium">
                Mois
              </th>
              <th scope="col" className="text-right font-medium">
                {unite}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.mois}>
                <td className="text-ink-soft">{libelleMois(point.mois)}</td>
                <td className="text-right text-ink">{point.valeur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
