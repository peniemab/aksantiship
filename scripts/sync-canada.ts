/**
 * Sync bourses Canada — ÉduCanada (curated) + répertoire UdeM.
 * Usage : npm run sync:canada
 */
import { fetchCanadaScholarships } from "../src/lib/bourses/sync/canada-sync";
import { writeCanadaScholarshipsFile } from "../src/lib/bourses/sync/canada-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";

async function main() {
  console.log("Sync Canada (ÉduCanada + UdeM)...\n");

  const scholarships = await fetchCanadaScholarships();
  writeCanadaScholarshipsFile(scholarships);

  const open = scholarships.filter((s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee");
  const direct = scholarships.filter((s) => s.typeCandidature === "directe").length;
  const auto = scholarships.filter((s) => s.attributionAutomatiqueAdmission).length;
  const viaInst = scholarships.filter((s) => s.typeCandidature === "via_etablissement").length;

  console.log(`Terminé : ${scholarships.length} programmes`);
  console.log(`  Directes : ${direct} · Via université : ${viaInst} · Auto à l'admission : ${auto}`);
  console.log(`Ouverts aujourd'hui : ${open.length}`);
  console.log(`Fichier : data/canada-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
