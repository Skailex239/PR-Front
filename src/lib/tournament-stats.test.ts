/**
 * Tests des stats par joueur calculées depuis les parties d'un tournoi.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { computeTournamentPlayerStats } from "./tournament-stats.ts";
import type { Tournament } from "./types.ts";

const tournament: Tournament = {
  slug: "stats-1",
  name: "Stats Test",
  date: "2026-08-02",
  format: "ffa",
  tier: "major",
  participants: 6,
  phases: [],
  details: {
    games: [
      {
        round: "E1",
        stage: "qualifier",
        entries: [
          {
            name: "C1",
            gameId: "g1",
            players: 3,
            results: [
              { player: "A", place: 1, kills: 5, points: 165, result: "survived", minutes: 20.5, finalTiles: 1000 },
              { player: "B", place: 2, kills: 2, points: 120, result: "eliminated", minutes: 18.0, finalTiles: 500 },
              { player: "C", place: 3, kills: 0, points: 90, result: "eliminated", minutes: 15.0, finalTiles: 100 },
            ],
          },
        ],
      },
      {
        round: "R1",
        stage: "final",
        entries: [
          {
            name: "C2",
            gameId: "g2",
            players: 3,
            results: [
              { player: "A", place: 1, kills: 7, points: 250, result: "survived", minutes: 22.0, finalTiles: 2000 },
              { player: "B", place: 2, kills: 1, points: 180, result: "eliminated", minutes: 20.0, finalTiles: 800 },
              { player: "D", place: 3, kills: 0, points: 100, result: "eliminated", minutes: 17.0, finalTiles: 50 },
            ],
          },
        ],
      },
    ],
  },
};

test("stats par joueur : cumuls et moyennes", () => {
  const stats = computeTournamentPlayerStats(tournament);
  const a = stats.get("A")!;
  assert.equal(a.gamesPlayed, 2);
  assert.equal(a.wins, 2);
  assert.equal(a.kills, 12);
  assert.equal(a.survived, 2);
  assert.equal(a.bestPlace, 1);
  assert.equal(a.furthestStage, "final");
  assert.equal(a.playtimeMin, 42.5);
  assert.equal(a.avgGamePoints, 207.5); // (165 + 250) / 2

  const b = stats.get("B")!;
  assert.equal(b.gamesPlayed, 2);
  assert.equal(b.survived, 0);
  assert.equal(b.bestPlace, 2);
  assert.equal(b.avgGamePoints, 150); // (120 + 180) / 2
});

test("stats : stage le plus loin atteint et joueur absent", () => {
  const stats = computeTournamentPlayerStats(tournament);
  const c = stats.get("C")!;
  assert.equal(c.gamesPlayed, 1);
  assert.equal(c.furthestStage, "qualifier");
  const d = stats.get("D")!;
  assert.equal(d.furthestStage, "final");
  assert.equal(stats.has("Z"), false);
});

test("stats : tournoi sans parties → map vide", () => {
  const empty: Tournament = { ...tournament, details: { games: [] } };
  assert.equal(computeTournamentPlayerStats(empty).size, 0);
});
