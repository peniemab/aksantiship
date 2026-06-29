import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

const CHINA_FILE = path.join(process.cwd(), "data", "china-cucas-scholarships.json");

export function writeChinaScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(CHINA_FILE), { recursive: true });
  writeFileSync(
    CHINA_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "cucas",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function getChinaScholarshipsFilePath(): string {
  return CHINA_FILE;
}
