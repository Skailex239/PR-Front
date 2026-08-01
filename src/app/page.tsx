import { getLeaderboard, getScoring, getSearchIndex, getTournaments } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import HomeView from "@/components/home-view";

export default function HomePage() {
  const entries = getLeaderboard();
  const tournaments = getTournaments();
  const scoring = getScoring();
  const searchIndex = getSearchIndex();

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
      searchIndex={searchIndex}
      tournamentCount={tournaments.length}
      playerCount={entries.length}
      champion={champion}
      mostWins={mostWins}
      latestTournament={latestTournament}
      latestWinnerName={latestWinnerName}
    />
  );
}
