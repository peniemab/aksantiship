import type { StudyCycle } from "../types";

export type BelgiumSyncIntensity = "daily" | "weekly" | "monthly";

/** Pic sept.–janv. (ARES) puis fév.–avr. (Master Mind, universités). */
export function getBelgiumSyncIntensity(date = new Date()): BelgiumSyncIntensity {
  const month = date.getMonth() + 1;
  if (month >= 9 || month <= 1) return "daily";
  if (month >= 2 && month <= 4) return "weekly";
  return "monthly";
}

export const STUDY_IN_BELGIUM_URL = "https://www.studyinbelgium.be/fr/bourses";
export const COMMUNAUTE_FWB = "Fédération Wallonie-Bruxelles";
export const COMMUNAUTE_FLANDRE = "Flandre";

function nextSeasonDate(month: number, day: number, from = new Date()): string {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const y = candidate < from ? year + 1 : year;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function inferBelgiumDeadline(title: string, provider?: string): string {
  const t = title.toLowerCase();
  const p = (provider ?? "").toLowerCase();

  if (t.includes("master mind") || p.includes("flandre")) return nextSeasonDate(4, 1);
  if (t.includes("ares") && t.includes("master")) return nextSeasonDate(1, 15);
  if (t.includes("ares") && t.includes("stage")) return nextSeasonDate(1, 15);
  if (t.includes("ares")) return nextSeasonDate(1, 15);
  if (t.includes("vlir")) return nextSeasonDate(2, 1);
  if (t.includes("excellence") && t.includes("wbi")) return nextSeasonDate(3, 31);
  if (t.includes("master in") && t.includes("wbi")) return nextSeasonDate(3, 31);
  if (t.includes("erasmus mundus") || t.includes("emotion")) return nextSeasonDate(2, 15);
  if (t.includes("post-doc") || t.includes("postdoctor")) return nextSeasonDate(8, 31);
  if (t.includes("fnrs") || t.includes("fresh") || t.includes("fria")) {
    return nextSeasonDate(8, 31);
  }
  if (t.includes("master")) return nextSeasonDate(3, 31);
  if (t.includes("doctor") || t.includes("doctin")) return nextSeasonDate(10, 15);

  return nextSeasonDate(8, 31);
}

export function inferBelgiumLevels(title: string): {
  cycles: StudyCycle[];
  niveaux: string[];
} {
  const t = title.toLowerCase();
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  if (t.includes("doctor") || t.includes("doctin") || t.includes("post-doc") || t.includes("chercheur")) {
    cycles.add("doctorate");
    niveaux.push("Doctorat / recherche");
  }
  if (t.includes("master") || t.includes("magíster") || t.includes("erasmus mundus")) {
    cycles.add("master");
    niveaux.push("Master");
  }
  if (t.includes("stage") || t.includes("pregrado") || t.includes("undergraduate")) {
    cycles.add("undergraduate");
    niveaux.push("Licence / Bachelor / stage");
  }

  if (cycles.size === 0) {
    return {
      cycles: ["undergraduate", "master", "doctorate"],
      niveaux: ["Licence / Bachelor", "Master", "Doctorat"],
    };
  }

  return { cycles: [...cycles], niveaux };
}

export function inferBelgiumInstructionLanguage(
  title: string,
  communaute: string,
): string {
  const t = title.toLowerCase();

  if (communaute === COMMUNAUTE_FLANDRE) {
    if (t.includes("english") || t.includes("international")) return "Anglais";
    return "Néerlandais";
  }

  if (/\b(english|international|erasmus mundus|embo|erc)\b/.test(t)) {
    return "Anglais";
  }

  return "Français";
}

export function inferBelgiumMonthlyAllowance(title: string): number | undefined {
  const t = title.toLowerCase();
  if (t.includes("ares") && (t.includes("master") || t.includes("stage"))) return 1500;
  if (t.includes("master mind")) return 852;
  if (t.includes("vlir")) return 1150;
  if (t.includes("excellence") && t.includes("wbi")) return 1200;
  return undefined;
}

export function slugifyBelgiumTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}
