"use client";

import { ScholarshipCardCompact } from "@/components/ScholarshipCard";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import Link from "next/link";

const stats = [
  { value: "1 000+", label: "Abonnements" },
  { value: "500+", label: "Bourses mises à jour mensuellement" },
  { value: "100+", label: "Boursiers accompagnés" },
];

export function HomeContent() {
  const { bourses: featured, loading, error } = useBourses({ featured: true });

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-surface via-white to-orange-50">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-ship-orange/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-aksanti-red/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Bienvenue dans le portail de{" "}
              <span className="text-aksanti-red">bourses</span>{" "}
              <span className="text-ship-orange">d&apos;études</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              <strong className="text-foreground">Aksantiship</strong> t&apos;accompagne pas à pas
              dans la recherche d&apos;une opportunité pour financer tes études à l&apos;international.
            </p>
            <p className="mt-3 text-sm text-muted">
              Pour toute catégorie de candidats : Finaliste (Bachelier), Étudiant (en cours),
              Diplômé (Licence, Master ou Doctorat).
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-aksanti-red/20 bg-white p-8 shadow-sm">
              <span className="inline-block rounded-full bg-aksanti-red/10 px-3 py-1 text-xs font-bold uppercase text-aksanti-red">
                Offre 1
              </span>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                Créer votre profil pour vous lancer à l&apos;accomplissement de vos rêves
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Analysez votre profil, filtrez les opportunités adaptées à votre niveau d&apos;études
                et organisez-les selon leur disponibilité.
              </p>
              <p className="mt-2 text-xs text-muted">
                Compte d&apos;abord → profil académique ensuite
              </p>
              <Link
                href="/auth/inscription"
                className="mt-6 inline-flex rounded-full bg-aksanti-red px-6 py-3 text-sm font-bold text-white transition hover:bg-aksanti-red-dark"
              >
                Étape 1 — Créer un compte
              </Link>
            </div>

            <div className="rounded-2xl border border-ship-orange/20 bg-white p-8 shadow-sm">
              <span className="inline-block rounded-full bg-ship-orange/10 px-3 py-1 text-xs font-bold uppercase text-ship-orange-dark">
                Offre 2
              </span>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                Demander un accompagnement
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Nous offrons un accompagnement pédagogique et orienté résultats pour maximiser
                vos chances de succès.
              </p>
              <Link
                href="/accompagnement"
                className="mt-6 inline-flex rounded-full bg-ship-orange px-6 py-3 text-sm font-bold text-white transition hover:bg-ship-orange-dark"
              >
                Demander un accompagnement
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
                <p className="text-3xl font-extrabold text-aksanti-red">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-foreground">
            Nos meilleures offres disponibles
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            Découvrez une sélection de bourses internationales populaires — chargées via notre
            API interne, prête pour la base de données.
          </p>

          {error && (
            <div className="mx-auto mt-6 max-w-lg">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((s) => (
                <ScholarshipCardCompact key={s.id} scholarship={s} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/opportunites"
              className="inline-flex rounded-full border-2 border-aksanti-red px-8 py-3 text-sm font-bold text-aksanti-red transition hover:bg-aksanti-red hover:text-white"
            >
              Voir toutes les opportunités
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-foreground">
            3 fonctionnalités principales
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Analyser le profil", desc: "Déterminez votre niveau international (Bachelor, Master, PhD) et vos cycles éligibles." },
              { step: "2", title: "Filtrer les opportunités", desc: "Seules les bourses compatibles avec votre niveau s'affichent — pas de Master pour un Bachelier." },
              { step: "3", title: "Organiser par disponibilité", desc: "En cours, en attente d'ouverture, ou fermées." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-border bg-white p-6">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aksanti-red to-ship-orange text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
