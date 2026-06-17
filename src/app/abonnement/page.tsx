"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Button } from "@/components/ui/Form";
import { SUBSCRIPTION_PRICE_USD } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

function SubscriptionContent() {
  const { hasActiveSubscription, subscription } = useAuth();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-extrabold text-foreground">Souscrire un abonnement</h1>
      <p className="mt-4 text-muted leading-relaxed">
        Souscrire à un abonnement vous permet de garder votre profil à jour et d&apos;être
        informé de toutes les bourses disponibles pour votre profil.
      </p>

      {hasActiveSubscription && subscription ? (
        <div className="mt-6">
          <Alert type="success">
            Votre abonnement est actif jusqu&apos;au{" "}
            <strong>{formatDate(subscription.expiresAt)}</strong>.
          </Alert>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-2xl border-2 border-aksanti-red/20 bg-aksanti-red/5 p-6 text-center">
            <p className="text-sm text-muted">Abonnement annuel</p>
            <p className="mt-2 text-4xl font-extrabold text-aksanti-red">
              ${SUBSCRIPTION_PRICE_USD}
              <span className="text-base font-normal text-muted">/an</span>
            </p>
            <ul className="mt-4 space-y-2 text-left text-sm text-muted">
              <li>✓ Profil actif et mis à jour</li>
              <li>✓ Accès à toutes les bourses filtrées</li>
              <li>✓ Alertes sur les nouvelles opportunités</li>
              <li>✓ Mise à jour du profil après 1 mois</li>
            </ul>
          </div>

          <Button
            className="mt-6 w-full"
            onClick={() => router.push("/paiement?type=abonnement")}
          >
            Cliquez ici pour souscrire à un abonnement
          </Button>
        </>
      )}
    </div>
  );
}

export default function AbonnementPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto px-4 sm:px-6">
          <RequireAuth requireVerified>
            <SubscriptionContent />
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
