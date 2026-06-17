import {
  buildBoursesListResponse,
  parseEducationLevelParam,
  parseStatusParam,
} from "@/lib/bourses/service";
import type { BoursesListResponse } from "@/lib/bourses/types";
import { NextResponse } from "next/server";

/**
 * GET /api/bourses
 *
 * Query params :
 * - status       : encours | fermee | a_venir
 * - featured     : true — bourses vitrine
 * - niveauEtudes : finaliste | bachelor | … — pour le matching profil
 * - matchOnly    : true — uniquement les bourses compatibles (nécessite niveauEtudes)
 * - includeMatch : true — ajoute score/raison sur chaque bourse
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const status = parseStatusParam(searchParams.get("status"));
  const featured = searchParams.get("featured") === "true";
  const niveauEtudes = parseEducationLevelParam(searchParams.get("niveauEtudes"));
  const matchOnly = searchParams.get("matchOnly") === "true";
  const includeMatch = searchParams.get("includeMatch") === "true";

  if (matchOnly && !niveauEtudes) {
    return NextResponse.json(
      { error: "Le paramètre niveauEtudes est requis lorsque matchOnly=true." },
      { status: 400 },
    );
  }

  const { data, meta } = buildBoursesListResponse({
    status,
    featured,
    niveauEtudes,
    matchOnly,
    includeMatch: includeMatch || matchOnly,
  });

  const response: BoursesListResponse = { data, meta };
  return NextResponse.json(response);
}
