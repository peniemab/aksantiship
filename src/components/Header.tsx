"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const menuLinks = [
  { label: "Analyse du profil", href: "/analyse-profil" },
  { label: "Mon profil", href: "/profil" },
  { label: "Mes Opportunités", href: "/opportunites" },
  { label: "Abonnement", href: "/abonnement" },
  { label: "Accompagnement", href: "/accompagnement" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Aksantiship"
            width={180}
            height={48}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-surface hover:text-aksanti-red ${
              pathname === "/" ? "text-aksanti-red" : "text-foreground/80"
            }`}
          >
            Accueil
          </Link>
          {user &&
            menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-surface hover:text-aksanti-red ${
                  pathname === link.href ? "text-aksanti-red" : "text-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="text-sm text-muted">
                Bonjour, <strong className="text-foreground">{user.prenom}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/70 transition hover:border-aksanti-red hover:text-aksanti-red"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/inscription"
                className="rounded-full bg-aksanti-red px-5 py-2 text-sm font-semibold text-white transition hover:bg-aksanti-red-dark"
              >
                Créer un compte
              </Link>
              <Link
                href="/auth/connexion"
                className="rounded-full border border-aksanti-red px-5 py-2 text-sm font-semibold text-aksanti-red transition hover:bg-aksanti-red hover:text-white"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
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
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Accueil
          </Link>
          {user ? (
            <>
              {menuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => { logout(); setMobileOpen(false); }}
                className="mt-3 w-full rounded-full border border-border py-2.5 text-sm font-medium"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/inscription" className="mt-2 block rounded-full bg-aksanti-red py-2.5 text-center text-sm font-semibold text-white" onClick={() => setMobileOpen(false)}>
                Créer un compte
              </Link>
              <Link href="/auth/connexion" className="mt-2 block rounded-full border border-aksanti-red py-2.5 text-center text-sm font-semibold text-aksanti-red" onClick={() => setMobileOpen(false)}>
                Se connecter
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
