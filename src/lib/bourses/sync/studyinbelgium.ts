import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  COMMUNAUTE_FWB,
  COMMUNAUTE_FLANDRE,
  inferBelgiumDeadline,
  inferBelgiumInstructionLanguage,
  inferBelgiumLevels,
  inferBelgiumMonthlyAllowance,
  slugifyBelgiumTitle,
  STUDY_IN_BELGIUM_URL,
} from "../belgium-deadlines";
import {
  buildStudyInBelgiumUrl,
  inferProviderFromTitle,
  mergeStudyInBelgiumEntries,
  parseStudyInBelgiumHtml,
  type StudyInBelgiumMergedEntry,
} from "./belgium-parse-html";

const HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0)",
};

export async function fetchStudyInBelgiumHtml(): Promise<string> {
  const res = await fetch(STUDY_IN_BELGIUM_URL, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`Study in Belgium (${res.status})`);
  }
  return res.text();
}

export function studyInBelgiumEntryToScholarship(
  entry: StudyInBelgiumMergedEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const organisme = inferProviderFromTitle(entry.title);
  const communaute = COMMUNAUTE_FWB;
  const langueEnseignement = inferBelgiumInstructionLanguage(entry.title, communaute);
  const { cycles, niveaux } = inferBelgiumLevels(entry.title);
  const dateCloture = inferBelgiumDeadline(entry.title, organisme);
  const allocationMensuelle = inferBelgiumMonthlyAllowance(entry.title);

  const nationalitesEligibles = [...new Set(entry.audiences)].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  const avantages = [`Programme référencé sur Study in Belgium (${communaute})`];
  if (allocationMensuelle) {
    avantages.push(`Allocation indicative : ~${allocationMensuelle} €/mois`);
  }

  const conditions = [
    `Communauté : ${communaute}`,
    `Langue d'enseignement : ${langueEnseignement}`,
  ];
  if (nationalitesEligibles.length && !nationalitesEligibles.includes("Toutes nationalités")) {
    conditions.push(`Public cible : ${nationalitesEligibles.join(", ")}`);
  }

  const slug = slugifyBelgiumTitle(entry.title);

  return {
    id: `belgium-fwb-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Belgique",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: buildStudyInBelgiumUrl(entry.path),
    status: resolveStatusFromDeadline(dateCloture),
    source: "studyinbelgium",
    syncedAt,
    organisme,
    communaute,
    langueEnseignement,
    allocationMensuelle,
    nationalitesEligibles,
  };
}

/** Programmes flamands majeurs (non listés sur Study in Belgium). */
export function getFlandersCuratedScholarships(syncedAt: string): Scholarship[] {
  const communaute = COMMUNAUTE_FLANDRE;

  return [
    {
      id: "belgium-master-mind",
      nom: "Master Mind Scholarship (Gouvernement flamand)",
      paysHote: "Belgique",
      cyclesFinances: ["master"],
      niveauDisponible: ["Master"],
      dateCloture: inferBelgiumDeadline("Master Mind", "Flandre"),
      avantages: [
        "Grant ~10 225 €/an + exonération des frais de scolarité",
        "30–40 bourses d'excellence par an",
        "Candidature via l'université flamande d'accueil",
      ],
      conditionsEligibilite: [
        "Excellence académique internationale",
        "Programmes en Flandre ou Bruxelles (institutions flamandes)",
        "Clôtures universitaires : février–avril selon établissement",
      ],
      lienOfficiel: "https://www.studyinflanders.be/scholarships/master-mind-scholarships",
      status: resolveStatusFromDeadline(inferBelgiumDeadline("Master Mind", "Flandre")),
      source: "studyinflanders",
      syncedAt,
      organisme: "Gouvernement flamand",
      communaute,
      langueEnseignement: "Néerlandais",
      allocationMensuelle: 852,
      nationalitesEligibles: ["Toutes nationalités"],
    },
    {
      id: "belgium-study-in-flanders",
      nom: "Study in Flanders — portail bourses (communauté flamande)",
      paysHote: "Belgique",
      cyclesFinances: ["undergraduate", "master", "doctorate"],
      niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
      dateCloture: inferBelgiumDeadline("Master Mind", "Flandre"),
      avantages: [
        "Programmes néerlandophones et internationaux en anglais",
        "KU Leuven, Ghent, Antwerp, Hasselt, VUB…",
      ],
      conditionsEligibilite: [
        "Vérifiez la langue d'enseignement de chaque programme",
        "Master Mind : candidature indirecte via l'université",
      ],
      lienOfficiel: "https://www.studyinflanders.be/scholarships/master-mind-scholarships",
      status: "encours",
      source: "studyinflanders",
      syncedAt,
      organisme: "Study in Flanders",
      communaute,
      langueEnseignement: "Néerlandais",
      nationalitesEligibles: ["Toutes nationalités"],
    },
  ];
}

export async function fetchBelgiumScholarships(): Promise<Scholarship[]> {
  const syncedAt = new Date().toISOString();
  const html = await fetchStudyInBelgiumHtml();
  const raw = parseStudyInBelgiumHtml(html);
  const merged = mergeStudyInBelgiumEntries(raw);
  const fwb = merged.map((entry, index) =>
    studyInBelgiumEntryToScholarship(entry, index + 1, syncedAt),
  );
  const flanders = getFlandersCuratedScholarships(syncedAt);

  return [...fwb, ...flanders];
}
