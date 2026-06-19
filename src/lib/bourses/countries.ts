import { SCHOLARSHIPS } from "@/lib/data/scholarships";

export function countryToSlug(country: string): string {
  return country
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToCountry(slug: string): string | undefined {
  const countries = [...new Set(SCHOLARSHIPS.map((s) => s.paysHote))];
  return countries.find((c) => countryToSlug(c) === slug);
}

export const COUNTRY_SUMMARIES: Record<string, string> = {
  Turquie:
    "La Turquie accueille des milliers d'étudiants internationaux via des bourses gouvernementales couvrant frais de scolarité, logement et allocation mensuelle.",
  Japon:
    "Le Japon propose des programmes d'excellence (MEXT et autres) pour les candidats motivés à intégrer des universités de renom.",
  France:
    "La France reste une destination phare grâce à des programmes comme Campus France, l'Eiffel et de nombreuses bourses institutionnelles.",
  Allemagne:
    "L'Allemagne offre des bourses DAAD et des formations de qualité, souvent en anglais ou avec année preparatoire en allemand.",
  Belgique:
    "La Belgique propose des opportunités pour étudiants internationaux via des programmes universitaires et bourses partenaires.",
  Roumanie:
    "La Roumanie attire de plus en plus de candidats africains avec des bourses accessibles et un coût de vie modéré.",
  "Royaume-Uni":
    "Le Royaume-Uni concentre des bourses prestigieuses (Chevening, Commonwealth) pour les profils académiques solides.",
  International:
    "Ces bourses ne ciblent pas un seul pays : elles couvrent plusieurs destinations ou des institutions multinationales.",
};

export function getCountrySummary(country: string): string {
  return (
    COUNTRY_SUMMARIES[country] ??
    `Découvrez les bourses disponibles pour étudier en ${country} ou avec ${country} comme pays hôte.`
  );
}

export function getCountryHref(country: string): string {
  return `/pays/${countryToSlug(country)}`;
}
