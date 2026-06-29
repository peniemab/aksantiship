/**
 * Sync bourses Belgique — Study in Belgium (FWB) + Flandre (Master Mind).
 * Usage : npm run sync:belgium
 */
import { fetchBelgiumScholarships } from "../src/lib/bourses/sync/studyinbelgium";
import { writeBelgiumScholarshipsFile } from "../src/lib/bourses/sync/belgium-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";

async function main() {
  console.log("Sync Belgique (Study in Belgium + Flandre)...\n");

  const scholarships = await fetchBelgiumScholarships();
  writeBelgiumScholarshipsFile(scholarships);

  const open = scholarships.filter((s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee");
  const fwb = scholarships.filter((s) => s.communaute?.includes("Wallonie")).length;
  const flanders = scholarships.filter((s) => s.communaute === "Flandre").length;

  console.log(`Terminé : ${scholarships.length} programmes (${fwb} FWB, ${flanders} Flandre)`);
  console.log(`Ouverts aujourd'hui : ${open.length}`);
  console.log(`Fichier : data/belgium-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
