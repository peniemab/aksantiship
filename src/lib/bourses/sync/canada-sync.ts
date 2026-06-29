import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  EDUCANADA_URL,
  UDEM_BOURSES_URL,
  inferCanadaApplicationType,
  inferCanadaDeadline,
  inferCanadaLevels,
  parseUdemIsoDate,
  slugifyCanadaTitle,
} from "../canada-deadlines";
import { buildUdemBourseUrl, parseUdemBoursesHtml, type UdemBourseEntry } from "./canada-parse-html";

const HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0)",
};

export async function fetchUdemBoursesHtml(): Promise<string> {
  const res = await fetch(UDEM_BOURSES_URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`UdeM bourses (${res.status})`);
  return res.text();
}

export function getCanadaCuratedScholarships(syncedAt: string): Scholarship[] {
  const gov = (s: Omit<Scholarship, "syncedAt" | "source">): Scholarship => ({
    ...s,
    syncedAt,
    source: "educanada",
  });

  return [
    gov({
      id: "canada-bec",
      nom: "Bourses d'études au Canada (BEC)",
      paysHote: "Canada",
      cyclesFinances: ["undergraduate", "master", "doctorate"],
      niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
      dateCloture: "2027-03-31",
      avantages: [
        "10 200 $ à 14 000 $ CAD selon niveau",
        "Programme phare d'Affaires mondiales Canada",
      ],
      conditionsEligibilite: [
        "Pas de candidature directe par l'étudiant",
        "L'établissement d'accueil canadien soumet le dossier",
        "Ouverture : janvier–février · Clôture : fin mars",
      ],
      lienOfficiel: EDUCANADA_URL,
      status: "a_venir",
      organisme: "Affaires mondiales Canada",
      typeCandidature: "via_etablissement",
      attributionAutomatiqueAdmission: false,
      valeurFinanciere: "10 200 $ – 14 000 $ CAD",
      province: "Fédéral",
      nationalitesEligibles: ["Pays éligibles ÉduCanada"],
    }),
    gov({
      id: "canada-elap",
      nom: "Programme de bourses de leaders émergents des Amériques (ELAP)",
      paysHote: "Canada",
      cyclesFinances: ["undergraduate", "master"],
      niveauDisponible: ["Licence / Bachelor", "Master"],
      dateCloture: "2027-03-31",
      avantages: ["Échange universitaire au Canada", "Allocation selon durée du séjour"],
      conditionsEligibilite: [
        "Candidature via l'université d'origine partenaire",
        "Amériques latine et Caraïbes",
      ],
      lienOfficiel:
        "https://www.educanada.ca/bureau-international-agent-international/scholarships-bourses/americas-amerique/lac-elap-pca.aspx?lang=fra",
      status: "a_venir",
      organisme: "Affaires mondiales Canada",
      typeCandidature: "via_etablissement",
      attributionAutomatiqueAdmission: false,
      province: "Fédéral",
      nationalitesEligibles: ["Amérique latine et Caraïbes"],
    }),
    gov({
      id: "canada-educanada-portail",
      nom: "ÉduCanada — bourses gouvernementales",
      paysHote: "Canada",
      cyclesFinances: ["undergraduate", "master", "doctorate"],
      niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
      dateCloture: "2027-03-31",
      avantages: ["BEC, ELAP et programmes bilatéraux", "Référence officielle gouvernementale"],
      conditionsEligibilite: [
        "Pic d'ouverture janvier–mars",
        "Vérifier si candidature directe ou via établissement",
      ],
      lienOfficiel: "https://www.educanada.ca/scholarships-bourses/index.aspx?lang=fra",
      status: "encours",
      organisme: "ÉduCanada",
      typeCandidature: "via_etablissement",
      province: "Fédéral",
      nationalitesEligibles: ["Toutes nationalités (selon programme)"],
    }),
    {
      id: "canada-mccall-macbain",
      nom: "Bourse McCall MacBain (McGill)",
      paysHote: "Canada",
      cyclesFinances: ["master"],
      niveauDisponible: ["Master"],
      dateCloture: "2026-09-30",
      avantages: [
        "Bourse intégrale master + allocation mensuelle",
        "Programme d'excellence à McGill (Montréal)",
      ],
      conditionsEligibilite: [
        "Excellence académique et leadership",
        "Ouverture : septembre · Clôture : fin septembre / décembre selon cycle",
      ],
      lienOfficiel: "https://www.mccallmacbain.org/",
      status: "a_venir",
      source: "curated",
      syncedAt,
      organisme: "Fondation McCall MacBain",
      typeCandidature: "directe",
      attributionAutomatiqueAdmission: false,
      valeurFinanciere: "Bourse intégrale + allocation",
      province: "Québec",
      nationalitesEligibles: ["Toutes nationalités"],
    },
    {
      id: "canada-uottawa-president",
      nom: "University of Ottawa — bourses d'excellence (entrée automatique)",
      paysHote: "Canada",
      cyclesFinances: ["undergraduate"],
      niveauDisponible: ["Licence / Bachelor"],
      dateCloture: "2026-03-01",
      avantages: [
        "Jusqu'à 60 000 $ CAD sur 4 ans (excellence)",
        "Attribuée automatiquement à la demande d'admission",
      ],
      conditionsEligibilite: [
        "Aucun formulaire de bourse séparé",
        "Déposer la demande d'admission avant la date limite",
      ],
      lienOfficiel: "https://www.uottawa.ca/etudes/bourses-finances/bourses-merite",
      status: "encours",
      source: "curated",
      syncedAt,
      organisme: "Université d'Ottawa",
      typeCandidature: "automatique_admission",
      attributionAutomatiqueAdmission: true,
      valeurFinanciere: "Jusqu'à 60 000 $ CAD / 4 ans",
      province: "Ontario",
      nationalitesEligibles: ["Étudiants internationaux"],
    },
    {
      id: "canada-utoronto-intl",
      nom: "University of Toronto — bourses internationales (admission)",
      paysHote: "Canada",
      cyclesFinances: ["undergraduate", "master"],
      niveauDisponible: ["Licence / Bachelor", "Master"],
      dateCloture: "2026-02-15",
      avantages: [
        "Bourses d'entrée automatiques selon dossier",
        "Programmes Lester B. Pearson (sélection séparée)",
      ],
      conditionsEligibilite: [
        "La plupart des bourses d'entrée ne requièrent pas de formulaire séparé",
        "Pearson : candidature via l'établissement secondaire",
      ],
      lienOfficiel: "https://future.utoronto.ca/scholarships-international-students",
      status: "encours",
      source: "curated",
      syncedAt,
      organisme: "Université de Toronto",
      typeCandidature: "automatique_admission",
      attributionAutomatiqueAdmission: true,
      province: "Ontario",
      nationalitesEligibles: ["Étudiants internationaux"],
    },
    {
      id: "canada-umontreal-repertoire",
      nom: "Répertoire des bourses — Université de Montréal",
      paysHote: "Canada",
      cyclesFinances: ["undergraduate", "master", "doctorate"],
      niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
      dateCloture: "2026-08-31",
      avantages: [
        "140+ bourses de fondations privées et associatives",
        "Dates limites étalées (souvent été pour bourses privées)",
      ],
      conditionsEligibilite: [
        "Candidatures directes selon chaque fondation",
        "Certaines réservées aux étudiant(e)s UdeM",
      ],
      lienOfficiel: UDEM_BOURSES_URL,
      status: "encours",
      source: "umontreal",
      syncedAt,
      organisme: "Université de Montréal",
      typeCandidature: "directe",
      province: "Québec",
      nationalitesEligibles: ["Selon bourse"],
    },
  ];
}

export function udemEntryToScholarship(
  entry: UdemBourseEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const endAt = parseUdemIsoDate(entry.dateLimiteIso);
  const { cycles, niveaux } = inferCanadaLevels(entry.title);
  const { typeCandidature, attributionAutomatiqueAdmission } = inferCanadaApplicationType(
    entry.title,
    "Université de Montréal",
    "umontreal",
  );
  const dateCloture = inferCanadaDeadline(entry.title, "UdeM", endAt);

  const avantages = ["Bourse répertoriée — Université de Montréal (fondations / privées)"];
  if (entry.montant) avantages.push(`Montant : ${entry.montant}`);
  if (entry.description) avantages.push(entry.description);

  const conditions = [
    "Candidature directe (consulter la fiche UdeM)",
    "Province : Québec",
  ];
  if (entry.expired) conditions.push("Statut catalogue : session précédente (date à confirmer)");

  const slug = slugifyCanadaTitle(entry.title);

  return {
    id: `canada-udem-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Canada",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: buildUdemBourseUrl(entry.path),
    status: resolveStatusFromDeadline(dateCloture),
    source: "umontreal",
    syncedAt,
    organisme: "Université de Montréal",
    typeCandidature,
    attributionAutomatiqueAdmission,
    valeurFinanciere: entry.montant,
    province: "Québec",
    langueEnseignement: "Français",
    nationalitesEligibles: ["Selon bourse"],
  };
}

export async function fetchCanadaScholarships(): Promise<Scholarship[]> {
  const syncedAt = new Date().toISOString();
  const curated = getCanadaCuratedScholarships(syncedAt);

  const html = await fetchUdemBoursesHtml();
  const entries = parseUdemBoursesHtml(html);
  const udem = entries.map((entry, index) => udemEntryToScholarship(entry, index + 1, syncedAt));

  return [...curated, ...udem];
}
