import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";
import { mergeScholarships, getStaticScholarships } from "../load-scholarships";
import { fetchAllRssSources } from "./rss-sources";
import { fetchCucasChinaScholarships } from "./cucas-china";
import { getChinaSyncIntensity } from "../china-deadlines";
import { filterOpenScholarships, withResolvedStatus } from "../scholarship-lifecycle";
import { fetchCampusFranceScholarships } from "./campus-france";
import { getFranceSyncIntensity } from "../france-deadlines";
import { writeChinaScholarshipsFile } from "./china-storage";
import { writeFranceScholarshipsFile, getFranceScholarshipsFilePath } from "./france-storage";
import { writeGermanyScholarshipsFile, getGermanyScholarshipsFilePath } from "./germany-storage";
import { fetchDaadGermanyScholarships } from "./daad-germany";
import { getGermanySyncIntensity } from "../germany-deadlines";
import { fetchBelgiumScholarships } from "./studyinbelgium";
import { writeBelgiumScholarshipsFile, getBelgiumScholarshipsFilePath } from "./belgium-storage";
import { getBelgiumSyncIntensity } from "../belgium-deadlines";
import { fetchCanadaScholarships } from "./canada-sync";
import { writeCanadaScholarshipsFile, getCanadaScholarshipsFilePath } from "./canada-storage";
import { getCanadaSyncIntensity } from "../canada-deadlines";

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
  franceFetched: number;
  franceStored: number;
  franceSyncIntensity: string;
  germanyFetched: number;
  germanyStored: number;
  germanySyncIntensity: string;
  belgiumFetched: number;
  belgiumStored: number;
  belgiumSyncIntensity: string;
  canadaFetched: number;
  canadaStored: number;
  canadaSyncIntensity: string;
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

const FRANCE_FILE = getFranceScholarshipsFilePath();
const GERMANY_FILE = getGermanyScholarshipsFilePath();
const BELGIUM_FILE = getBelgiumScholarshipsFilePath();
const CANADA_FILE = getCanadaScholarshipsFilePath();

export function loadFranceScholarships(): Scholarship[] {
  try {
    if (!existsSync(FRANCE_FILE)) return [];
    const raw = readFileSync(FRANCE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadGermanyScholarships(): Scholarship[] {
  try {
    if (!existsSync(GERMANY_FILE)) return [];
    const raw = readFileSync(GERMANY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadBelgiumScholarships(): Scholarship[] {
  try {
    if (!existsSync(BELGIUM_FILE)) return [];
    const raw = readFileSync(BELGIUM_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadCanadaScholarships(): Scholarship[] {
  try {
    if (!existsSync(CANADA_FILE)) return [];
    const raw = readFileSync(CANADA_FILE, "utf-8");
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
    loadFranceScholarships(),
    loadGermanyScholarships(),
    loadBelgiumScholarships(),
    loadCanadaScholarships(),
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

  const franceIntensity = getFranceSyncIntensity();
  let franceFetched = 0;
  let franceStored = 0;

  try {
    const franceScholarships = await fetchCampusFranceScholarships();
    franceFetched = franceScholarships.length;
    writeFranceScholarshipsFile(franceScholarships);
    franceStored = franceScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Campus France");
  }

  const germanyIntensity = getGermanySyncIntensity();
  let germanyFetched = 0;
  let germanyStored = 0;

  try {
    const germanyScholarships = await fetchDaadGermanyScholarships();
    germanyFetched = germanyScholarships.length;
    writeGermanyScholarshipsFile(germanyScholarships);
    germanyStored = germanyScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync DAAD Allemagne");
  }

  const belgiumIntensity = getBelgiumSyncIntensity();
  let belgiumFetched = 0;
  let belgiumStored = 0;

  try {
    const belgiumScholarships = await fetchBelgiumScholarships();
    belgiumFetched = belgiumScholarships.length;
    writeBelgiumScholarshipsFile(belgiumScholarships);
    belgiumStored = belgiumScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Belgique");
  }

  const canadaIntensity = getCanadaSyncIntensity();
  let canadaFetched = 0;
  let canadaStored = 0;

  try {
    const canadaScholarships = await fetchCanadaScholarships();
    canadaFetched = canadaScholarships.length;
    writeCanadaScholarshipsFile(canadaScholarships);
    canadaStored = canadaScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Canada");
  }

  const all = loadAllScholarships();
  const open = filterOpenScholarships(all.map((s) => withResolvedStatus(s)));

  const rssFetched = rssResults.reduce((n, r) => n + r.fetched, 0);
  const rssAdded = newFromRss.length;

  return {
    ok:
      (rssResults.every((r) => r.errors.length === 0) || rssAdded > 0) &&
      (chinaStored > 0 || franceStored > 0 || germanyStored > 0 || belgiumStored > 0 || canadaStored > 0),
    syncedAt: new Date().toISOString(),
    curatedTotal: curated.length,
    rssFetched,
    rssAdded,
    syncedStored: mergedSynced.length,
    chinaFetched,
    chinaStored,
    chinaSyncIntensity: chinaIntensity,
    franceFetched,
    franceStored,
    franceSyncIntensity: franceIntensity,
    germanyFetched,
    germanyStored,
    germanySyncIntensity: germanyIntensity,
    belgiumFetched,
    belgiumStored,
    belgiumSyncIntensity: belgiumIntensity,
    canadaFetched,
    canadaStored,
    canadaSyncIntensity: canadaIntensity,
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
      {
        source: "campusfrance",
        fetched: franceFetched,
        added: franceStored,
        errors: errors.filter((e) => e.includes("Campus France")),
      },
      {
        source: "daad-germany",
        fetched: germanyFetched,
        added: germanyStored,
        errors: errors.filter((e) => e.includes("DAAD")),
      },
      {
        source: "studyinbelgium",
        fetched: belgiumFetched,
        added: belgiumStored,
        errors: errors.filter((e) => e.includes("Belgique")),
      },
      {
        source: "canada",
        fetched: canadaFetched,
        added: canadaStored,
        errors: errors.filter((e) => e.includes("Canada")),
      },
    ],
    errors,
  };
}
