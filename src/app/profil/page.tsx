"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Button, FormField, Input, Select } from "@/components/ui/Form";
import {
  ACTIVITY_OPTIONS,
  DIPLOMA_OPTIONS,
  DOCUMENT_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  ENGLISH_LEVEL_OPTIONS,
  LANGUAGE_CERTIFICATES,
  PARENTAL_STATUS_OPTIONS,
} from "@/lib/constants";
import { suggestEducationLevel } from "@/lib/education-levels";
import type { EducationLevel } from "@/lib/education-levels";
import type { ActivityStatus, CandidateProfile, DiplomaLevel } from "@/lib/types";
import { calculateAge, canUpdateProfile } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const emptyForm = {
  nom: "",
  postNom: "",
  prenom: "",
  dateNaissance: "",
  niveauEtudes: "" as EducationLevel | "",
  dernierDiplome: "" as DiplomaLevel | "",
  filiere: "",
  moyenneDernierDiplome: "",
  moyenneBac: "",
  activiteEnCours: "" as ActivityStatus | "",
  niveauAnglais: "",
  statutParental: "",
  anneesExperience: "",
  domaineProfessionnel: "",
  certificatLangue: "Aucun",
  passeport: "",
  documents: [] as string[],
};

function ProfileForm() {
  const { user, profile, hasActiveSubscription, savePendingProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [niveauManuallySet, setNiveauManuallySet] = useState(false);

  const isPrimary = form.dernierDiplome === "certificat_primaire";
  const isBac = form.dernierDiplome === "bac";
  const isTravailleur = form.activiteEnCours === "travailleur";
  const isEditing = !!profile;
  const canEdit = !isEditing || canUpdateProfile(profile?.updatedAt, hasActiveSubscription);

  useEffect(() => {
    if (profile) {
      setForm({
        nom: profile.nom,
        postNom: profile.postNom,
        prenom: profile.prenom,
        dateNaissance: profile.dateNaissance,
        niveauEtudes: profile.niveauEtudes,
        dernierDiplome: profile.dernierDiplome,
        filiere: profile.filiere ?? "",
        moyenneDernierDiplome: profile.moyenneDernierDiplome?.toString() ?? "",
        moyenneBac: profile.moyenneBac?.toString() ?? "",
        activiteEnCours: profile.activiteEnCours,
        niveauAnglais: profile.niveauAnglais,
        statutParental: profile.statutParental,
        anneesExperience: profile.anneesExperience?.toString() ?? "",
        domaineProfessionnel: profile.domaineProfessionnel ?? "",
        certificatLangue: profile.certificatLangue,
        passeport: profile.passeport ? "oui" : "non",
        documents: profile.documents,
      });
      setNiveauManuallySet(true);
    } else if (user) {
      setForm((f) => ({
        ...f,
        nom: user.nom,
        postNom: user.postNom,
        prenom: user.prenom,
      }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (niveauManuallySet || !form.dernierDiplome || !form.activiteEnCours) return;
    const suggested = suggestEducationLevel(form.dernierDiplome, form.activiteEnCours);
    setForm((f) => ({ ...f, niveauEtudes: suggested }));
  }, [form.dernierDiplome, form.activiteEnCours, niveauManuallySet]);

  const age = form.dateNaissance ? calculateAge(form.dateNaissance) : null;

  const toggleDocument = (doc: string) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.includes(doc)
        ? f.documents.filter((d) => d !== doc)
        : [...f.documents, doc],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canEdit) {
      setError(
        "La mise à jour du profil n'est possible qu'après 1 mois et avec un abonnement actif.",
      );
      return;
    }

    if (
      !form.niveauEtudes ||
      !form.dernierDiplome ||
      !form.activiteEnCours ||
      !form.niveauAnglais ||
      !form.statutParental ||
      !form.passeport
    ) {
      setError("Veuillez remplir tous les champs obligatoires, notamment le niveau d'études.");
      return;
    }

    const candidateProfile: CandidateProfile = {
      nom: form.nom,
      postNom: form.postNom,
      prenom: form.prenom,
      dateNaissance: form.dateNaissance,
      age: age ?? 0,
      niveauEtudes: form.niveauEtudes,
      dernierDiplome: form.dernierDiplome,
      filiere: isPrimary ? undefined : form.filiere || undefined,
      moyenneDernierDiplome: isPrimary ? undefined : parseFloat(form.moyenneDernierDiplome) || undefined,
      moyenneBac: isBac
        ? parseFloat(form.moyenneDernierDiplome) || undefined
        : parseFloat(form.moyenneBac) || undefined,
      activiteEnCours: form.activiteEnCours,
      niveauAnglais: form.niveauAnglais as CandidateProfile["niveauAnglais"],
      statutParental: form.statutParental as CandidateProfile["statutParental"],
      anneesExperience: isTravailleur ? parseInt(form.anneesExperience) || 0 : undefined,
      domaineProfessionnel: isTravailleur ? form.domaineProfessionnel : undefined,
      certificatLangue: form.certificatLangue,
      passeport: form.passeport === "oui",
      documents: form.documents,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePendingProfile(candidateProfile);
    router.push("/paiement?type=profil");
  };

  const selectedLevel = EDUCATION_LEVEL_OPTIONS.find((o) => o.value === form.niveauEtudes);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
        <span className="text-lg">ℹ️</span>
        <div>
          <p className="font-semibold">Compte ≠ Profil</p>
          <p className="mt-1 text-blue-800/80">
            Votre compte (<strong>{user?.email}</strong>) sert à vous connecter.
            Ce formulaire crée votre <strong>profil candidat</strong> — il détermine quelles bourses
            vous correspondent selon la norme internationale (Bachelor, Master, PhD).
          </p>
        </div>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold text-foreground">
        {isEditing ? "Mon profil candidat" : "Étape 2 — Créer mon profil"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Renseignez votre parcours scolaire. Le niveau d&apos;études pilote le filtrage des opportunités.
      </p>

      {isEditing && !canEdit && (
        <div className="mt-4">
          <Alert type="warning">
            Mise à jour possible uniquement après 1 mois avec abonnement actif.{" "}
            {!hasActiveSubscription && (
              <Link href="/abonnement" className="font-semibold underline">Souscrire</Link>
            )}
          </Alert>
        </div>
      )}

      {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <fieldset className="space-y-4 rounded-xl border-2 border-ship-orange/30 bg-ship-orange/5 p-5">
          <legend className="px-2 text-sm font-bold text-ship-orange-dark">
            Niveau d&apos;études — Norme internationale (critère principal de filtrage)
          </legend>

          <FormField label="Dernier diplôme obtenu" required>
            <Select
              value={form.dernierDiplome}
              onChange={(e) => {
                setNiveauManuallySet(false);
                setForm({ ...form, dernierDiplome: e.target.value as DiplomaLevel });
              }}
              required
              disabled={!canEdit}
            >
              <option value="">Sélectionner...</option>
              {DIPLOMA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Activité en cours" required>
            <Select
              value={form.activiteEnCours}
              onChange={(e) => {
                setNiveauManuallySet(false);
                setForm({ ...form, activiteEnCours: e.target.value as ActivityStatus });
              }}
              required
              disabled={!canEdit}
            >
              <option value="">Sélectionner...</option>
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Niveau d'études actuel (norme internationale)"
            required
            hint="Auto-suggéré selon diplôme et activité — modifiable si besoin"
          >
            <Select
              value={form.niveauEtudes}
              onChange={(e) => {
                setNiveauManuallySet(true);
                setForm({ ...form, niveauEtudes: e.target.value as EducationLevel });
              }}
              required
              disabled={!canEdit}
            >
              <option value="">Sélectionner...</option>
              {EDUCATION_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.isced}
                </option>
              ))}
            </Select>
          </FormField>

          {selectedLevel && (
            <p className="rounded-lg bg-white px-4 py-3 text-sm text-muted">
              <strong>{selectedLevel.label}</strong> — {selectedLevel.description}
            </p>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Nom" required>
            <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required disabled={!canEdit} />
          </FormField>
          <FormField label="Post-nom" required>
            <Input value={form.postNom} onChange={(e) => setForm({ ...form, postNom: e.target.value })} required disabled={!canEdit} />
          </FormField>
          <FormField label="Prénom" required>
            <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required disabled={!canEdit} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date de naissance" required>
            <Input type="date" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} required disabled={!canEdit} />
          </FormField>
          <FormField label="Âge" hint="Calculé automatiquement">
            <Input value={age !== null ? `${age} ans` : ""} disabled readOnly />
          </FormField>
        </div>

        {!isPrimary && (
          <>
            <FormField label="Filière suivie" required>
              <Input value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })} required disabled={!canEdit} />
            </FormField>
            <FormField label="Moyenne obtenue au dernier diplôme" required>
              <Input type="number" min="0" max="100" step="0.01" value={form.moyenneDernierDiplome} onChange={(e) => setForm({ ...form, moyenneDernierDiplome: e.target.value })} required disabled={!canEdit} />
            </FormField>
          </>
        )}

        <FormField
          label="Moyenne obtenue au bac"
          required={!isBac && !isPrimary}
          hint={isBac ? "Verrouillé : le bac est votre dernier diplôme" : undefined}
        >
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={isBac ? form.moyenneDernierDiplome : form.moyenneBac}
            onChange={(e) => setForm({ ...form, moyenneBac: e.target.value })}
            disabled={!canEdit || isBac}
            required={!isBac && !isPrimary}
          />
        </FormField>

        <FormField label="Niveau d'anglais" required>
          <Select value={form.niveauAnglais} onChange={(e) => setForm({ ...form, niveauAnglais: e.target.value })} required disabled={!canEdit}>
            <option value="">Sélectionner...</option>
            {ENGLISH_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Statut parental" required>
          <Select value={form.statutParental} onChange={(e) => setForm({ ...form, statutParental: e.target.value })} required disabled={!canEdit}>
            <option value="">Sélectionner...</option>
            {PARENTAL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </FormField>

        {isTravailleur && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Années d'expérience professionnelle" required>
              <Input type="number" min="0" value={form.anneesExperience} onChange={(e) => setForm({ ...form, anneesExperience: e.target.value })} required disabled={!canEdit} />
            </FormField>
            <FormField label="Domaine professionnel" required>
              <Input value={form.domaineProfessionnel} onChange={(e) => setForm({ ...form, domaineProfessionnel: e.target.value })} required disabled={!canEdit} />
            </FormField>
          </div>
        )}

        <FormField label="Certificat de langue" required>
          <Select value={form.certificatLangue} onChange={(e) => setForm({ ...form, certificatLangue: e.target.value })} required disabled={!canEdit}>
            {LANGUAGE_CERTIFICATES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Passeport" required>
          <Select value={form.passeport} onChange={(e) => setForm({ ...form, passeport: e.target.value })} required disabled={!canEdit}>
            <option value="">Sélectionner...</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
          </Select>
        </FormField>

        <FormField label="Documents à votre possession">
          <div className="grid gap-2 sm:grid-cols-2">
            {DOCUMENT_OPTIONS.map((doc) => (
              <label key={doc} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.documents.includes(doc)}
                  onChange={() => toggleDocument(doc)}
                  disabled={!canEdit}
                  className="mt-0.5 accent-aksanti-red"
                />
                <span>{doc}</span>
              </label>
            ))}
          </div>
        </FormField>

        {canEdit && (
          <Button type="submit" className="w-full">
            {isEditing ? "Mettre à jour et payer" : "Enregistrer mon profil et souscrire"}
          </Button>
        )}
      </form>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <RequireAuth requireVerified>
            <ProfileForm />
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
