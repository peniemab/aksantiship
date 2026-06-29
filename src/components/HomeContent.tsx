"use client";

import { BourseSearchFilters } from "@/components/BourseSearchFilters";
import { CountryExplorerGrid } from "@/components/CountryExplorerGrid";
import { ScholarshipCardCompact } from "@/components/ScholarshipCard";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import {
  filterScholarshipsBySearch,
  hasActiveBourseFilters,
} from "@/lib/bourses/filters";
import { listStaticCountries } from "@/lib/bourses/repository";
import type { StudyCycle } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const stats = [
  { value: "1 000+", label: "Abonnements" },
  { value: "500+", label: "Bourses mises à jour mensuellement" },
  { value: "100+", label: "Boursiers accompagnés" },
];

const defaultCountries = listStaticCountries();

export function HomeContent() {
  const { bourses: all, meta, loading, error } = useBourses();
  const [searchQuery, setSearchQuery] = useState("");
  const [paysFilter, setPaysFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState<StudyCycle | "all">("all");

  const hasFilters = hasActiveBourseFilters({
    query: searchQuery,
    pays: paysFilter,
    cycle: cycleFilter,
  });

  const displayed = useMemo(() => {
    return filterScholarshipsBySearch(all, {
      query: searchQuery,
      pays: paysFilter,
      cycle: cycleFilter,
    });
  }, [all, searchQuery, paysFilter, cycleFilter]);

  const totalBourses = meta?.sources?.total ?? all.length;

  const countryItems = useMemo(() => {
    const names = meta?.countries?.length ? meta.countries : defaultCountries;
    return names
      .map((country) => ({
        country,
        count: all.filter((s) => s.paysHote === country).length,
      }))
      .filter((item) => item.count > 0);
  }, [meta?.countries, all, defaultCountries]);

  const filterCountries = useMemo(() => {
    if (meta?.countries?.length) return meta.countries;
    return defaultCountries;
  }, [meta?.countries]);

  const resetSearch = () => {
    setSearchQuery("");
    setPaysFilter("all");
    setCycleFilter("all");
  };

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
                Étape 1 : Créer un compte
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

      <section className="border-y border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-extrabold text-foreground">
            Explorer par pays de destination
          </h2>
          <div className="mt-6">
            <CountryExplorerGrid items={countryItems} />
          </div>
          <p className="mt-6 text-center">
            <Link href="/pays" className="text-sm font-semibold text-aksanti-red hover:underline">
              Voir tous les pays →
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-foreground">
            {hasFilters ? "Résultats de recherche" : "Toutes les bourses disponibles"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            {loading
              ? "Chargement du catalogue..."
              : hasFilters
                ? `${displayed.length} résultat${displayed.length > 1 ? "s" : ""} sur ${totalBourses} bourses. Créez votre profil pour un filtrage personnalisé.`
                : `${totalBourses} bourses référencées dans notre catalogue. Utilisez les filtres pour affiner votre recherche.`}
          </p>

          <BourseSearchFilters
            variant="public"
            query={searchQuery}
            pays={paysFilter}
            cycle={cycleFilter}
            countries={filterCountries}
            resultCount={displayed.length}
            onQueryChange={setSearchQuery}
            onPaysChange={setPaysFilter}
            onCycleChange={setCycleFilter}
            onReset={resetSearch}
          />

          {error && (
            <div className="mx-auto mt-6 max-w-lg">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: Math.min(9, totalBourses || 9) }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          ) : displayed.length > 0 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((s) => (
                <ScholarshipCardCompact key={s.id} scholarship={s} />
              ))}
            </div>
          ) : (
            <div className="mt-10 text-center">
              <p className="text-muted">Aucune bourse ne correspond à votre recherche.</p>
              <button
                type="button"
                onClick={resetSearch}
                className="mt-3 text-sm font-semibold text-aksanti-red hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/opportunites"
              className="inline-flex rounded-full border-2 border-aksanti-red px-8 py-3 text-sm font-bold text-aksanti-red transition hover:bg-aksanti-red hover:text-white"
            >
              Mes opportunités (profil)
            </Link>
            <Link
              href="/pays"
              className="inline-flex rounded-full border border-border px-8 py-3 text-sm font-bold text-foreground/70 transition hover:border-aksanti-red/30 hover:text-aksanti-red"
            >
              Parcourir par pays
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Votre bourse idéale, en 3 étapes simples
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Plus besoin de parcourir des centaines d&apos;offres inadaptées. Aksantiship vous guide
            vers les opportunités qui correspondent vraiment à votre profil.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "On connaît votre profil",
                desc: "Bachelor, Master, PhD. On identifie votre niveau et les bourses réellement accessibles pour vous.",
              },
              {
                step: "2",
                title: "Seulement ce qui vous correspond",
                desc: "Pas de bourse Master si vous venez d'obtenir votre bac. Chaque opportunité est alignée sur votre parcours.",
              },
              {
                step: "3",
                title: "Ne ratez plus aucune chance",
                desc: "Bourses en cours, à venir ou closes. Tout est clair, à jour, au même endroit.",
              },
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
