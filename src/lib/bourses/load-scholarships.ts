import type { Scholarship } from "../types";
import { CATALOG_SCHOLARSHIPS } from "../data/scholarships-catalog";
import { FRANCE_CURATED_SCHOLARSHIPS } from "../data/france-scholarships";
import { CHINA_CURATED_SCHOLARSHIPS } from "../data/china-scholarships";
import { SCHOLARSHIPS } from "../data/scholarships";

export interface ScholarshipMergeMeta {
  total: number;
  curated: number;
  catalog: number;
  china: number;
  france: number;
  synced: number;
}

export function mergeScholarships(lists: Scholarship[][]): Scholarship[] {
  const byId = new Map<string, Scholarship>();

  for (const list of lists) {
    for (const item of list) {
      if (!byId.has(item.id)) {
        byId.set(item.id, item);
      }
    }
  }

  return Array.from(byId.values());
}

export function getCuratedScholarships(): Scholarship[] {
  return mergeScholarships([
    SCHOLARSHIPS,
    CATALOG_SCHOLARSHIPS,
    CHINA_CURATED_SCHOLARSHIPS,
    FRANCE_CURATED_SCHOLARSHIPS,
  ]);
}

export function getStaticScholarships(): Scholarship[] {
  return getCuratedScholarships();
}

export function getScholarshipMergeMeta(all: Scholarship[]): ScholarshipMergeMeta {
  const curatedIds = new Set(SCHOLARSHIPS.map((s) => s.id));
  const chinaCuratedIds = new Set(CHINA_CURATED_SCHOLARSHIPS.map((s) => s.id));
  const franceCuratedIds = new Set(FRANCE_CURATED_SCHOLARSHIPS.map((s) => s.id));

  let curated = 0;
  let catalog = 0;
  let china = 0;
  let france = 0;
  let synced = 0;

  for (const s of all) {
    if (curatedIds.has(s.id)) curated += 1;
    else if (chinaCuratedIds.has(s.id)) china += 1;
    else if (franceCuratedIds.has(s.id)) france += 1;
    else if (s.source === "cucas") china += 1;
    else if (s.source === "campusfrance") france += 1;
    else if (CATALOG_SCHOLARSHIPS.some((c) => c.id === s.id)) catalog += 1;
    else synced += 1;
  }

  return {
    total: all.length,
    curated,
    catalog,
    china,
    france,
    synced,
  };
}

export function listStaticCountries(): string[] {
  return [...new Set(getStaticScholarships().map((s) => s.paysHote))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}
