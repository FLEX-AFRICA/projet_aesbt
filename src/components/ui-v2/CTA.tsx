import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import { REGISTRATION_ROUTE } from "@/config/site";
import { AESBT_CONTACT } from "@/components/home/themes";
import { Reveal } from "./Reveal";

/**
 * Appel à l'action de fin de page, sur fond rouge de la charte.
 *
 * Le motif de fond est un `radial-gradient` CSS répété : quelques octets, pas
 * d'image à charger, et peint une seule fois.
 */
export function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-accent-red">
      {/* Motif de points discret. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(var(--color-frost) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-6 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <h2 className="max-w-[20ch] font-display text-3xl font-medium leading-tight tracking-tight text-frost text-balance sm:text-4xl md:text-[42px]">
                Rejoignez la communauté AESBT.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-frost/80 text-pretty">
                Étudiant ou stagiaire burkinabè en Tunisie ? L'adhésion est ouverte toute l'année,
                et l'accompagnement commence dès votre premier message.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={REGISTRATION_ROUTE}
                  className="group inline-flex items-center gap-2 rounded-full bg-frost px-6 py-3.5 text-[14px] font-semibold text-ink transition-colors hover:bg-frost/90"
                >
                  Adhérer maintenant
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-frost/35 px-6 py-3.5 text-[14px] font-semibold text-frost transition-colors hover:bg-frost/10"
                >
                  Poser une question
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Coordonnées : celles relevées sur la page officielle de
              l'association (cf. AESBT_CONTACT). */}
          <Reveal delay={200}>
            <ul className="m-0 list-none space-y-px overflow-hidden rounded-2xl border border-frost/20 p-0">
              <ContactLine
                icon={Mail}
                label="E-mail"
                value={AESBT_CONTACT.email}
                href={`mailto:${AESBT_CONTACT.email}`}
              />
              <ContactLine
                icon={Phone}
                label="Téléphone (Tunisie)"
                value={AESBT_CONTACT.phone}
                href={`tel:${AESBT_CONTACT.phone.replace(/\s/g, "")}`}
              />
              <ContactLine
                icon={MessageCircle}
                label="WhatsApp (Burkina)"
                value={AESBT_CONTACT.whatsapp}
                href={`tel:${AESBT_CONTACT.whatsapp.replace(/\s/g, "")}`}
              />
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li className="bg-frost/10">
      <a
        href={href}
        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-frost/15"
      >
        <Icon size={17} strokeWidth={1.9} aria-hidden="true" className="shrink-0 text-frost/70" />
        <span className="min-w-0 grow">
          <span className="block text-[11.5px] uppercase tracking-[0.14em] text-frost/60">
            {label}
          </span>
          <span className="block truncate text-[14.5px] font-medium text-frost">{value}</span>
        </span>
      </a>
    </li>
  );
}
