"use client";

import { Alert, Button, FormField, Input } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { safeRedirect } from "@/lib/navigation";

function InscriptionForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    postNom: "",
    prenom: "",
    telephone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    const err = register({
      nom: form.nom,
      postNom: form.postNom,
      prenom: form.prenom,
      telephone: form.telephone,
      email: form.email,
      password: form.password,
    });

    if (err) {
      setError(err);
      return;
    }
    router.push("/auth/verifier-email");
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-extrabold text-foreground">Créer un compte</h1>
      <p className="mt-2 text-sm text-muted">
        Veuillez remplir ces champs correctement.
      </p>

      {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Nom" required>
          <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
        </FormField>
        <FormField label="Post-nom" required>
          <Input value={form.postNom} onChange={(e) => setForm({ ...form, postNom: e.target.value })} required />
        </FormField>
        <FormField label="Prénom" required>
          <Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
        </FormField>
        <FormField label="Numéro de téléphone" required>
          <Input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} required />
        </FormField>
        <FormField label="Adresse mail" required>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </FormField>
        <FormField label="Mot de passe" required>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </FormField>
        <FormField label="Confirmation mot de passe" required>
          <Input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
        </FormField>
        <Button type="submit" className="w-full">Créer mon compte</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link
          href={
            redirectTo !== "/"
              ? `/auth/connexion?redirect=${encodeURIComponent(redirectTo)}`
              : "/auth/connexion"
          }
          className="font-semibold text-aksanti-red hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <p className="text-sm text-muted">Chargement...</p>
        </div>
      }
    >
      <InscriptionForm />
    </Suspense>
  );
}
