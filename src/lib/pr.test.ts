/**
 * Tests du moteur PR : `npm test`
 * (aucune dépendance — utilise le runner natif de Node 22)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { computeLeaderboard, computePlayerPRs } from "./pr.ts";
import type { ScoringConfig, Tournament } from "./types.ts";

const scoring: ScoringConfig = {
  tiers: { standard: 1, major: 1.5 },
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
  assert.equal(prs.get("A")?.points, 90); // 60 × 1.5
  assert.equal(prs.get("C")?.points, 15); // 10 × 1.5 (participation demi)
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
  const lb = computeLeaderboard([cup, bracket], [{ id: "A", name: "Alice" }, { id: "B", name: "Bob" }], scoring);
  assert.equal(lb[0].playerId, "A"); // 192 pts
  assert.equal(lb[0].rank, 1);
  assert.equal(lb[1].playerId, "B"); // 142 pts
  assert.equal(lb[2].playerId, "C"); // 33 pts
  assert.equal(lb[0].player?.name, "Alice");
  assert.equal(lb[2].player, null); // C inconnu dans players.json → null toléré
});

test("erreur explicite sur phase inconnue", () => {
  const bad: Tournament = { ...cup, phases: [{ id: "x", type: "quart-de-finale", placements: [{ player: "A" }] }] };
  assert.throws(() => computePlayerPRs([bad], scoring), /phase inconnue/);
});
