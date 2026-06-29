# Aksantiship

Portail de recherche de bourses d'études pour les candidats africains qui veulent financer leurs études à l'international.

Le nom vient de **Aksanti** (merci, en swahili) + **ship** (scholarship). L'idée : accompagner chaque candidat pas à pas, du profil jusqu'à la bonne opportunité.

---

## Ce que fait la plateforme

Je vise trois choses principales :

1. **Analyser le profil** du candidat (niveau d'études, diplômes, langues, documents…)
2. **Filtrer les bourses** qui correspondent vraiment à son profil — une bourse Master ne doit pas apparaître chez quelqu'un qui vient tout juste d'obtenir son bac
3. **Organiser les opportunités** selon leur statut : en cours, à venir, fermées

### Public visé

- **Finalistes** (bacheliers)
- **Étudiants** en cours de cursus
- **Diplômés** (licence, master, doctorat)

### Fonctionnalités en place (MVP)

- Page d'accueil vitrine
- Création de compte + connexion (email, mot de passe, vérification email simulée)
- Profil candidat séparé du compte (avec niveaux alignés sur la norme internationale : Bachelor, Master, PhD)
- Analyse du profil
- Mes opportunités (filtrées par compatibilité + statut)
- Abonnement et accompagnement (paiement en mode démo)
- API interne `/api/bourses` (données en fichier pour l'instant, prête pour une vraie BDD)

---

## Stack technique

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**

Pas de base de données pour le moment. Auth, profils et sessions sont stockés en **localStorage** côté navigateur — c'est volontaire pour cette phase de prototypage.

---

## Lancer le projet en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Autres commandes

```bash
npm run build          # build production
npm run start          # serveur production
npm run lint           # eslint
npm run sync:bourses   # RSS + Chine (calendrier automatique)
npm run sync:china     # Chine partielle (~3500 bourses)
npm run sync:china:full   # Catalogue CUCAS complet (~11 470 bourses)
npm run sync:france       # Campus France (~380 programmes)
```

---

## Synchronisation des bourses (maintenance annuelle)

Les bourses sont stockées dans `data/` et mises à jour par des scripts, pas à la main.

| Fichier | Contenu |
|---------|---------|
| `data/china-cucas-scholarships.json` | Bourses Chine (CUCAS) |
| `data/france-campusfrance-scholarships.json` | Bourses France (CampusBourses) |
| `data/scholarships-synced.json` | Bourses RSS internationales |

### France (CampusBourses — ~380 programmes)

Relancer **chaque année**, surtout **octobre–janvier** (Eiffel, programmes d'excellence) :

```bash
npm run sync:france
```

Puis committer :

```bash
git add data/france-campusfrance-scholarships.json
git commit -m "Mettre à jour le catalogue des bourses France"
```

Les dates `endAt` viennent de Campus France. Les bourses expirées sont masquées automatiquement.

### Chine (à relancer chaque année, surtout décembre–mars)

```bash
npm run sync:china:full
```

Puis committer :

### RSS + calendrier automatique

```bash
npm run sync:bourses
```

En production, planifier via cron : `GET /api/cron/sync-bourses` (header `Authorization: Bearer CRON_SECRET`).

---

## Structure du projet (l'essentiel)

```
src/
├── app/
│   ├── api/bourses/       # API interne des bourses
│   ├── auth/              # inscription, connexion, reset mdp
│   ├── profil/            # profil candidat
│   ├── analyse-profil/
│   ├── opportunites/
│   ├── abonnement/
│   ├── accompagnement/
│   └── paiement/
├── components/
├── context/               # AuthContext (session locale)
├── hooks/                 # useBourses
└── lib/
    ├── bourses/           # repository, service, client API
    ├── data/              # données bourses (temporaire)
    ├── education-levels.ts
    └── matching.ts        # logique profil ↔ bourse
```

---

## API bourses

| Endpoint | Description |
|----------|-------------|
| `GET /api/bourses` | Liste des bourses |
| `GET /api/bourses?featured=true` | Bourses vitrine (accueil) |
| `GET /api/bourses?status=encours` | Filtre par statut |
| `GET /api/bourses?niveauEtudes=bachelor&matchOnly=true` | Bourses compatibles avec un niveau |
| `GET /api/bourses/:id` | Détail d'une bourse |

Exemple :

```
GET /api/bourses?niveauEtudes=finaliste&matchOnly=true&includeMatch=true
```

---

## Parcours utilisateur (pour tester)

1. Créer un compte → `/auth/inscription`
2. Simuler la vérification email → `/auth/verifier-email`
3. Remplir le profil → `/profil`
4. Payer (démo) → enregistrement du profil
5. Voir l'analyse → `/analyse-profil`
6. Consulter les bourses filtrées → `/opportunites`

---

## Prochaines étapes (ma roadmap)

- [ ] Brancher **Supabase** ou **PostgreSQL** pour comptes, profils et bourses
- [ ] Back-office admin pour ajouter/modifier les bourses sans toucher au code
- [ ] Vrai envoi d'emails (confirmation, reset mdp)
- [ ] Passerelle de paiement (Mobile Money, etc.)
- [x] Enrichir le catalogue Chine via CUCAS (~9 000+ bourses)
- [ ] Sync dédiée **Turquie** (Türkiye Bursları, prochain pays prioritaire)
- [ ] Sync **France** (Campus France / programmes francophones)

---

## À propos

Projet porté par **Aksantifly** — Kinshasa, RDC.

> *« Aksantiship t'accompagne pas à pas dans la recherche d'une opportunité pour financer tes études à l'international. »*

---

## Licence

Projet privé — tous droits réservés.
