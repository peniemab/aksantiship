import type { EducationLevel } from "../education-levels";
import type { Scholarship, ScholarshipStatus, StudyCycle } from "../types";

export interface BourseMatchInfo {
  matches: boolean;
  score: number;
  reason: string;
  matchingCycles: StudyCycle[];
}

export interface BourseWithMatch extends Scholarship {
  match?: BourseMatchInfo;
}

export interface BoursesListMeta {
  total: number;
  returned: number;
  matched?: number;
  excluded?: number;
}

export interface BoursesListResponse {
  data: BourseWithMatch[];
  meta: BoursesListMeta;
}

export interface BourseDetailResponse {
  data: BourseWithMatch;
}

export interface BoursesQueryParams {
  status?: ScholarshipStatus;
  featured?: boolean;
  niveauEtudes?: EducationLevel;
  matchOnly?: boolean;
  includeMatch?: boolean;
  q?: string;
  pays?: string;
  cycle?: StudyCycle | "all";
}

export interface BourseRepositoryQuery {
  status?: ScholarshipStatus;
  featured?: boolean;
  q?: string;
  pays?: string;
  cycle?: StudyCycle | "all";
}
