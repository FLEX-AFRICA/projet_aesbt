"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Classe appliquée uniquement lorsque le lien correspond à la page courante. */
  activeClassName?: string;
  /** Style en ligne appliqué uniquement sur la page courante. */
  activeStyle?: CSSProperties;
  /**
   * Correspondance stricte. Par défaut, un lien est actif sur ses sous-pages
   * (« /actualites » reste actif sur « /actualites/mon-article »), sauf pour
   * la racine « / » qui exige toujours une correspondance exacte.
   */
  exact?: boolean;
};

/**
 * Lien de navigation conscient de la page courante.
 *
 * next/link ne sait pas, à lui seul, qu'un lien pointe vers la page courante :
 * cette information se lit avec `usePathname`.
 */
export function NavLink({
  href,
  exact,
  activeClassName,
  activeStyle,
  className,
  style,
  ...rest
}: NavLinkProps) {
  const pathname = usePathname();
  const strict = exact ?? href === "/";
  const isActive = strict
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(className, isActive && activeClassName)}
      style={isActive && activeStyle ? { ...style, ...activeStyle } : style}
      {...rest}
    />
  );
}
