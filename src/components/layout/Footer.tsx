import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { ComponentType } from "react";

import { MAIN_NAV, REGISTRATION_ROUTE, SITE } from "@/config/site";
import { Editable } from "@/components/editable/Editable";
import { ContenusProvider } from "@/components/editable/ContenusProvider";
import { chargerCoordonnees } from "@/lib/parametres";

const YEAR = new Date().getFullYear();

/** Équipe qui a conçu et développé le site (logo dans `public/`). */
const CREDITS = {
  name: "FLEX",
  logo: "/flex.png",
};

function Coordonnee({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-frost/[0.07] text-frost/80">
        <Icon className="size-4" />
      </span>
      <span className="pt-1 text-sm leading-snug text-frost/70">{children}</span>
    </li>
  );
}

/**
 * Composant serveur : lit les coordonnées du back-office (repli sur
 * `config/site.ts`) et les textes `commun.pied.*` du registre (provider
 * `commun` propre, sans effet s'il est déjà sous celui d'une page). Ne pas l'importer depuis un composant client : passer le
 * pied de page en prop depuis un parent serveur.
 */
export async function Footer() {
  const { email, phone, address, socials } = await chargerCoordonnees();

  return (
    <ContenusProvider page="commun">
      <footer className="relative isolate overflow-hidden bg-ink text-frost/80">
        {/* Liseré tricolore (rouge, or, vert) en tête de page */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-accent-red via-[#C9961B] to-accent-green"
        />

        {/* Halos de couleur très doux */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-10 -z-10 size-[420px] rounded-full bg-accent-red/15 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-24 -z-10 size-[360px] rounded-full bg-[#C9961B]/10 blur-[130px]"
        />

        <div className="mx-auto max-w-[1240px] px-6 pt-16">
          {/* Bandeau d'appel */}
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-frost/10 bg-frost/[0.04] p-8 backdrop-blur-sm sm:flex-row sm:items-center sm:p-10">
            <div className="max-w-xl">
              <Editable
                cle="commun.pied.accroche"
                as="p"
                className="font-display text-2xl font-medium leading-tight tracking-tight text-frost sm:text-3xl"
              />
              <Editable
                cle="commun.pied.accroche_sous_titre"
                as="p"
                className="mt-2 text-sm leading-relaxed text-frost/60"
              />
            </div>
            <Link
              href={REGISTRATION_ROUTE}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-frost px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              <Editable cle="commun.pied.cta_libelle" />
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Colonnes */}
          <div className="grid gap-12 py-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="AESBT, accueil">
                <Editable
                  cle="commun.logo"
                  type="image"
                  as="img"
                  repli="/logo_aesbt.jpg"
                  className="size-11 rounded-full object-cover ring-1 ring-frost/20"
                />
                <span className="font-display text-2xl font-semibold tracking-tight text-frost">
                  AESBT
                </span>
              </Link>
              <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-frost/65">
                {SITE.longName}. <Editable cle="commun.pied.description_suite" />
              </p>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {socials.map((s) =>
                  s.href ? (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-frost/15 px-4 py-2 text-[13px] font-medium text-frost/80 transition-colors hover:border-frost/40 hover:bg-frost hover:text-ink"
                      >
                        {s.label}
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>

            <nav aria-label="Liens rapides" className="md:col-span-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-frost/45">Navigation</p>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
                {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
                  <li key={item.to}>
                    <Link
                      href={item.to}
                      className="inline-block transition-all hover:translate-x-1 hover:text-frost"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-frost/45">Contact</p>
              <ul className="mt-5 space-y-4">
                <Coordonnee icon={Mail}>
                  {email ? (
                    <a href={`mailto:${email}`} className="hover:text-frost">
                      {email}
                    </a>
                  ) : (
                    "E-mail à communiquer"
                  )}
                </Coordonnee>
                <Coordonnee icon={Phone}>
                  {phone ? (
                    <a href={`tel:${phone}`} className="hover:text-frost">
                      {phone}
                    </a>
                  ) : (
                    "Téléphone à communiquer"
                  )}
                </Coordonnee>
                <Coordonnee icon={MapPin}>{address ?? "Adresse à communiquer"}</Coordonnee>
              </ul>
            </div>
          </div>
        </div>

        {/* Mot géant décoratif, en filigrane */}
        <p
          aria-hidden="true"
          className="pointer-events-none select-none text-center font-display text-[clamp(5rem,22vw,17rem)] font-semibold leading-[0.8] tracking-tighter text-frost/[0.04]"
        >
          AESBT
        </p>

        {/* Barre basse : mentions et crédits */}
        <div className="border-t border-frost/10">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-5 px-6 py-6 text-[12px] text-frost/50 lg:flex-row">
            <p>
              © {YEAR} AESBT. <Editable cle="commun.pied.copyright" />
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/association" className="transition-colors hover:text-frost">
                L'association
              </Link>
              <Link href="/contact" className="transition-colors hover:text-frost">
                Nous écrire
              </Link>
            </div>

            <p className="flex items-center gap-3">
              <span>Site conçu et développé par</span>
              <span
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm"
                title={CREDITS.name}
              >
                <img src={CREDITS.logo} alt={CREDITS.name} className="h-6 w-auto" />
              </span>
            </p>
          </div>
        </div>
      </footer>
    </ContenusProvider>
  );
}
