import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeaderboard, getPlayer, getPlayerPR, getPlayers, getScoring, getTournament } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import PlayerView, { type PlayerGameRow, type PlayerViewGroup } from "@/components/player-view";
import type { PRChartPoint } from "@/components/pr-chart";
import type { Tournament } from "@/lib/types";

/**
 * Parties d'un tournoi avec, pour chacune : la place du joueur consulté
 * (`place`, via ses résultats) et le gagnant de la partie (`winner`).
 * Ordre chronologique du fichier (round R1 → dernier round).
 */
function extractTournamentGames(tournament: Tournament, playerId: string): PlayerGameRow[] {
  if (!tournament.details?.games) return [];
  const rows: PlayerGameRow[] = [];
  for (const round of tournament.details.games) {
    for (const game of round.entries) {
      const result = game.results?.find((r) => r.player === playerId);
      rows.push({
        round: round.round,
        gameName: game.name,
        gameId: game.gameId,
        gameUrl: game.gameUrl,
        replayUrl: game.replayUrl,
        players: game.players,
        place: result?.place ?? null,
        kills: result?.kills ?? null,
        points: result?.points ?? null,
        winner: game.winner ?? null,
      });
    }
  }
  return rows;
}
export function generateStaticParams() {
  const ids = new Set<string>([
    ...getPlayers().map((p) => p.discordId),
    ...getLeaderboard().map((e) => e.playerId),
  ]);
  return [...ids].map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  return { title: player ? player.name : id };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  const pr = getPlayerPR(id);
  if (!player && !pr) notFound();

  const scoring = getScoring();
  const groups: PlayerViewGroup[] = [];

  if (pr) {
    for (const a of [...pr.awards].reverse()) {
      let group = groups.find((g) => g.slug === a.tournamentSlug);
      const tournament = getTournament(a.tournamentSlug);
      if (!group) {
        group = {
          slug: a.tournamentSlug,
          name: a.tournamentName,
          date: a.tournamentDate,
          total: 0,
          bestPlace: null,
          tier: a.tier,
          format: a.format,
          phases: 0,
          games: [],
        };
        groups.push(group);
      }
      group.phases += 1;
      group.total += a.points;
      if (tournament && isFinalPhase(scoring, tournament, a.phaseType) && a.place != null) {
        group.bestPlace = group.bestPlace == null ? a.place : Math.min(group.bestPlace, a.place);
      }
      if (tournament && group.games.length === 0) {
        group.games = extractTournamentGames(tournament, id);
      }
    }
  }

  // Points de la courbe : chronologiques, avec cumul progressif.
  let running = 0;
  const chart: PRChartPoint[] = [...groups]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((g) => {
      running += g.total;
      return {
        slug: g.slug,
        name: g.name,
        date: g.date,
        gained: g.total,
        cumulative: running,
        bestPlace: g.bestPlace,
      };
    });

  return (
    <PlayerView
      id={id}
      name={player?.name ?? id}
      clan={player?.clan ?? null}
      openfrontId={player?.openfrontId ?? null}
      pr={
        pr
          ? {
              points: pr.points,
              rank: pr.rank,
              events: pr.events,
              awards: pr.awards.length,
              wins: pr.wins,
              top3: pr.top3,
              bestPlace: pr.bestPlace,
              avgPlace: pr.avgPlace,
            }
          : null
      }
      groups={groups}
      chart={chart}
    />
  );
}
