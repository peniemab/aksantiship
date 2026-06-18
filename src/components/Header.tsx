"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  APP_NAV_LINKS,
  NAV_BADGE_LABELS,
  getNavLinkBadge,
  isNavActive,
  resolveNavHref,
} from "@/lib/navigation";

function NavBadge({ type }: { type: keyof typeof NAV_BADGE_LABELS }) {
  const styles: Record<keyof typeof NAV_BADGE_LABELS, string> = {
    profile: "bg-ship-orange text-white",
    email: "bg-amber-500 text-white",
    subscription: "bg-aksanti-red/10 text-aksanti-red",
  };

  return (
    <span
      className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${styles[type]}`}
      title={NAV_BADGE_LABELS[type]}
      aria-label={NAV_BADGE_LABELS[type]}
    >
      !
    </span>
  );
}

function navLinkClassName(pathname: string, href: string, extra = ""): string {
  const active = isNavActive(pathname, href);
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-aksanti-red/5 text-aksanti-red"
      : "text-foreground/80 hover:bg-surface hover:text-aksanti-red",
    extra,
  ].join(" ");
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, profile, logout, isLoading, hasActiveSubscription } = useAuth();

  const navCtx = { user, profile, hasActiveSubscription };

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [accountOpen]);

  const renderNavLink = (
    href: string,
    label: string,
    options?: { onNavigate?: () => void; stack?: boolean },
  ) => {
    const badge = getNavLinkBadge(href, navCtx);
    const targetHref = resolveNavHref(href, Boolean(user));
    const layoutClass = options?.stack
      ? "flex w-full items-center"
      : "inline-flex items-center";

    return (
      <Link
        key={`${href}-${options?.stack ? "stack" : "inline"}`}
        href={targetHref}
        className={`${navLinkClassName(pathname, href)} ${layoutClass}`}
        onClick={options?.onNavigate}
      >
        {label}
        {badge && <NavBadge type={badge} />}
      </Link>
    );
  };

  const accountAlerts = [
    !user?.emailVerified && {
      label: "Vérifiez votre adresse email",
      href: "/auth/verifier-email",
      tone: "bg-amber-50 text-amber-900 border-amber-200",
    },
    user && !profile && {
      label: "Complétez votre profil candidat",
      href: "/profil",
      tone: "bg-ship-orange/10 text-ship-orange-dark border-ship-orange/20",
    },
  ].filter(Boolean) as { label: string; href: string; tone: string }[];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Aksantiship"
            width={180}
            height={48}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {renderNavLink("/", "Accueil")}
          {APP_NAV_LINKS.map((link) => renderNavLink(link.href, link.label))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {isLoading ? (
            <div className="h-9 w-36 animate-pulse rounded-full bg-surface" aria-hidden />
          ) : user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm transition hover:border-aksanti-red/40"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-aksanti-red to-ship-orange text-xs font-bold text-white">
                  {user.prenom.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-foreground">
                  {user.prenom}
                </span>
                {hasActiveSubscription && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Abonné
                  </span>
                )}
                <svg
                  className={`h-4 w-4 text-muted transition ${accountOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {accountOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg"
                  role="menu"
                >
                  <p className="border-b border-border px-4 py-2 text-xs text-muted">
                    Bonjour, <strong className="text-foreground">{user.prenom}</strong>
                  </p>
                  <Link
                    href="/profil"
                    className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface hover:text-aksanti-red"
                    role="menuitem"
                  >
                    Mon profil
                    {!profile && (
                      <span className="ml-1 text-xs text-ship-orange">· à compléter</span>
                    )}
                  </Link>
                  <Link
                    href="/abonnement"
                    className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface hover:text-aksanti-red"
                    role="menuitem"
                  >
                    Mon abonnement
                    {hasActiveSubscription ? (
                      <span className="ml-1 text-xs text-emerald-600">· actif</span>
                    ) : (
                      <span className="ml-1 text-xs text-muted">· inactif</span>
                    )}
                  </Link>
                  {!user.emailVerified && (
                    <Link
                      href="/auth/verifier-email"
                      className="block px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50"
                      role="menuitem"
                    >
                      Vérifier mon email
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      logout();
                    }}
                    className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-foreground/70 hover:bg-surface hover:text-aksanti-red"
                    role="menuitem"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/connexion"
                className="rounded-full border border-aksanti-red px-4 py-2 text-sm font-semibold text-aksanti-red transition hover:bg-aksanti-red hover:text-white"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/inscription"
                className="rounded-full bg-aksanti-red px-5 py-2 text-sm font-semibold text-white transition hover:bg-aksanti-red-dark"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted">Chargement...</p>
          ) : (
            <>
              {user && (
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface px-3 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-aksanti-red to-ship-orange text-sm font-bold text-white">
                    {user.prenom.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Bonjour, {user.prenom}
                    </p>
                    {hasActiveSubscription ? (
                      <p className="text-xs text-emerald-600">Abonnement actif</p>
                    ) : (
                      <p className="text-xs text-muted">Pas d&apos;abonnement actif</p>
                    )}
                  </div>
                </div>
              )}

              {user && accountAlerts.length > 0 && (
                <div className="mb-3 space-y-2">
                  {accountAlerts.map((alert) => (
                    <Link
                      key={alert.href}
                      href={alert.href}
                      className={`block rounded-lg border px-3 py-2 text-xs font-medium ${alert.tone}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {alert.label}
                    </Link>
                  ))}
                </div>
              )}

              {renderNavLink("/", "Accueil", { onNavigate: () => setMobileOpen(false), stack: true })}
              {APP_NAV_LINKS.map((link) =>
                renderNavLink(link.href, link.label, {
                  onNavigate: () => setMobileOpen(false),
                  stack: true,
                }),
              )}

              <div className="mt-4 border-t border-border pt-4">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground/70"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/inscription"
                      className="block rounded-full bg-aksanti-red py-2.5 text-center text-sm font-semibold text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      Créer un compte
                    </Link>
                    <Link
                      href="/auth/connexion"
                      className="block rounded-full border border-aksanti-red py-2.5 text-center text-sm font-semibold text-aksanti-red"
                      onClick={() => setMobileOpen(false)}
                    >
                      Se connecter
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
