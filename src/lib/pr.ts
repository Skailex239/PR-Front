/**
 * Moteur de Power Ranking — fonctions pures, sans I/O.
 *
 * Règles :
 *  - Chaque phase d'un tournoi attribue des points à chaque joueur listé :
 *      placement précis → points de `places[place]`, sinon `defaultPoints` de la phase.
 *  - Les points sont multipliés par le coefficient du tier du tournoi.
 *  - Aucune décroissance : tout se cumule.
 *  - Une "victoire" = phase `finale` remportée (place 1). Un "top 3" = finale, place ≤ 3.
 */

import type {
  LeaderboardEntry,
  PhasePointsAward,
  Player,
  PlayerPR,
  ScoringConfig,
  Tournament,
} from "./types";

const FINAL_PHASE = "finale";

export class DataError extends Error {}

/** Points de base pour un placement dans une phase, selon le barème. */
export function basePoints(
  scoring: ScoringConfig,
  tournament: Tournament,
  phaseType: string,
  place: number | null,
): number {
  const formatConf = scoring.formats[tournament.format];
  if (!formatConf) {
    throw new DataError(
      `Tournoi "${tournament.slug}" : format inconnu "${tournament.format}" ` +
        `(attendu : ${Object.keys(scoring.formats).join(", ")}).`,
    );
  }
  const phaseConf = formatConf.phases[phaseType];
  if (!phaseConf) {
    throw new DataError(
      `Tournoi "${tournament.slug}" : phase inconnue "${phaseType}" pour le format "${tournament.format}" ` +
        `(attendu : ${Object.keys(formatConf.phases).join(", ")}).`,
    );
  }
  if (place != null && phaseConf.places[String(place)] != null) {
    return phaseConf.places[String(place)];
  }
  return phaseConf.defaultPoints;
}

export function tierMultiplier(scoring: ScoringConfig, tournament: Tournament): number {
  return scoring.tiers[tournament.tier] ?? 1;
}

/** Calcule le PR de tous les joueurs apparaissant dans les tournois donnés. */
export function computePlayerPRs(
  tournaments: Tournament[],
  scoring: ScoringConfig,
): Map<string, PlayerPR> {
  const prs = new Map<string, PlayerPR>();

  const getOrCreate = (id: string): PlayerPR => {
    let pr = prs.get(id);
    if (!pr) {
      pr = { playerId: id, points: 0, events: 0, wins: 0, top3: 0, bestPlace: null, avgPlace: null, awards: [] };
      prs.set(id, pr);
    }
    return pr;
  };

  for (const t of [...tournaments].sort((a, b) => a.date.localeCompare(b.date))) {
    const mult = tierMultiplier(scoring, t);
    const seen = new Set<string>();

    for (const phase of t.phases) {
      const formatConf = scoring.formats[t.format];
      const phaseLabel = formatConf?.phases[phase.type]?.label ?? phase.type;

      for (const p of phase.placements) {
        const pr = getOrCreate(p.player);
        const place = p.place ?? null;
        const base = basePoints(scoring, t, phase.type, place);
        const award: PhasePointsAward = {
          tournamentSlug: t.slug,
          tournamentName: t.name,
          tournamentDate: t.date,
          format: t.format,
          tier: t.tier,
          phaseType: phase.type,
          phaseLabel,
          place,
          basePoints: base,
          points: Math.round(base * mult),
        };
        pr.awards.push(award);
        pr.points += award.points;
        seen.add(p.player);

        if (phase.type === FINAL_PHASE && place != null) {
          if (place === 1) pr.wins += 1;
          if (place <= 3) pr.top3 += 1;
          pr.bestPlace = pr.bestPlace == null ? place : Math.min(pr.bestPlace, place);
        }
      }
    }

    for (const id of seen) {
      getOrCreate(id).events += 1;
    }
  }

  // Placement moyen en finale.
  for (const pr of prs.values()) {
    const finalPlaces = pr.awards.filter((a) => a.phaseType === FINAL_PHASE && a.place != null).map((a) => a.place as number);
    pr.avgPlace = finalPlaces.length > 0 ? finalPlaces.reduce((s, v) => s + v, 0) / finalPlaces.length : null;
  }

  return prs;
}

/** Classement complet, trié : points → victoires → meilleure place → nom. */
export function computeLeaderboard(
  tournaments: Tournament[],
  players: Player[],
  scoring: ScoringConfig,
): LeaderboardEntry[] {
  const byId = new Map(players.map((p) => [p.discordId, p]));
  const prs = [...computePlayerPRs(tournaments, scoring).values()];

  prs.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    const ba = a.bestPlace ?? Infinity;
    const bb = b.bestPlace ?? Infinity;
    if (bb !== ba) return bb - ba;
    const na = byId.get(a.playerId)?.name ?? a.playerId;
    const nb = byId.get(b.playerId)?.name ?? b.playerId;
    return na.localeCompare(nb, "fr");
  });

  return prs.map((pr, i) => ({ ...pr, rank: i + 1, player: byId.get(pr.playerId) ?? null }));
}
