/**
 * Statistiques par joueur sur un tournoi, calculées à partir des parties
 * (`tournament.details.games`) : parties jouées, wins de lobby, kills,
 * parties survécues, meilleure place, stage le plus loin atteint, temps de
 * jeu et points OpenFront moyens par partie.
 */

import type { Tournament } from "./types";

export type TournamentStage = "qualifier" | "semifinal" | "final";

export interface TournamentPlayerStats {
  playerId: string;
  gamesPlayed: number;
  /** Wins de lobby (parties remportées, place 1). */
  wins: number;
  kills: number;
  /** Parties où le joueur a survécu jusqu'à la fin. */
  survived: number;
  bestPlace: number | null;
  /** Stage le plus loin atteint (final > semifinal > qualifier). */
  furthestStage: TournamentStage | null;
  playtimeMin: number;
  /** Points OpenFront moyens par partie (null si aucun score renseigné). */
  avgGamePoints: number | null;
}

const STAGE_ORDER: Record<TournamentStage, number> = {
  qualifier: 1,
  semifinal: 2,
  final: 3,
};

export function computeTournamentPlayerStats(
  tournament: Tournament,
): Map<string, TournamentPlayerStats> {
  const map = new Map<string, TournamentPlayerStats>();
  const rounds = tournament.details?.games ?? [];

  for (const round of rounds) {
    const stage = (round.stage ?? null) as TournamentStage | null;
    for (const game of round.entries) {
      for (const res of game.results ?? []) {
        let s = map.get(res.player);
        if (!s) {
          s = {
            playerId: res.player,
            gamesPlayed: 0,
            wins: 0,
            kills: 0,
            survived: 0,
            bestPlace: null,
            furthestStage: null,
            playtimeMin: 0,
            avgGamePoints: null,
          };
          map.set(res.player, s);
        }

        s.gamesPlayed += 1;
        if (res.place === 1) s.wins += 1;
        s.kills += res.kills ?? 0;
        if (res.result === "survived") s.survived += 1;
        s.bestPlace = s.bestPlace == null ? res.place : Math.min(s.bestPlace, res.place);
        if (stage) {
          const cur = s.furthestStage ? STAGE_ORDER[s.furthestStage] : 0;
          if (STAGE_ORDER[stage] > cur) s.furthestStage = stage;
        }
        s.playtimeMin += res.minutes ?? 0;
        if (res.points != null) {
          s.avgGamePoints = (s.avgGamePoints ?? 0) + res.points;
        }
      }
    }
  }

  for (const s of map.values()) {
    if (s.avgGamePoints != null) {
      s.avgGamePoints = Math.round((s.avgGamePoints / s.gamesPlayed) * 10) / 10;
    }
  }

  return map;
}
