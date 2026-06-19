"use client";

import { BourseSearchFilters } from "@/components/BourseSearchFilters";
import { ScholarshipCardCompact } from "@/components/ScholarshipCard";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import { getCountrySummary, slugToCountry } from "@/lib/bourses/countries";
import {
  filterScholarshipsBySearch,
  hasActiveBourseFilters,
  sortScholarships,
  type BourseSortOption,
} from "@/lib/bourses/filters";
import type { StudyCycle } from "@/lib/types";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

const PUBLIC_SORT_OPTIONS: BourseSortOption[] = ["date_asc", "date_desc", "name_asc"];

function CountryContent({ slug }: { slug: string }) {
  const country = slugToCountry(slug);
  const [searchQuery, setSearchQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState<StudyCycle | "all">("all");
  const [sortBy, setSortBy] = useState<BourseSortOption>("date_asc");

  const { bourses, loading, error } = useBourses(country ? { pays: country } : {});

  const filtered = useMemo(() => {
    const list = filterScholarshipsBySearch(bourses, {
      query: searchQuery,
      cycle: cycleFilter,
    });
    const publicSort: "date_asc" | "date_desc" | "name_asc" = PUBLIC_SORT_OPTIONS.includes(
      sortBy,
    )
      ? (sortBy as "date_asc" | "date_desc" | "name_asc")
      : "date_asc";
    return sortScholarships(list, publicSort);
  }, [bourses, searchQuery, cycleFilter, sortBy]);

  const resetSearch = () => {
    setSearchQuery("");
    setCycleFilter("all");
    setSortBy("date_asc");
  };

  if (!country) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-foreground">Pays introuvable</h1>
        <p className="mt-2 text-muted">Ce pays de destination n&apos;existe pas dans notre catalogue.</p>
        <Link href="/pays" className="mt-6 inline-flex text-sm font-semibold text-aksanti-red hover:underline">
          ← Retour aux pays de destination
        </Link>
      </div>
    );
  }

  const hasFilters = hasActiveBourseFilters({ query: searchQuery, cycle: cycleFilter });

  return (
    <div>
      <Link href="/pays" className="text-sm font-semibold text-aksanti-red hover:underline">
        ← Tous les pays
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-foreground">
        Bourses pour étudier en {country}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">{getCountrySummary(country)}</p>
      <p className="mt-2 text-sm text-muted">
        {loading
          ? "Chargement..."
          : `${filtered.length} bourse${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""} pour ${country}`}
      </p>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <BourseSearchFilters
        variant="public"
        hidePays
        showSort
        query={searchQuery}
        pays="all"
        cycle={cycleFilter}
        countries={[]}
        resultCount={filtered.length}
        sortBy={PUBLIC_SORT_OPTIONS.includes(sortBy) ? sortBy : "date_asc"}
        onQueryChange={setSearchQuery}
        onPaysChange={() => {}}
        onCycleChange={setCycleFilter}
        onSortChange={(value) => {
          if (PUBLIC_SORT_OPTIONS.includes(value)) setSortBy(value);
        }}
        onReset={resetSearch}
      />

      <div className="mt-6 rounded-2xl border border-ship-orange/20 bg-ship-orange/5 p-4 text-sm text-muted">
        <strong className="text-foreground">Personnalisez vos résultats.</strong>{" "}
        <Link href="/auth/inscription" className="font-semibold text-aksanti-red hover:underline">
          Créez un compte
        </Link>{" "}
        et complétez votre profil pour filtrer selon votre niveau d&apos;études.
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <ScholarshipCardCompact key={s.id} scholarship={s} />
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-muted">
            {hasFilters
              ? "Aucune bourse ne correspond à votre recherche pour ce pays."
              : "Aucune bourse cataloguée pour ce pays pour le moment."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetSearch}
              className="mt-3 text-sm font-semibold text-aksanti-red hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaysCountryPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CountryContent slug={slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
