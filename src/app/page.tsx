import { getLeaderboard, getScoring, getSearchIndex, getTournaments } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import HomeView from "@/components/home-view";
import type { LbRow } from "@/components/leaderboard-view";

export default function HomePage() {
  const entries = getLeaderboard();
  const tournaments = getTournaments();
  const scoring = getScoring();
  const searchIndex = getSearchIndex();
  const hasSample = tournaments.some((tn) => tn.sample);

  const rows: LbRow[] = entries.map((e) => ({
    rank: e.rank,
    id: e.playerId,
    name: e.player?.name ?? e.playerId,
    clan: e.player?.clan ?? null,
    points: e.points,
    events: e.events,
    wins: e.wins,
    top3: e.top3,
    avgPlace: e.avgPlace,
  }));

  const champion = entries[0] ?? null;
  const mostWins = [...entries].sort((a, b) => b.wins - a.wins)[0] ?? null;
  const latestTournament = tournaments[0] ?? null;
  const latestWinnerName = (() => {
    if (!latestTournament) return null;
    for (const phase of latestTournament.phases) {
      if (!isFinalPhase(scoring, latestTournament, phase.type)) continue;
      const win = phase.placements.find((p) => p.place === 1);
      if (win) return entries.find((e) => e.playerId === win.player)?.player?.name ?? win.player;
    }
    return null;
  })();

  return (
    <HomeView
      rows={rows}
      podium={entries.slice(0, 3)}
      searchIndex={searchIndex}
      tournamentCount={tournaments.length}
      hasSample={hasSample}
      champion={champion}
      mostWins={mostWins}
      latestTournament={latestTournament}
      latestWinnerName={latestWinnerName}
    />
  );
}
