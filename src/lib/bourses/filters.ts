import type { Scholarship, StudyCycle } from "@/lib/types";
import type { ScholarshipMatch } from "@/lib/matching";
import { matchesNationalityFilter } from "@/lib/bourses/france-country-map";

export interface BourseSearchFilters {
  query?: string;
  pays?: string;
  cycle?: StudyCycle | "all";
  nationalite?: string;
}

export type BourseSortOption = "score_desc" | "date_asc" | "date_desc" | "name_asc";

export const BOURSE_SORT_LABELS: Record<BourseSortOption, string> = {
  score_desc: "Compatibilité (meilleure d'abord)",
  date_asc: "Date de clôture (proche d'abord)",
  date_desc: "Date de clôture (lointaine d'abord)",
  name_asc: "Nom (A → Z)",
};

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterScholarshipsBySearch<
  T extends Pick<
    Scholarship,
    "nom" | "paysHote" | "niveauDisponible" | "avantages" | "cyclesFinances" | "nationalitesEligibles"
  >,
>(scholarships: T[], filters: BourseSearchFilters): T[] {
  const q = filters.query ? normalizeSearchQuery(filters.query) : "";
  const pays = filters.pays?.trim();
  const cycle = filters.cycle;
  const nationalite = filters.nationalite?.trim();

  return scholarships.filter((s) => {
    if (pays && pays !== "all" && s.paysHote !== pays) return false;
    if (cycle && cycle !== "all" && !s.cyclesFinances.includes(cycle)) return false;
    if (nationalite && !matchesNationalityFilter(s.nationalitesEligibles, nationalite)) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      s.nom,
      s.paysHote,
      ...s.niveauDisponible,
      ...s.avantages,
      ...(s.nationalitesEligibles ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function hasActiveBourseFilters(filters: BourseSearchFilters): boolean {
  return Boolean(
    filters.query?.trim() ||
      (filters.pays && filters.pays !== "all") ||
      (filters.cycle && filters.cycle !== "all") ||
      filters.nationalite?.trim(),
  );
}

export function sortScholarshipMatches(
  matches: ScholarshipMatch[],
  sortBy: BourseSortOption,
): ScholarshipMatch[] {
  const copy = [...matches];

  switch (sortBy) {
    case "score_desc":
      return copy.sort((a, b) => b.score - a.score);
    case "date_asc":
      return copy.sort((a, b) =>
        a.scholarship.dateCloture.localeCompare(b.scholarship.dateCloture),
      );
    case "date_desc":
      return copy.sort((a, b) =>
        b.scholarship.dateCloture.localeCompare(a.scholarship.dateCloture),
      );
    case "name_asc":
      return copy.sort((a, b) =>
        a.scholarship.nom.localeCompare(b.scholarship.nom, "fr"),
      );
    default:
      return copy;
  }
}

export function sortScholarships<T extends Pick<Scholarship, "nom" | "dateCloture">>(
  scholarships: T[],
  sortBy: Exclude<BourseSortOption, "score_desc"> | "name_asc" | "date_asc" | "date_desc",
): T[] {
  const copy = [...scholarships];

  switch (sortBy) {
    case "date_asc":
      return copy.sort((a, b) => a.dateCloture.localeCompare(b.dateCloture));
    case "date_desc":
      return copy.sort((a, b) => b.dateCloture.localeCompare(a.dateCloture));
    case "name_asc":
      return copy.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    default:
      return copy;
  }
}
