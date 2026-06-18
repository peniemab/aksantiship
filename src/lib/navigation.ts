export const APP_NAV_LINKS = [
  { label: "Mon profil", href: "/profil" },
  { label: "Analyse du profil", href: "/analyse-profil" },
  { label: "Mes Opportunités", href: "/opportunites" },
  { label: "Abonnement", href: "/abonnement" },
  { label: "Accompagnement", href: "/accompagnement" },
] as const;

export type AppNavHref = (typeof APP_NAV_LINKS)[number]["href"];

/** Pages accessibles sans connexion. */
export const PUBLIC_NAV_PATHS = ["/"] as const;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Visiteurs : connexion avec retour vers la page visée après login. */
export function resolveNavHref(href: string, isAuthenticated: boolean): string {
  if (isAuthenticated || (PUBLIC_NAV_PATHS as readonly string[]).includes(href)) {
    return href;
  }
  return `/auth/connexion?redirect=${encodeURIComponent(href)}`;
}

export function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export type NavLinkBadge = "profile" | "email" | "subscription";

export function getNavLinkBadge(
  href: string,
  ctx: {
    user: { emailVerified: boolean } | null;
    profile: unknown | null;
    hasActiveSubscription: boolean;
  },
): NavLinkBadge | null {
  if (!ctx.user) return null;

  if (href === "/profil" && !ctx.profile) return "profile";
  if (href === "/abonnement" && ctx.profile && !ctx.hasActiveSubscription) {
    return "subscription";
  }
  if (!ctx.user.emailVerified && (href === "/profil" || href === "/opportunites")) {
    return "email";
  }

  return null;
}

export const NAV_BADGE_LABELS: Record<NavLinkBadge, string> = {
  profile: "Profil à compléter",
  email: "Email à vérifier",
  subscription: "Sans abonnement",
};
