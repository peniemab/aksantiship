"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { ProfileAnalysisCard } from "@/components/ProfileAnalysisCard";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import { analyzeProfile, filterScholarshipsForProfile } from "@/lib/matching";
import type { BourseWithMatch } from "@/lib/bourses/types";
import type { ScholarshipStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useMemo, useState } from "react";

const tabs: { key: ScholarshipStatus; label: string }[] = [
  { key: "encours", label: "Bourses en cours" },
  { key: "a_venir", label: "Bourses à venir" },
  { key: "fermee", label: "Bourses fermées" },
];

function OpportunitiesContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ScholarshipStatus>("encours");
  const [showAnalysis, setShowAnalysis] = useState(true);

  const { bourses, meta, loading, error } = useBourses(
    profile
      ? {
          niveauEtudes: profile.niveauEtudes,
          includeMatch: true,
        }
      : {},
  );

  const analysis = useMemo(
    () => (profile && bourses.length > 0 ? analyzeProfile(profile, bourses) : null),
    [profile, bourses],
  );

  const tabCounts = useMemo(() => {
    if (!profile || !bourses.length) return {} as Record<ScholarshipStatus, number>;
    const counts: Record<ScholarshipStatus, number> = {
      encours: 0,
      a_venir: 0,
      fermee: 0,
    };
    for (const b of bourses) {
      const withMatch = b as BourseWithMatch;
      if (withMatch.match?.matches) {
        counts[b.status] += 1;
      }
    }
    return counts;
  }, [profile, bourses]);

  const matchedForTab = useMemo(() => {
    if (!profile) return [];
    return filterScholarshipsForProfile(profile, bourses, {
      status: activeTab,
      onlyMatches: true,
    });
  }, [profile, bourses, activeTab]);

  if (!profile) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">Mes Opportunités</h1>
        <p className="mt-2 text-muted">
          Fonctionnalité 2 & 3 — Filtrage et organisation des bourses selon votre profil.
        </p>
        <div className="mt-6 space-y-4">
          <Alert type="info">
            Vous avez un compte, mais pas encore de <strong>profil candidat</strong>.{" "}
            <Link href="/profil" className="font-semibold underline">Créer mon profil académique</Link>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-foreground">Mes Opportunités</h1>
      <p className="mt-2 text-muted">
        {loading
          ? "Chargement des bourses..."
          : `${matchedForTab.length} bourse${matchedForTab.length > 1 ? "s" : ""} compatible${matchedForTab.length > 1 ? "s" : ""} — ${analysis?.niveauLabel ?? ""}`}
      </p>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {meta?.excluded !== undefined && meta.excluded > 0 && (
        <div className="mt-4">
          <Alert type="info">
            {meta.excluded} bourse{meta.excluded > 1 ? "s" : ""} masquée{meta.excluded > 1 ? "s" : ""} —
            incompatible{meta.excluded > 1 ? "s" : ""} avec votre niveau d&apos;études.
          </Alert>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="mt-4 text-sm font-semibold text-aksanti-red hover:underline"
      >
        {showAnalysis ? "Masquer" : "Afficher"} l&apos;analyse du profil
      </button>

      {showAnalysis && analysis && (
        <div className="mt-6">
          <ProfileAnalysisCard analysis={analysis} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-aksanti-red text-white"
                : "border border-border bg-white text-foreground/70 hover:border-aksanti-red/30"
            }`}
          >
            {tab.label} ({tabCounts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : matchedForTab.length > 0 ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {matchedForTab.map((m) => (
            <ScholarshipCard key={m.scholarship.id} scholarship={m.scholarship} match={m} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-muted">
          Aucune bourse compatible dans cette catégorie pour votre niveau d&apos;études.
        </p>
      )}
    </div>
  );
}

export default function OpportunitesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <RequireAuth requireVerified>
            <OpportunitiesContent />
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
