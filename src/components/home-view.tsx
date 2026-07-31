"use client";

import LeaderboardView, { type LbRow } from "@/components/leaderboard-view";
import Podium from "@/components/podium";
import Spotlight from "@/components/spotlight";
import Hero from "@/components/hero";
import PageContainer from "@/components/page-container";
import { SampleBadge } from "@/components/ui";
import type { SearchIndexItem } from "@/lib/data";
import type { LeaderboardEntry, Tournament } from "@/lib/types";
import { useI18n } from "@/i18n/provider";

export default function HomeView({
  rows,
  podium,
  searchIndex,
  tournamentCount,
  hasSample,
  champion,
  mostWins,
  latestTournament,
  latestWinnerName,
}: {
  rows: LbRow[];
  podium: LeaderboardEntry[];
  searchIndex: SearchIndexItem[];
  tournamentCount: number;
  hasSample: boolean;
  champion: LeaderboardEntry | null;
  mostWins: LeaderboardEntry | null;
  latestTournament: Tournament | null;
  latestWinnerName: string | null;
}) {
  const { t } = useI18n();

  return (
    <>
      <Hero
        items={searchIndex}
        tournamentCount={tournamentCount}
        playerCount={rows.length}
      />

      <PageContainer>
        {hasSample ? (
          <div className="mb-6 flex justify-center">
            <SampleBadge label={t.common.sampleBadge} />
          </div>
        ) : null}

      {rows.length > 0 ? (
        <div className="mb-8">
          <Spotlight
            champion={champion}
            mostWins={mostWins}
            latestTournament={latestTournament}
            latestWinnerName={latestWinnerName}
          />
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="card mx-auto max-w-lg p-10 text-center text-sm text-muted">
          {t.leaderboard.empty}
        </div>
      ) : (
        <>
          <Podium entries={podium} />
          <div className="mt-8">
            <LeaderboardView rows={rows} />
          </div>
        </>
      )}
      </PageContainer>
    </>
  );
}
