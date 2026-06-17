"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Image
            src="/logo.png"
            alt="Aksantiship"
            width={160}
            height={42}
            className="h-10 w-auto brightness-0 invert"
          />
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">Accueil</Link>
            <Link href="/opportunites" className="transition hover:text-white">Mes Opportunités</Link>
            <Link href="/abonnement" className="transition hover:text-white">Abonnement</Link>
            <Link href="/accompagnement" className="transition hover:text-white">Accompagnement</Link>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-white/40">
          © {new Date().getFullYear()} Aksantiship — Fait à Kinshasa. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
