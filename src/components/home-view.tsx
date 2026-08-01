"use client";

import Spotlight from "@/components/spotlight";
import Hero from "@/components/hero";
import PageContainer from "@/components/page-container";
import type { SearchIndexItem } from "@/lib/data";
import type { LeaderboardEntry, Tournament } from "@/lib/types";

/**
 * Page d'accueil — version allégée : on n'y garde que le bandeau (Hero + barre
 * de recherche) et les cartelettes Spotlight. Le podium et le classement
 * complet vivent désormais sur la page dédiée « Classement » (/ranking).
 */
export default function HomeView({
  searchIndex,
  tournamentCount,
  playerCount,
  champion,
  mostWins,
  latestTournament,
  latestWinnerName,
}: {
  searchIndex: SearchIndexItem[];
  tournamentCount: number;
  playerCount: number;
  champion: LeaderboardEntry | null;
  mostWins: LeaderboardEntry | null;
  latestTournament: Tournament | null;
  latestWinnerName: string | null;
}) {
  return (
    <>
      <Hero
        items={searchIndex}
        tournamentCount={tournamentCount}
        playerCount={playerCount}
      />

      <PageContainer>
        <Spotlight
          champion={champion}
          mostWins={mostWins}
          latestTournament={latestTournament}
          latestWinnerName={latestWinnerName}
        />
      </PageContainer>
    </>
  );
}
