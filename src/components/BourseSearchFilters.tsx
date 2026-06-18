"use client";

import { Input, Select } from "@/components/ui/Form";
import { STUDY_CYCLE_LABELS } from "@/lib/education-levels";
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
}: BourseSearchFiltersProps) {
  const hasFilters = Boolean(
    query.trim() || (pays && pays !== "all") || (cycle && cycle !== "all"),
  );

  return (
    <section className="mt-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Rechercher une bourse</h2>
          <p className="mt-1 text-sm text-muted">
            Par nom, pays hôte ou cycle financé. Les résultats restent limités à votre profil.
          </p>
        </div>
        <p className="text-sm font-medium text-aksanti-red">
          {resultCount} résultat{resultCount > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasFilters}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground/70 transition hover:border-aksanti-red/30 hover:text-aksanti-red disabled:cursor-not-allowed disabled:opacity-40"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </section>
  );
}
