import type { Scholarship } from "@/lib/types";
import type { ScholarshipMatch } from "@/lib/matching";
import { STUDY_CYCLE_LABELS } from "@/lib/education-levels";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getCountryHref } from "@/lib/bourses/countries";

const statusLabels = {
  encours: { label: "En cours", className: "bg-green-100 text-green-700" },
  fermee: { label: "Fermée", className: "bg-red-100 text-red-700" },
  a_venir: { label: "À venir", className: "bg-amber-100 text-amber-700" },
};

export function ScholarshipCard({
  scholarship,
  match,
}: {
  scholarship: Scholarship;
  match?: ScholarshipMatch;
}) {
  const status = statusLabels[scholarship.status];

  return (
    <article className="rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{scholarship.nom}</h3>
          <p className="mt-1 text-sm text-muted">{scholarship.paysHote}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          {match?.matches && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              Compatible {match.score}%
            </span>
          )}
        </div>
      </div>

      {match?.matches && match.matchingCycles.length > 0 && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
          {match.reason}
        </p>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium text-foreground/70">Cycle :</dt>
          <dd className="text-muted">
            {scholarship.cyclesFinances.map((c) => STUDY_CYCLE_LABELS[c]).join(", ")}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-foreground/70">Niveau :</dt>
          <dd className="text-muted">{scholarship.niveauDisponible.join(", ")}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-foreground/70">Date de clôture :</dt>
          <dd className="text-muted">{formatDate(scholarship.dateCloture)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ship-orange">Avantages</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
          {scholarship.avantages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-aksanti-red">
          Conditions d&apos;éligibilité
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
          {scholarship.conditionsEligibilite.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <a
        href={scholarship.lienOfficiel}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-aksanti-red hover:underline"
      >
        Lien officiel pour candidater →
      </a>
    </article>
  );
}

export function ScholarshipCardCompact({ scholarship }: { scholarship: Scholarship }) {
  const status = statusLabels[scholarship.status];
  return (
    <Link
      href={getCountryHref(scholarship.paysHote)}
      className="group block rounded-2xl border border-border bg-white p-5 transition hover:border-aksanti-red/30 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground group-hover:text-aksanti-red">
          {scholarship.nom}
        </h3>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">{scholarship.paysHote}</p>
      <p className="mt-2 text-xs text-muted">
        {scholarship.niveauDisponible.join(" · ")}
      </p>
    </Link>
  );
}
