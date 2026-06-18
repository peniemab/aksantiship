"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { APP_NAV_LINKS, resolveNavHref } from "@/lib/navigation";

export function Footer() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  return (
    <footer className="border-t border-border bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="inline-flex rounded-lg bg-white px-3 py-2">
            <Image
              src="/logo.png"
              alt="Aksantiship"
              width={160}
              height={42}
              className="h-10 w-auto"
            />
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">
              Accueil
            </Link>
            {APP_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={resolveNavHref(link.href, isAuthenticated)}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 text-center text-sm text-white/40">
          © {new Date().getFullYear()} Aksantiship. Fait à Kinshasa. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
