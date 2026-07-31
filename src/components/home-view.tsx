"use client";

import LeaderboardView, { type LbRow } from "@/components/leaderboard-view";
import Podium from "@/components/podium";
import Spotlight from "@/components/spotlight";
import SearchBox from "@/components/search-box";
import { SampleBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
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
    <div>
      {/* En-tête du classement */}
      <div className="mb-7 grid items-end gap-6 md:grid-cols-[1fr_1.05fr]">
        <div>
          <div className="micro-label mb-2 text-accent-strong">{t.site.tagline}</div>
          <h1 className="text-[2.35rem] font-black leading-none tracking-[-0.045em] sm:text-[2.7rem]">
            {t.leaderboard.title.toUpperCase()}
          </h1>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted">
            {t.leaderboard.subtitle}
          </p>
        </div>
        <div>
          <SearchBox items={searchIndex} variant="hero" />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="chip">
              <Icon name="trophy" size="xs" /> {tournamentCount}{" "}
              {t.common.tournaments.toLowerCase()}
            </span>
            <span className="chip">
              <Icon name="users" size="xs" /> {rows.length} {t.common.players.toLowerCase()}
            </span>
            {hasSample ? <SampleBadge label={t.common.sampleBadge} /> : null}
          </div>
        </div>
      </div>

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
    </div>
  );
}
