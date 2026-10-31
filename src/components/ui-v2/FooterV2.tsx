import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { MAIN_NAV, REGISTRATION_ROUTE, SITE, type SocialLink } from "@/config/site";
import { AESBT_CONTACT } from "@/components/home/themes";

const YEAR = new Date().getFullYear();

/**
 * Pied de page.
 *
 * Reprend la structure utile de l'ancien (navigation, contact, réseaux) dans
 * une grille plus lisible, avec les coordonnées réelles de l'association et des
 * icônes. Aucun effet au scroll : un pied de page n'a pas à en avoir.
 *
 * Les liens de réseaux sociaux restent conditionnels : tant que l'association
 * ne les a pas communiqués, on affiche le nom sans lien plutôt qu'une URL
 * inventée.
 */
export function FooterV2({ socials }: { socials: SocialLink[] }) {
  return (
    <footer className="bg-ink text-frost/75">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-16 md:grid-cols-12">
        {/* Identité */}
        <div className="md:col-span-4">
          <span className="font-display text-2xl font-semibold tracking-tight text-frost">
            AESBT
          </span>
          <p className="mt-4 max-w-[40ch] text-[14px] leading-relaxed text-frost/60">
            {SITE.longName}. Un collectif au service de la réussite, de l'accompagnement et de la
            solidarité étudiante.
          </p>
          <Link
            href={REGISTRATION_ROUTE}
            className="mt-6 inline-flex items-center rounded-full bg-frost px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-frost/90"
          >
            Adhérer
          </Link>
        </div>

        {/* Navigation */}
        <nav aria-label="Liens rapides" className="md:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-frost/45">
            Navigation
          </p>
          <ul className="mt-5 m-0 list-none space-y-2.5 p-0 text-[14px]">
            {MAIN_NAV.filter((item) => item.to !== "/").map((item) => (
              <li key={item.to}>
                <Link href={item.to} className="transition-colors hover:text-frost">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-frost/45">
            Contact
          </p>
          <ul className="mt-5 m-0 list-none space-y-3 p-0 text-[14px]">
            <li>
              <a
                href={`mailto:${AESBT_CONTACT.email}`}
                className="flex items-start gap-2.5 transition-colors hover:text-frost"
              >
                <Mail size={15} strokeWidth={1.9} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="break-all">{AESBT_CONTACT.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${AESBT_CONTACT.phone.replace(/\s/g, "")}`}
                className="flex items-start gap-2.5 transition-colors hover:text-frost"
              >
                <Phone size={15} strokeWidth={1.9} aria-hidden="true" className="mt-0.5 shrink-0" />
                {AESBT_CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`tel:${AESBT_CONTACT.whatsapp.replace(/\s/g, "")}`}
                className="flex items-start gap-2.5 transition-colors hover:text-frost"
              >
                <MessageCircle
                  size={15}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                {AESBT_CONTACT.whatsapp}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-frost/55">
              <MapPin size={15} strokeWidth={1.9} aria-hidden="true" className="mt-0.5 shrink-0" />
              Tunis, Tunisie
            </li>
          </ul>
        </div>

        {/* Réseaux */}
        <div className="md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-frost/45">
            Réseaux
          </p>
          <ul className="mt-5 m-0 list-none space-y-2.5 p-0 text-[14px]">
            {socials.map((social) =>
              social.href ? (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-frost"
                  >
                    {social.label}
                  </a>
                </li>
              ) : (
                <li key={social.label} className="text-frost/40">
                  {social.label}
                  <span className="block text-[11.5px]">lien à venir</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-frost/10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-6 py-6 text-[12.5px] text-frost/45 sm:flex-row">
          <p>© {YEAR} AESBT — Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/association" className="transition-colors hover:text-frost">
              Documents institutionnels
            </Link>
            <Link href="/contact" className="transition-colors hover:text-frost">
              Nous écrire
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
