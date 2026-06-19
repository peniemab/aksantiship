"use client";

import { Input, Select } from "@/components/ui/Form";
import { STUDY_CYCLE_LABELS } from "@/lib/education-levels";
import {
  BOURSE_SORT_LABELS,
  type BourseSortOption,
} from "@/lib/bourses/filters";
import type { StudyCycle } from "@/lib/types";

const CYCLE_OPTIONS: { value: StudyCycle | "all"; label: string }[] = [
  { value: "all", label: "Tous les cycles" },
  { value: "undergraduate", label: STUDY_CYCLE_LABELS.undergraduate },
  { value: "master", label: STUDY_CYCLE_LABELS.master },
  { value: "doctorate", label: STUDY_CYCLE_LABELS.doctorate },
];

interface BourseSearchFiltersProps {
  query: string;
  pays: string;
  cycle: StudyCycle | "all";
  countries: string[];
  resultCount: number;
  onQueryChange: (value: string) => void;
  onPaysChange: (value: string) => void;
  onCycleChange: (value: StudyCycle | "all") => void;
  onReset: () => void;
  variant?: "profile" | "public";
  hidePays?: boolean;
  sortBy?: BourseSortOption;
  onSortChange?: (value: BourseSortOption) => void;
  showSort?: boolean;
}

export function BourseSearchFilters({
  query,
  pays,
  cycle,
  countries,
  resultCount,
  onQueryChange,
  onPaysChange,
  onCycleChange,
  onReset,
  variant = "profile",
  hidePays = false,
  sortBy = "score_desc",
  onSortChange,
  showSort = false,
}: BourseSearchFiltersProps) {
  const hasFilters = Boolean(
    query.trim() ||
      (!hidePays && pays && pays !== "all") ||
      (cycle && cycle !== "all"),
  );

  const subtitle =
    variant === "public"
      ? "Explorez le catalogue public. Créez un compte pour voir les bourses adaptées à votre profil."
      : "Par nom, pays hôte ou cycle financé. Les résultats restent limités à votre profil.";

  return (
    <section className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Rechercher une bourse</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <p className="text-sm font-medium text-aksanti-red">
          {resultCount} résultat{resultCount > 1 ? "s" : ""}
        </p>
      </div>

      <div
        className={`mt-5 grid gap-4 ${
          hidePays
            ? showSort
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3"
            : showSort
              ? "sm:grid-cols-2 lg:grid-cols-5"
              : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <label htmlFor="bourse-search" className="mb-1.5 block text-sm font-medium text-foreground">
            Mot-clé
          </label>
          <Input
            id="bourse-search"
            type="search"
            placeholder="Ex. Turquie, Master, DAAD..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        {!hidePays && (
          <div className="min-w-0">
            <label htmlFor="bourse-pays" className="mb-1.5 block text-sm font-medium text-foreground">
              Pays hôte
            </label>
            <Select
              id="bourse-pays"
              value={pays}
              onChange={(e) => onPaysChange(e.target.value)}
            >
              <option value="all">Tous les pays</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="min-w-0">
          <label htmlFor="bourse-cycle" className="mb-1.5 block text-sm font-medium text-foreground">
            Cycle financé
          </label>
          <Select
            id="bourse-cycle"
            value={cycle}
            onChange={(e) => onCycleChange(e.target.value as StudyCycle | "all")}
          >
            {CYCLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {showSort && onSortChange && (
          <div className="min-w-0">
            <label htmlFor="bourse-sort" className="mb-1.5 block text-sm font-medium text-foreground">
              Trier par
            </label>
            <Select
              id="bourse-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as BourseSortOption)}
            >
              {(Object.entries(BOURSE_SORT_LABELS) as [BourseSortOption, string][])
                .filter(([value]) => variant === "profile" || value !== "score_desc")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </Select>
          </div>
        )}

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={onReset}
            disabled={
              !hasFilters &&
              sortBy === (variant === "profile" ? "score_desc" : "date_asc")
            }
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground/70 transition hover:border-aksanti-red/30 hover:text-aksanti-red disabled:cursor-not-allowed disabled:opacity-40"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </section>
  );
}
