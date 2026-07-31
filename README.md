# PR-Front 🏆

**Le Power Ranking compétitif des tournois [OpenFront.io](https://openfront.io), façon Fortnite Tracker.**

Classement des joueurs par points cumulés sur les tournois du circuit : podium, profils
joueurs détaillés, décomposition des points phase par phase et stats live de l'API
publique OpenFront.

## 🌍 Voir le site en ligne

### Option A — GitHub Pages (gratuit, zéro config serveur)

Le site est prêt pour GitHub Pages. Mise en place (3 étapes, une seule fois) :

1. **Merger la pull request sur `main`**.
2. **Ajouter le workflow de déploiement** — GitHub n'autorise son ajout que via
   l'interface web : sur le repo → **Add file → Create new file** → nommez-le
   `.github/workflows/pages.yml` → collez le contenu de
   [`docs/github-pages-workflow.yml`](docs/github-pages-workflow.yml) → *Commit* sur `main`.
3. **Settings → Pages → Build and deployment → Source : « GitHub Actions »**.

➡️ Le site sera sur **https://skailex239.github.io/PR-Front/** et se redéploiera
**automatiquement à chaque push sur `main`**.

> Les données se mettent à jour en poussant les fichiers de `data/` sur `main`
> (l'agent le fait pour vous quand vous lui envoyez des résultats de tournoi).
> Limite : les stats live OpenFront sont chargées par le navigateur du visiteur —
> si l'API refuse la requête, le bloc affiche simplement « indisponible ».

### Option B — Vercel (gratuit, recommandé si vous voulez plus tard un vrai backend)

1. Créez un compte sur [vercel.com](https://vercel.com) avec GitHub.
2. « Add New → Project » → importer **Skailex239/PR-Front** → Deploy (rien à configurer).

➡️ URL type `pr-front.vercel.app`, redéploiement auto à chaque push, previews par branche.

## ⚙️ Fonctionnement du Power Ranking

- **Points par phase atteinte** (style FNCS) : chaque phase d'un tournoi (qualifications,
  demi-finale, finale…) attribue des points selon le placement.
- **Multiplicateur de tier** : `major ×1.5`, `standard ×1.0`, `minor ×0.5`.
- **Aucune décroissance** : tous les résultats comptent, cumul à vie.
- **Trois formats gérés** : FFA multi-manches, bracket 1v1, et `minor`
  (classement battle royale géant par tranches de placement, ex. 1er = 1000 pts,
  11e-15e = 220 pts, 100e et au-delà = 3 pts — voir `data/scoring.config.json`).
  Le barème `minor` inclut déjà ses points finaux : le multiplicateur de tier
  n'est **pas** réappliqué par-dessus.
- Le barème complet est dans **[`data/scoring.config.json`](data/scoring.config.json)** —
  c'est le seul fichier à modifier pour changer la grille de points.

## 📝 Ajouter / modifier des données

Les données vivent dans le dossier [`data/`](data/) — aucune base de données :

| Fichier | Rôle |
| --- | --- |
| `players.json` | Joueurs du circuit, identifiés par leur **ID Discord** |
| `scoring.config.json` | Barème de points (phases, placements, tiers) |
| `tournaments/*.json` | Un fichier par tournoi : format, tier, phases, résultats |

> 💡 **Workflow prévu** : donnez simplement les résultats du tournoi à l'agent IA (session
> Arena), il crée/édite les fichiers, vérifie le calcul et pousse sur le repo.

### Joueurs (`players.json`)

```json
{
  "discordId": "302050872383242240",   // ID Discord (clic droit sur le profil → Copier l'ID)
  "name": "Skailex",                    // pseudo affiché, lié au compte Discord
  "openfrontId": "Xk29FvQz",            // OPTIONNEL : public ID OpenFront → stats live
  "clan": "PRF",
  "country": "FR"
}
```

> Pour obtenir un ID Discord : activer le *Mode développeur* dans les paramètres Discord,
> puis clic droit sur un membre → **Copier l'ID d'utilisateur**.

### Tournoi (`tournaments/<slug>.json`)

```json
{
  "slug": "openfront-cup-3",
  "name": "OpenFront Cup #3",
  "date": "2026-08-09",
  "format": "ffa",            // "ffa" | "bracket" | "minor"
  "tier": "standard",         // "minor" | "standard" | "major"
  "map": "World",
  "participants": 32,
  "phases": [
    {
      "id": "finale",
      "type": "finale",      // doit correspondre à une clé de scoring.config.json
      "placements": [
        { "player": "302050872383242240", "place": 1 },   // "player" = ID Discord
        { "player": "274849916583788544", "place": 2 },
        { "player": "198765432109876543" }                // sans place = participation
      ]
    }
  ]
}
```

Les données actuelles sont les **vrais résultats des OpenFront Minors** (voir
`data/tournaments/openfront-minor-*.json`). Le badge « Données d'exemple » ne
s'affiche que si un tournoi a `"sample": true` — pratique pour tester de
nouveaux tournois avant de les valider officiellement.

### Tournois `minor` (classement par tranches, gros effectif)

Format dédié aux tournois à grand nombre de joueurs, notés directement de la 1ère
à la dernière place (pas de qualifs/demi/finale séparées) :

```json
{
  "slug": "openfront-minor-3",
  "name": "OpenFront Minor #3",
  "date": "2026-08-20",
  "format": "minor",
  "tier": "minor",
  "participants": 120,
  "phases": [
    {
      "id": "classement",
      "type": "classement",   // clé "classement" du format "minor" dans scoring.config.json
      "placements": [
        { "player": "302050872383242240", "place": 1 },
        { "player": "274849916583788544", "place": 47 },
        { "player": "198765432109876543", "place": 113 }
      ]
    }
  ]
}
```

Le barème (`scoring.config.json` → `formats.minor.phases.classement`) définit des
points exacts pour les 10 premières places puis des **tranches** (`ranges`, ex.
`{ "min": 11, "max": 15, "points": 220 }` ou `{ "min": 100, "max": null, "points": 3 }`
pour « 100e et au-delà »). Cette phase compte aussi comme le classement final du
joueur pour ses stats (victoires, top 3, meilleure place).

## 🚀 Développement

```bash
npm install
npm run dev                     # http://localhost:3000
npm test                        # tests du moteur PR (node:test, zéro dépendance)
npm run build                   # build classique (Vercel/Node)
GH_PAGES=true npm run build     # export statique GitHub Pages → ./out
```

## 🌐 Stats live OpenFront

Les profils joueurs récupèrent l'historique récent via
[`api.openfront.io/public/player/:id`](https://github.com/openfrontio/OpenFrontIO/blob/main/docs/API.md)
(champ `openfrontId` du joueur). Si l'API est injoignable ou que le joueur n'a pas
d'`openfrontId`, le bloc l'indique sans casser la page.

## 🧩 Stack & évolutivité

- **Next.js 15 (App Router) + TypeScript strict + Tailwind CSS 4**
- Moteur PR en fonctions pures et testées : [`src/lib/pr.ts`](src/lib/pr.ts)
- i18n prête : FR par défaut, EN déjà traduit ([`src/i18n/`](src/i18n/))
- Architecture pensée pour ajouter facilement : saisons, bot Discord d'inscription,
  page clans, comparateur de joueurs…
