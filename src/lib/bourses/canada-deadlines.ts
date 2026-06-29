import type { StudyCycle } from "../types";
import type { CanadaApplicationType } from "./canada-application";

export type CanadaSyncIntensity = "daily" | "weekly" | "monthly";

/** Pic janv.–mars (ÉduCanada) ; sept.–nov. (Pearson, McCall MacBain). */
export function getCanadaSyncIntensity(date = new Date()): CanadaSyncIntensity {
  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 3) return "daily";
  if (month >= 9 && month <= 11) return "daily";
  if (month >= 4 && month <= 8) return "weekly";
  return "monthly";
}

export const EDUCANADA_URL =
  "https://www.educanada.ca/scholarships-bourses/can/institutions/study-in-canada-sep-etudes-au-canada-pct.aspx?lang=fra";

export const UDEM_BOURSES_URL =
  "https://bourses.umontreal.ca/repertoire-des-bourses/?tx_udembourses%5Bdo_search%5D=1&tx_udembourses%5Bmc%5D=&tx_udembourses%5Btp%5D%5B%5D=11";

function nextSeasonDate(month: number, day: number, from = new Date()): string {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const y = candidate < from ? year + 1 : year;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function inferCanadaDeadline(
  title: string,
  provider?: string,
  endAt?: string,
): string {
  if (endAt && /^\d{4}-\d{2}-\d{2}/.test(endAt)) {
    return endAt.slice(0, 10);
  }

  const t = title.toLowerCase();
  const p = (provider ?? "").toLowerCase();

  if (t.includes("pearson")) return nextSeasonDate(1, 15);
  if (t.includes("mccall macbain") || t.includes("macbain")) return nextSeasonDate(9, 30);
  if (t.includes("bec") || t.includes("study in canada") || t.includes("études au canada")) {
    return nextSeasonDate(3, 31);
  }
  if (t.includes("elap") || t.includes("leaders émergents")) return nextSeasonDate(3, 31);
  if (t.includes("vanier")) return nextSeasonDate(11, 1);
  if (p.includes("educanada") || p.includes("affaires mondiales")) return nextSeasonDate(3, 31);
  if (t.includes("president") || t.includes("excellence")) return nextSeasonDate(2, 1);
  if (t.includes("master")) return nextSeasonDate(3, 15);
  if (t.includes("doctor") || t.includes("postdoc")) return nextSeasonDate(10, 15);

  return nextSeasonDate(8, 31);
}

export function inferCanadaLevels(title: string): {
  cycles: StudyCycle[];
  niveaux: string[];
} {
  const t = title.toLowerCase();
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  if (t.includes("doctor") || t.includes("postdoc") || t.includes("vanier") || t.includes("banting")) {
    cycles.add("doctorate");
    niveaux.push("Doctorat / recherche");
  }
  if (t.includes("master") || t.includes("maîtrise") || t.includes("maitrise")) {
    cycles.add("master");
    niveaux.push("Master");
  }
  if (
    t.includes("undergraduate") ||
    t.includes("bachelor") ||
    t.includes("baccalauréat") ||
    t.includes("licence") ||
    t.includes("pearson")
  ) {
    cycles.add("undergraduate");
    niveaux.push("Licence / Bachelor");
  }

  if (cycles.size === 0) {
    return {
      cycles: ["undergraduate", "master", "doctorate"],
      niveaux: ["Licence / Bachelor", "Master", "Doctorat"],
    };
  }

  return { cycles: [...cycles], niveaux };
}

export function inferCanadaApplicationType(
  title: string,
  provider?: string,
  source?: string,
): { typeCandidature: CanadaApplicationType; attributionAutomatiqueAdmission: boolean } {
  const t = title.toLowerCase();
  const p = (provider ?? "").toLowerCase();

  if (
    t.includes("pearson") ||
    t.includes("president") ||
    t.includes("automatic") ||
    t.includes("à l'admission") ||
    t.includes("admission automatique") ||
    (p.includes("université") && t.includes("excellence"))
  ) {
    return { typeCandidature: "automatique_admission", attributionAutomatiqueAdmission: true };
  }

  if (
    t.includes("bec") ||
    t.includes("study in canada") ||
    t.includes("études au canada") ||
    t.includes("elap") ||
    t.includes("leaders émergents") ||
    p.includes("educanada") ||
    p.includes("affaires mondiales")
  ) {
    return { typeCandidature: "via_etablissement", attributionAutomatiqueAdmission: false };
  }

  if (source === "umontreal") {
    return { typeCandidature: "directe", attributionAutomatiqueAdmission: false };
  }

  return { typeCandidature: "directe", attributionAutomatiqueAdmission: false };
}

export function slugifyCanadaTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

export function parseUdemIsoDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return m?.[1];
}
