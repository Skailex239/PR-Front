"use client";

import LeaderboardView, { type LbRow } from "@/components/leaderboard-view";
import Podium from "@/components/podium";
import PageContainer from "@/components/page-container";
import { SampleBadge, SectionTitle } from "@/components/ui";
import type { LeaderboardEntry } from "@/lib/types";
import { useI18n } from "@/i18n/provider";

/**
 * Page « Classement » — le podium du top 3 puis le classement général complet
 * (filtres + tableau). C'est ici que vit tout le détail du Power Ranking, qui
 * n'apparaît plus sur l'accueil.
 */
export default function RankingView({
  rows,
  podium,
  hasSample,
}: {
  rows: LbRow[];
  podium: LeaderboardEntry[];
  hasSample: boolean;
}) {
  const { t } = useI18n();

  if (rows.length === 0) {
    return (
      <PageContainer>
        <SectionTitle title={t.leaderboard.title} subtitle={t.leaderboard.subtitle} />
        <div className="card mx-auto max-w-lg p-10 text-center text-sm text-muted">
          {t.leaderboard.empty}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionTitle title={t.leaderboard.title} subtitle={t.leaderboard.subtitle} />

      {hasSample ? (
        <div className="mb-6 flex justify-center">
          <SampleBadge label={t.common.sampleBadge} />
        </div>
      ) : null}

      <Podium entries={podium} />

      <div className="mt-8">
        <LeaderboardView rows={rows} />
      </div>
    </PageContainer>
  );
}
