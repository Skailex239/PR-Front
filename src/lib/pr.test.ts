/**
 * Tests du moteur PR : `npm test`
 * (aucune dépendance — utilise le runner natif de Node 22)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { computeLeaderboard, computePlayerPRs, rewardPoints } from "./pr.ts";
import type { ScoringConfig, Tournament } from "./types.ts";

const scoring: ScoringConfig = {
  tiers: { standard: 1, major: 2.5 },
  formats: {
    ffa: {
      phaseOrder: ["qualifications", "finale"],
      phases: {
        qualifications: { label: "Qualifications", places: {}, defaultPoints: 2 },
        finale: {
          label: "Finale",
          places: { "1": 100, "2": 80 },
          defaultPoints: 16,
        },
      },
    },
    bracket: {
      phaseOrder: ["demi-finale", "finale"],
      phases: {
        "demi-finale": { label: "Demi-finale", places: {}, defaultPoints: 10 },
        finale: { label: "Finale", places: { "1": 60, "2": 40 }, defaultPoints: 24 },
      },
    },
  },
};

const cup: Tournament = {
  slug: "cup",
  name: "Cup",
  date: "2026-07-01",
  format: "ffa",
  tier: "standard",
  participants: 8,
  phases: [
    { id: "q", type: "qualifications", placements: [{ player: "A" }, { player: "B" }, { player: "C" }] },
    {
      id: "f",
      type: "finale",
      placements: [
        { player: "A", place: 1 },
        { player: "B", place: 2 },
        { player: "C", place: 5 },
      ],
    },
  ],
};

const bracket: Tournament = {
  slug: "inv",
  name: "Invitational",
  date: "2026-07-10",
  format: "bracket",
  tier: "major",
  participants: 4,
  phases: [
    { id: "sf", type: "demi-finale", placements: [{ player: "C" }] },
    { id: "f", type: "finale", placements: [{ player: "A", place: 1 }, { player: "B", place: 2 }] },
  ],
};

test("cumul des points par phase + participation", () => {
  const prs = computePlayerPRs([cup], scoring);
  assert.equal(prs.get("A")?.points, 102); // 100 + 2
  assert.equal(prs.get("B")?.points, 82); // 80 + 2
  assert.equal(prs.get("C")?.points, 18); // 16 (place 5 → default) + 2
});

test("multiplicateur de tier appliqué et arrondi", () => {
  const prs = computePlayerPRs([bracket], scoring);
  assert.equal(prs.get("A")?.points, 150); // 60 × 2.5
  assert.equal(prs.get("C")?.points, 25); // 10 × 2.5 (participation demi)
});

test("stats de tournoi : victoires, top3, meilleure place, moyenne", () => {
  const prs = computePlayerPRs([cup, bracket], scoring);
  const a = prs.get("A")!;
  assert.equal(a.wins, 2);
  assert.equal(a.top3, 2);
  assert.equal(a.bestPlace, 1);
  assert.equal(a.events, 2);
  assert.equal(a.avgPlace, 1);
  const c = prs.get("C")!;
  assert.equal(c.bestPlace, 5);
  assert.equal(c.avgPlace, 5);
});

test("classement trié et rangs corrects", () => {
  const lb = computeLeaderboard(
    [cup, bracket],
    [{ discordId: "A", name: "Alice" }, { discordId: "B", name: "Bob" }],
    scoring,
  );
  assert.equal(lb[0].playerId, "A"); // 102 + 150 = 252 pts
  assert.equal(lb[0].rank, 1);
  assert.equal(lb[1].playerId, "B"); // 82 + 100 = 182 pts
  assert.equal(lb[2].playerId, "C"); // 18 + 25 = 43 pts
  assert.equal(lb[0].player?.name, "Alice");
  assert.equal(lb[2].player, null); // C inconnu dans players.json → null toléré
});

test("erreur explicite sur phase inconnue", () => {
  const bad: Tournament = { ...cup, phases: [{ id: "x", type: "quart-de-finale", placements: [{ player: "A" }] }] };
  assert.throws(() => computePlayerPRs([bad], scoring), /phase inconnue/);
});

// ---------- Barème "minor" par tranches de placement (1er → 100e+) ----------

const minorScoring: ScoringConfig = {
  tiers: { minor: 0.5, standard: 1 },
  formats: {
    minor: {
      phaseOrder: ["classement"],
      phases: {
        classement: {
          label: "Classement",
          places: { "1": 1000, "2": 750, "3": 600 },
          ranges: [
            { min: 11, max: 15, points: 220 },
            { min: 100, max: null, points: 3 },
          ],
          defaultPoints: 1,
          ignoreTierMultiplier: true,
        },
      },
    },
  },
};

const minorCup: Tournament = {
  slug: "minor-1",
  name: "Minor #1",
  date: "2026-07-20",
  format: "minor",
  tier: "minor",
  participants: 150,
  phases: [
    {
      id: "classement",
      type: "classement",
      placements: [
        { player: "A", place: 1 },
        { player: "B", place: 13 },
        { player: "C", place: 150 },
      ],
    },
  ],
};

test("barème par tranches : points corrects pour une place dans une tranche", () => {
  const prs = computePlayerPRs([minorCup], minorScoring);
  assert.equal(prs.get("B")?.points, 220); // tranche 11-15
});

test("barème par tranches : tranche ouverte (100e et au-delà)", () => {
  const prs = computePlayerPRs([minorCup], minorScoring);
  assert.equal(prs.get("C")?.points, 3); // tranche 100+
});

test("ignoreTierMultiplier : le multiplicateur du tier minor (×0.5) n'est pas appliqué", () => {
  const prs = computePlayerPRs([minorCup], minorScoring);
  assert.equal(prs.get("A")?.points, 1000); // pas 500
});

test("countsAsFinal implicite (type 'finale') vs explicite : la phase 'classement' compte comme finale par défaut si non précisé", () => {
  // Par défaut (sans countsAsFinal), une phase qui ne s'appelle pas "finale" ne compte pas comme finale.
  const prs = computePlayerPRs([minorCup], minorScoring);
  assert.equal(prs.get("A")?.wins, 0);
  assert.equal(prs.get("A")?.bestPlace, null);
});

const minorScoringWithFinalFlag: ScoringConfig = {
  ...minorScoring,
  formats: {
    minor: {
      ...minorScoring.formats.minor,
      phases: {
        classement: { ...minorScoring.formats.minor.phases.classement, countsAsFinal: true },
      },
    },
  },
};

test("countsAsFinal: true fait compter la phase comme le classement final (victoires, meilleure place)", () => {
  const prs = computePlayerPRs([minorCup], minorScoringWithFinalFlag);
  assert.equal(prs.get("A")?.wins, 1);
  assert.equal(prs.get("A")?.bestPlace, 1);
  assert.equal(prs.get("B")?.bestPlace, 13);
});

// ---------- Structure d'un FFA Major (grand classement final, tier major ×2.5) ----------

const majorScoring: ScoringConfig = {
  tiers: { major: 2.5, standard: 1 },
  formats: {
    ffa: {
      phaseOrder: ["classement"],
      phases: {
        classement: {
          label: "Classement",
          places: {
            "1": 1000, "2": 750, "3": 600, "4": 500, "5": 430,
            "6": 380, "7": 340, "8": 310, "9": 285, "10": 260,
          },
          ranges: [
            { min: 11, max: 15, points: 220 },
            { min: 100, max: null, points: 3 },
          ],
          defaultPoints: 1,
          countsAsFinal: true,
        },
      },
    },
  },
};

const majorCup: Tournament = {
  slug: "ffa-major",
  name: "FFA Major",
  date: "2026-08-02",
  format: "ffa",
  tier: "major",
  participants: 128,
  phases: [
    {
      id: "classement",
      type: "classement",
      placements: Array.from({ length: 128 }, (_, i) => ({ player: `P${i + 1}`, place: i + 1 })),
    },
  ],
};

test("FFA Major : grille classement × 2.5 (1er = 1000 pts → +2500 PR)", () => {
  const prs = computePlayerPRs([majorCup], majorScoring);
  assert.equal(prs.get("P1")?.points, 2500); // 1000 × 2.5
  assert.equal(prs.get("P2")?.points, 1875); // 750 × 2.5
  assert.equal(prs.get("P3")?.points, 1500); // 600 × 2.5
  assert.equal(prs.get("P4")?.points, 1250); // 500 × 2.5
  assert.equal(prs.get("P9")?.points, 713); // 285 × 2.5 (arrondi)
  assert.equal(prs.get("P10")?.points, 650); // 260 × 2.5
  assert.equal(prs.get("P11")?.points, 550); // tranche 11-15 : 220 × 2.5
  assert.equal(prs.get("P128")?.points, 8); // tranche 100+ : 3 × 2.5 (arrondi)
});

test("FFA Major : le classement compte comme finale (victoire, top 3, meilleure place)", () => {
  const prs = computePlayerPRs([majorCup], majorScoring);
  assert.equal(prs.get("P1")?.wins, 1);
  assert.equal(prs.get("P1")?.top3, 1);
  assert.equal(prs.get("P1")?.bestPlace, 1);
  assert.equal(prs.get("P3")?.top3, 1);
  assert.equal(prs.get("P4")?.top3, 0);
  assert.equal(prs.get("P128")?.bestPlace, 128);
  assert.equal(prs.get("P128")?.avgPlace, 128);
});

// ---------- Récompenses Plutonium (grille des tournois tier major) ----------

const rewardScoring: ScoringConfig = {
  tiers: { major: 2.5, minor: 0.5 },
  formats: {
    ffa: {
      phaseOrder: ["classement"],
      phases: { classement: { label: "Classement", places: {}, defaultPoints: 1, countsAsFinal: true } },
    },
  },
  rewards: {
    major: {
      name: "Plutonium",
      currency: "P",
      places: { "1": 750, "2": 400, "3": 250 },
      ranges: [{ min: 4, max: 15, points: 100 }],
    },
  },
};

const rewardMajor: Tournament = {
  slug: "major-rewards",
  name: "Major Rewards",
  date: "2026-08-02",
  format: "ffa",
  tier: "major",
  participants: 16,
  phases: [
    {
      id: "classement",
      type: "classement",
      placements: Array.from({ length: 16 }, (_, i) => ({ player: `P${i + 1}`, place: i + 1 })),
    },
  ],
};

test("rewardPoints : grille Plutonium du tier major (1er 750, 2e 400, 3e 250, 4e-15e 100)", () => {
  const r = (place: number) => rewardPoints(rewardScoring, rewardMajor, place);
  assert.equal(r(1), 750);
  assert.equal(r(2), 400);
  assert.equal(r(3), 250);
  assert.equal(r(4), 100);
  assert.equal(r(10), 100);
  assert.equal(r(15), 100);
  assert.equal(r(16), 0); // hors grille
});

test("rewardPoints : 0 sans grille (minor), sans place, ou tier sans rewards", () => {
  const minor: Tournament = { ...rewardMajor, tier: "minor", slug: "minor-no-rewards" };
  assert.equal(rewardPoints(rewardScoring, minor, 1), 0);
  assert.equal(rewardPoints(rewardScoring, rewardMajor, null), 0);
  const noRewards: ScoringConfig = { ...rewardScoring, rewards: undefined };
  assert.equal(rewardPoints(noRewards, rewardMajor, 1), 0);
});
