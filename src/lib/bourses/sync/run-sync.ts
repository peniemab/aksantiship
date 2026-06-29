import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";
import { mergeScholarships, getStaticScholarships } from "../load-scholarships";
import { fetchAllRssSources } from "./rss-sources";
import { fetchCucasChinaScholarships } from "./cucas-china";
import { getChinaSyncIntensity } from "../china-deadlines";
import { filterOpenScholarships, withResolvedStatus } from "../scholarship-lifecycle";
import { writeChinaScholarshipsFile } from "./china-storage";

const SYNCED_FILE = path.join(process.cwd(), "data", "scholarships-synced.json");
const CHINA_FILE = path.join(process.cwd(), "data", "china-cucas-scholarships.json");

export interface SyncReport {
  ok: boolean;
  syncedAt: string;
  curatedTotal: number;
  rssFetched: number;
  rssAdded: number;
  syncedStored: number;
  chinaFetched: number;
  chinaStored: number;
  chinaSyncIntensity: string;
  grandTotal: number;
  grandTotalOpen: number;
  sources: { source: string; fetched: number; added: number; errors: string[] }[];
  errors: string[];
}

function readSyncedFile(): Scholarship[] {
  try {
    if (!existsSync(SYNCED_FILE)) return [];
    const raw = readFileSync(SYNCED_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

function writeSyncedFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(SYNCED_FILE), { recursive: true });
  writeFileSync(
    SYNCED_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

function writeChinaFile(scholarships: Scholarship[]) {
  writeChinaScholarshipsFile(scholarships);
}

export function loadSyncedScholarships(): Scholarship[] {
  return readSyncedFile();
}

export function loadChinaScholarships(): Scholarship[] {
  try {
    if (!existsSync(CHINA_FILE)) return [];
    const raw = readFileSync(CHINA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadAllScholarships(): Scholarship[] {
  return mergeScholarships([
    getStaticScholarships(),
    loadSyncedScholarships(),
    loadChinaScholarships(),
  ]);
}

function resolveChinaMaxPages(): number {
  const fromEnv = process.env.CHINA_SYNC_MAX_PAGES;
  if (fromEnv !== undefined && fromEnv !== "") {
    const n = parseInt(fromEnv, 10);
    if (!Number.isNaN(n)) return n;
  }
  const intensity = getChinaSyncIntensity();
  if (intensity === "daily") return 600;
  if (intensity === "weekly") return 200;
  return 80;
}

export async function runScholarshipSync(): Promise<SyncReport> {
  const errors: string[] = [];
  const curated = getStaticScholarships();
  const existingSynced = readSyncedFile();
  const curatedAndCatalogIds = new Set(curated.map((s) => s.id));
  const existingLinks = new Set([
    ...curated.map((s) => s.lienOfficiel),
    ...existingSynced.map((s) => s.lienOfficiel),
  ]);

  const rssResults = await fetchAllRssSources();
  const newFromRss: Scholarship[] = [];

  for (const result of rssResults) {
    for (const item of result.items) {
      if (curatedAndCatalogIds.has(item.id)) continue;
      if (existingLinks.has(item.lienOfficiel)) continue;
      existingLinks.add(item.lienOfficiel);
      newFromRss.push(item);
    }
  }

  const mergedSynced = mergeScholarships([existingSynced, newFromRss]);
  writeSyncedFile(mergedSynced);

  const chinaIntensity = getChinaSyncIntensity();
  const chinaMaxPages = resolveChinaMaxPages();
  let chinaFetched = 0;
  let chinaStored = 0;

  try {
    const chinaScholarships = await fetchCucasChinaScholarships({
      maxPages: chinaMaxPages,
      onProgress: (page, added, total) => {
        if (page % 25 === 0) {
          console.log(`  CUCAS page ${page} (+${added}) → ${total} bourses Chine`);
        }
      },
    });
    chinaFetched = chinaScholarships.length;
    writeChinaFile(chinaScholarships);
    chinaStored = chinaScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync CUCAS Chine");
  }

  const all = loadAllScholarships();
  const open = filterOpenScholarships(all.map((s) => withResolvedStatus(s)));

  const rssFetched = rssResults.reduce((n, r) => n + r.fetched, 0);
  const rssAdded = newFromRss.length;

  return {
    ok: (rssResults.every((r) => r.errors.length === 0) || rssAdded > 0) && chinaStored > 0,
    syncedAt: new Date().toISOString(),
    curatedTotal: curated.length,
    rssFetched,
    rssAdded,
    syncedStored: mergedSynced.length,
    chinaFetched,
    chinaStored,
    chinaSyncIntensity: chinaIntensity,
    grandTotal: all.length,
    grandTotalOpen: open.length,
    sources: [
      ...rssResults.map((r) => ({
        source: r.source,
        fetched: r.fetched,
        added: r.added,
        errors: r.errors,
      })),
      {
        source: "cucas-china",
        fetched: chinaFetched,
        added: chinaStored,
        errors: errors.filter((e) => e.includes("CUCAS")),
      },
    ],
    errors,
  };
}
