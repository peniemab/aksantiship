import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCountryHref, getCountrySummary } from "@/lib/bourses/countries";
import {
  countBoursesByCountry,
  listScholarshipCountries,
} from "@/lib/bourses/repository";

export default function PaysIndexPage() {
  const countries = listScholarshipCountries();

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-foreground">Pays de destination</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Explorez les bourses par pays hôte. Complétez votre profil pour ne voir que celles
            compatibles avec votre niveau d&apos;études.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => {
              const count = countBoursesByCountry(country);
              return (
                <Link
                  key={country}
                  href={getCountryHref(country)}
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-aksanti-red/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-foreground group-hover:text-aksanti-red">
                      {country}
                    </h2>
                    <span className="shrink-0 rounded-full bg-aksanti-red/10 px-3 py-1 text-xs font-bold text-aksanti-red">
                      {count} bourse{count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                    {getCountrySummary(country)}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-aksanti-red">
                    Voir les bourses →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
