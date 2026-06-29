import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

const CANADA_FILE = path.join(process.cwd(), "data", "canada-scholarships.json");

export function writeCanadaScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(CANADA_FILE), { recursive: true });
  writeFileSync(
    CANADA_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "educanada+umontreal",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function getCanadaScholarshipsFilePath(): string {
  return CANADA_FILE;
}
