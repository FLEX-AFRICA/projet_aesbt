import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { AssociationHero } from "@/components/layout/AssociationHero";
import { Section } from "@/components/layout/PageHeader";
import { PatternBackdrop, type BackdropOptions } from "@/components/layout/PatternBackdrop";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SectionHeading } from "@/components/ui-aesbt/SectionHeading";
import { chargerCoordonnees } from "@/lib/parametres";

import { ContactForm } from "./ContactForm";

const TITLE = "Contact";
const DESCRIPTION =
  "Contacter l'AESBT : coordonnées du Bureau Exécutif, réseaux sociaux et formulaire de message.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: `${TITLE} : AESBT Tunisie`,
    description:
      "Écrire au Bureau Exécutif de l'AESBT, association des étudiants et stagiaires burkinabè en Tunisie.",
  },
};

// Fond de la page : même design que l'association (motif tuilé derrière la
// navbar, le hero et les sections). Voir `BackdropOptions` pour les réglages
// (zoom et défilement sur mobile).
const BACKDROP: BackdropOptions = {
  src: "/white_background_14.jpg",
  tileSize: 230,
  mobileZoom: 1,
  scroll: "vertical",
};

// Voile blanc sur les sections, sous les cartes (le hero reste en blanc plein).
const SECTIONS_VEIL = "bg-white/60";

// Carte en verre dépoli commune, comme sur la page association.
const CARD =
  "rounded-2xl border border-line/60 bg-surface/75 backdrop-blur-md p-8 shadow-sm shadow-ink/5 sm:p-10";

function Coordonnee({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-blue/10 text-accent-blue">
        <Icon className="size-[18px]" />
      </span>
      <div>
        <dt className="text-[12px] uppercase tracking-[0.14em] text-muted-ink">{label}</dt>
        <dd className="mt-0.5 text-[15px] text-ink">{children}</dd>
      </div>
    </div>
  );
}

const ATTENTE = <span className="text-muted-ink">À communiquer</span>;

export default async function ContactPage() {
  const { email, phone, address, socials: tousReseaux } = await chargerCoordonnees();
  const socials = tousReseaux.filter((s) => s.href);

  return (
    <SiteLayout>
      <div className="relative isolate -mt-28 pt-28 sm:-mt-32 sm:pt-32">
        <PatternBackdrop {...BACKDROP} />

        <AssociationHero
          eyebrow="Contact"
          title="Écrire à l'AESBT."
          description="Une question, une demande de partenariat ou une suggestion ? Choisissez le motif de votre message : le Bureau Exécutif vous répond."
        />

        <div className="relative">
          <div aria-hidden="true" className={`absolute inset-0 ${SECTIONS_VEIL}`} />
          <Section className="">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-8">
                <div className={CARD}>
                  <SectionHeading eyebrow="Coordonnées" title="Nous joindre" />
                  <dl className="mt-8 space-y-6">
                    <Coordonnee icon={Mail} label="E-mail">
                      {email ? (
                        <a href={`mailto:${email}`} className="text-accent-blue hover:underline">
                          {email}
                        </a>
                      ) : (
                        ATTENTE
                      )}
                    </Coordonnee>
                    <Coordonnee icon={Phone} label="Téléphone">
                      {phone ? (
                        <a href={`tel:${phone}`} className="text-accent-blue hover:underline">
                          {phone}
                        </a>
                      ) : (
                        ATTENTE
                      )}
                    </Coordonnee>
                    <Coordonnee icon={MapPin} label="Localisation">
                      {address ?? ATTENTE}
                    </Coordonnee>
                  </dl>
                </div>

                <div className={CARD}>
                  <SectionHeading eyebrow="Communauté" title="Réseaux" />
                  {socials.length > 0 ? (
                    <ul className="mt-6 flex flex-wrap gap-3 text-[14px]">
                      {socials.map((s) => (
                        <li key={s.label}>
                          <a
                            href={s.href!}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-full bg-surface/90 px-4 py-2 font-medium text-ink ring-1 ring-line transition-colors hover:text-accent-blue"
                          >
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-[15px] text-muted-ink">
                      Les liens officiels seront ajoutés dès leur communication.
                    </p>
                  )}
                </div>
              </div>

              <div className={CARD}>
                <SectionHeading
                  eyebrow="Formulaire"
                  title="Envoyer un message"
                  description="Tous les champs sont obligatoires."
                />
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </SiteLayout>
  );
}
