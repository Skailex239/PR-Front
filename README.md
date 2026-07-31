# PR-Front 🏆

**Le Power Ranking compétitif des tournois [OpenFront.io](https://openfront.io), façon Fortnite Tracker.**

Classement des joueurs par points cumulés sur les tournois du circuit : podium, profils
joueurs détaillés, décomposition des points phase par phase et stats live de l'API
publique OpenFront.

![stack](https://img.shields.io/badge/Next.js-15-black) ![tailwind](https://img.shields.io/badge/Tailwind-4-blue) ![ts](https://img.shields.io/badge/TypeScript-strict-blue)

## ⚙️ Fonctionnement du Power Ranking

- **Points par phase atteinte** (style FNCS) : chaque phase d'un tournoi (qualifications,
  demi-finale, finale…) attribue des points selon le placement.
- **Multiplicateur de tier** : `major ×1.5`, `standard ×1.0`, `minor ×0.5`.
- **Aucune décroissance** : tous les résultats comptent, cumul à vie.
- **Deux formats gérés** : FFA multi-manches et bracket 1v1.
- Le barème complet est dans **[`data/scoring.config.json`](data/scoring.config.json)** —
  c'est le seul fichier à modifier pour changer la grille de points.

## 📝 Ajouter / modifier des données

Les données vivent dans le dossier [`data/`](data/) — aucune base de données :

| Fichier | Rôle |
| --- | --- |
| `players.json` | Joueurs du circuit, identifiés par leur **public ID OpenFront** |
| `scoring.config.json` | Barème de points (phases, placements, tiers) |
| `tournaments/*.json` | Un fichier par tournoi : format, tier, phases, résultats |

> 💡 **Workflow prévu** : donnez simplement les résultats du tournoi à l'agent IA (session
> Arena), il se charge de créer/éditer les fichiers et de vérifier que le site recalcule
> correctement.

Format d'un tournoi :

```json
{
  "slug": "openfront-cup-3",
  "name": "OpenFront Cup #3",
  "date": "2026-08-09",
  "format": "ffa",            // "ffa" | "bracket"
  "tier": "standard",         // "minor" | "standard" | "major"
  "map": "World",
  "participants": 32,
  "phases": [
    {
      "id": "finale",
      "type": "finale",      // doit correspondre à une clé de scoring.config.json
      "placements": [
        { "player": "Xk29FvQz", "place": 1 },
        { "player": "HabCsQYR", "place": 2 },
        { "player": "Tm4Wd8Lx" }           // sans place = participation
      ]
    }
  ]
}
```

Les données actuelles sont **des exemples** (`"sample": true`, badge affiché sur le site) —
à remplacer par les vrais joueurs/tournois.

## 🚀 Développement

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # tests du moteur PR (node:test, zéro dépendance)
npm run build   # build de production
```

Le classement est recalculé au chargement des données — redémarrez juste `dev` après
édition de `data/` (ou laissez le hot-reload faire).

## 🌐 Stats live OpenFront

Les profils joueurs récupèrent l'historique récent via
[`api.openfront.io/public/player/:id`](https://github.com/openfrontio/OpenFrontIO/blob/main/docs/API.md),
mis en cache 5 min (les rate limits officiels sont stricts). Si l'API est injoignable,
le bloc affiche simplement « indisponible » sans casser la page.

## 🧩 Stack & évolutivité

- **Next.js 15 (App Router) + TypeScript strict + Tailwind CSS 4**
- Moteur PR en fonctions pures et testées : [`src/lib/pr.ts`](src/lib/pr.ts)
- i18n prête : FR par défaut, EN déjà traduit ([`src/i18n/`](src/i18n/))
- Architecture pensée pour ajouter facilement : saisons, tournois à points bonus,
  page clans, comparateur de joueurs…

Déploiement : n'importe quel hébergeur Node (Vercel recommandé — `git push` et c'est tout).
