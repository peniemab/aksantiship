/**
 * Sync CUCAS Chine uniquement (11 470+ bourses répertoriées).
 *
 * Usage :
 *   npm run sync:china              # ~400 pages (~3500 bourses)
 *   npm run sync:china:full         # catalogue complet (~1147 pages)
 *   npm run sync:china -- --pages=200
 *
 * PowerShell (variable d'environnement) :
 *   $env:CHINA_SYNC_MAX_PAGES=0; npm run sync:china
 */
import { fetchCucasChinaScholarships } from "../src/lib/bourses/sync/cucas-china";
import { writeChinaScholarshipsFile } from "../src/lib/bourses/sync/china-storage";

function resolveMaxPages(): number {
  const args = process.argv.slice(2);

  if (args.includes("--full") || args.includes("-f")) {
    return 0;
  }

  const pagesArg = args.find((a) => a.startsWith("--pages="));
  if (pagesArg) {
    const n = parseInt(pagesArg.split("=")[1] ?? "", 10);
    if (!Number.isNaN(n) && n >= 0) return n;
  }

  const raw = process.env.CHINA_SYNC_MAX_PAGES;
  if (raw !== undefined && raw !== "") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 0) return n;
  }

  return 400;
}

async function main() {
  const maxPages = resolveMaxPages();
  const label = maxPages === 0 ? "illimité (~11 470 bourses)" : `${maxPages} pages`;

  console.log(`Sync CUCAS Chine (max ${label})...\n`);

  const scholarships = await fetchCucasChinaScholarships({
    maxPages,
    onProgress: (page, added, total) => {
      if (page % 20 === 0 || page === 1) {
        console.log(`  page ${page} (+${added}) → ${total} bourses`);
      }
    },
  });

  writeChinaScholarshipsFile(scholarships);

  const chine = scholarships.filter((s) => s.paysHote === "Chine").length;
  console.log(`\nTerminé : ${scholarships.length} bourses enregistrées (${chine} Chine)`);
  console.log(`Fichier : data/china-cucas-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
