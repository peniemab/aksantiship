import type { Scholarship, StudyCycle } from "@/lib/types";

export interface BourseSearchFilters {
  query?: string;
  pays?: string;
  cycle?: StudyCycle | "all";
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterScholarshipsBySearch<
  T extends Pick<Scholarship, "nom" | "paysHote" | "niveauDisponible" | "avantages" | "cyclesFinances">,
>(scholarships: T[], filters: BourseSearchFilters): T[] {
  const q = filters.query ? normalizeSearchQuery(filters.query) : "";
  const pays = filters.pays?.trim();
  const cycle = filters.cycle;

  return scholarships.filter((s) => {
    if (pays && pays !== "all" && s.paysHote !== pays) return false;
    if (cycle && cycle !== "all" && !s.cyclesFinances.includes(cycle)) return false;
    if (!q) return true;

    const haystack = [
      s.nom,
      s.paysHote,
      ...s.niveauDisponible,
      ...s.avantages,
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
      (filters.cycle && filters.cycle !== "all"),
  );
}
