"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface PointActivite {
  /** Mois au format AAAA-MM. */
  mois: string;
  inscriptions: number;
  publications: number;
  relations: number;
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

const CONFIG = {
  inscriptions: { label: "Inscriptions", color: "var(--color-accent-red)" },
  publications: { label: "Publications", color: "var(--color-accent-green)" },
  relations: { label: "Mentorats démarrés", color: "var(--color-accent-gold)" },
} satisfies ChartConfig;

/** Histogramme groupé des trois séries mensuelles (six derniers mois). */
export function GraphiqueActivite({ serie }: { serie: PointActivite[] }) {
  const donnees = serie.map((p) => ({
    ...p,
    libelle: MOIS_COURTS[Number(p.mois.slice(5, 7)) - 1] ?? p.mois,
  }));
  const resume = `Activité des six derniers mois : ${donnees
    .map(
      (d) =>
        `${d.libelle}, ${d.inscriptions} inscriptions, ${d.publications} publications, ${d.relations} mentorats`,
    )
    .join(" ; ")}.`;

  return (
    <div role="img" aria-label={resume}>
      <ChartContainer config={CONFIG} className="h-64 w-full">
        <BarChart data={donnees} margin={{ left: -16, right: 4, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="libelle" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={44} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="inscriptions" fill="var(--color-inscriptions)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="publications" fill="var(--color-publications)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="relations" fill="var(--color-relations)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
