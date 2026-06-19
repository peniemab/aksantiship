import { SCHOLARSHIPS, FEATURED_SCHOLARSHIP_IDS } from "@/lib/data/scholarships";
import type { Scholarship } from "@/lib/types";
import { filterScholarshipsBySearch } from "./filters";
import { slugToCountry } from "./countries";
import type { BourseRepositoryQuery } from "./types";

/**
 * Couche d'accès aux données bourses.
 * Aujourd'hui : fichier local. Demain : remplacer par Supabase/PostgreSQL
 * sans changer les routes API ni le client.
 */
export function listBourses(query: BourseRepositoryQuery = {}): Scholarship[] {
  let results = [...SCHOLARSHIPS];

  if (query.featured) {
    results = FEATURED_SCHOLARSHIP_IDS.map((id) =>
      SCHOLARSHIPS.find((s) => s.id === id),
    ).filter((s): s is Scholarship => s !== undefined);
  }

  if (query.status) {
    results = results.filter((s) => s.status === query.status);
  }

  results = filterScholarshipsBySearch(results, {
    query: query.q,
    pays: query.pays,
    cycle: query.cycle,
  });

  return results.sort((a, b) => a.dateCloture.localeCompare(b.dateCloture));
}

export function listScholarshipCountries(): string[] {
  return [...new Set(SCHOLARSHIPS.map((s) => s.paysHote))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

export function getBourseById(id: string): Scholarship | undefined {
  return SCHOLARSHIPS.find((s) => s.id === id);
}

export function countBourses(): number {
  return SCHOLARSHIPS.length;
}

export function listBoursesByCountrySlug(slug: string): Scholarship[] {
  const country = slugToCountry(slug);
  if (!country) return [];
  return listBourses({ pays: country });
}

export function countBoursesByCountry(country: string): number {
  return SCHOLARSHIPS.filter((s) => s.paysHote === country).length;
}
