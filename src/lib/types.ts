export type DiplomaLevel =
  | "certificat_primaire"
  | "bac"
  | "licence"
  | "master";

export type ActivityStatus = "eleve" | "etudiant" | "travailleur";

export type ParentalStatus =
  | "deux_parents_vivants"
  | "orphelin_pere"
  | "orphelin_mere";

export type EnglishLevel =
  | "debutant"
  | "elementaire"
  | "intermediaire"
  | "intermediaire_superieur"
  | "avance"
  | "bilingue"
  | "natif";

export type ScholarshipStatus = "encours" | "fermee" | "a_venir";

export type StudyCycle = "undergraduate" | "master" | "doctorate";

export type { EducationLevel, CandidatCategory } from "./education-levels";

import type { EducationLevel } from "./education-levels";

/** Compte utilisateur — identité & authentification uniquement */
export interface UserAccount {
  id: string;
  nom: string;
  postNom: string;
  prenom: string;
  telephone: string;
  email: string;
  password: string;
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Profil candidat — académique & éligibilité bourses.
 * Distinct du compte : nécessite une session active + abonnement.
 */
export interface CandidateProfile {
  nom: string;
  postNom: string;
  prenom: string;
  dateNaissance: string;
  age: number;
  /** Niveau d'études aligné norme internationale — pilote le filtrage des bourses */
  niveauEtudes: EducationLevel;
  dernierDiplome: DiplomaLevel;
  filiere?: string;
  moyenneDernierDiplome?: number;
  moyenneBac?: number;
  activiteEnCours: ActivityStatus;
  niveauAnglais: EnglishLevel;
  statutParental: ParentalStatus;
  anneesExperience?: number;
  domaineProfessionnel?: string;
  certificatLangue: string;
  passeport: boolean;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  active: boolean;
  startedAt: string;
  expiresAt: string;
}

export interface Scholarship {
  id: string;
  nom: string;
  paysHote: string;
  /** Cycles financés (norme internationale) */
  cyclesFinances: StudyCycle[];
  niveauDisponible: string[];
  dateCloture: string;
  avantages: string[];
  conditionsEligibilite: string[];
  lienOfficiel: string;
  status: ScholarshipStatus;
  /** Source de la donnée (curated, rss, sync, etc.) */
  source?: string;
  /** Date de dernière synchronisation (ISO) */
  syncedAt?: string;
}

export interface AccompanimentRequest {
  id: string;
  nomPrenom: string;
  email: string;
  whatsapp: string;
  bourseId: string;
  bourseNom: string;
  paid: boolean;
  createdAt: string;
}
