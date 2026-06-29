"use client";

import { BourseSearchFilters } from "@/components/BourseSearchFilters";
import { CountryFlag } from "@/components/CountryFlag";
import {
  ScholarshipResultsGrid,
  ScholarshipResultsSkeleton,
} from "@/components/ScholarshipResultsGrid";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import { getCountrySummary } from "@/lib/bourses/countries";
import {
  filterScholarshipsBySearch,
  hasActiveBourseFilters,
  sortScholarships,
  type BourseSortOption,
} from "@/lib/bourses/filters";
import type { StudyCycle } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

const PUBLIC_SORT_OPTIONS: BourseSortOption[] = ["date_asc", "date_desc", "name_asc"];

export function CountryPageClient({ country }: { country: string | null }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [nationaliteFilter, setNationaliteFilter] = useState("");
  const [cycleFilter, setCycleFilter] = useState<StudyCycle | "all">("all");
  const [sortBy, setSortBy] = useState<BourseSortOption>("date_asc");

  const { bourses, loading, error } = useBourses(
    country
      ? {
          pays: country,
          ...(country === "France" && nationaliteFilter.trim()
            ? { nationalite: nationaliteFilter.trim() }
            : {}),
        }
      : {},
  );

  const filtered = useMemo(() => {
    const list = filterScholarshipsBySearch(bourses, {
      query: searchQuery,
      cycle: cycleFilter,
      ...(country === "France" && nationaliteFilter.trim()
        ? { nationalite: nationaliteFilter.trim() }
        : {}),
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
    setNationaliteFilter("");
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

  const hasFilters = hasActiveBourseFilters({
    query: searchQuery,
    cycle: cycleFilter,
    nationalite: country === "France" ? nationaliteFilter : undefined,
  });

  return (
    <div className="min-w-0">
      <Link href="/pays" className="text-sm font-semibold text-aksanti-red hover:underline">
        ← Tous les pays
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <CountryFlag country={country} size="lg" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-2xl font-extrabold text-foreground sm:text-3xl">
            Bourses pour étudier en {country}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {loading
              ? "Chargement..."
              : `${filtered.length} bourse${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-muted">{getCountrySummary(country)}</p>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <BourseSearchFilters
        variant="public"
        hidePays
        showSort
        showNationalite={country === "France"}
        query={searchQuery}
        pays="all"
        cycle={cycleFilter}
        nationalite={nationaliteFilter}
        countries={[]}
        resultCount={filtered.length}
        sortBy={PUBLIC_SORT_OPTIONS.includes(sortBy) ? sortBy : "date_asc"}
        onQueryChange={setSearchQuery}
        onPaysChange={() => {}}
        onCycleChange={setCycleFilter}
        onNationaliteChange={setNationaliteFilter}
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
        <ScholarshipResultsSkeleton count={6} />
      ) : (
        <ScholarshipResultsGrid
          scholarships={filtered}
          emptyMessage={
            hasFilters
              ? "Aucune bourse ne correspond à votre recherche pour ce pays."
              : "Aucune bourse cataloguée pour ce pays pour le moment."
          }
          onReset={resetSearch}
          showReset={hasFilters}
        />
      )}
    </div>
  );
}
