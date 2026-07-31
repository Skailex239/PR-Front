import Link from "next/link";
import { Avatar } from "@/components/ui";
import { formatDateShort, formatPoints } from "@/lib/format";
import type { LeaderboardEntry, Tournament } from "@/lib/types";
import { getDict } from "@/i18n";

const t = getDict();

function SpotlightCard({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <div className="card card-hover flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="micro-label">{label}</span>
        {href ? <span className="text-[0.65rem] font-bold text-accent-strong">{t.spotlight.viewAll} →</span> : null}
      </div>
      {children}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function EmptyRow({ text }: { text: string }) {
  return <div className="flex flex-1 items-center text-sm text-muted">{text}</div>;
}

export default function Spotlight({
  champion,
  mostWins,
  latestTournament,
  latestWinnerName,
}: {
  champion: LeaderboardEntry | null;
  mostWins: LeaderboardEntry | null;
  latestTournament: Tournament | null;
  latestWinnerName: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SpotlightCard label={t.spotlight.champion} href={champion ? `/players/${champion.playerId}` : undefined}>
        {champion ? (
          <div className="flex items-center gap-3">
            <Avatar name={champion.player?.name ?? champion.playerId} size="lg" />
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold">
                {champion.player?.clan ? <span className="mr-1 text-xs font-semibold text-muted">[{champion.player.clan}]</span> : null}
                {champion.player?.name ?? champion.playerId}
              </div>
              <div className="num text-lg font-black gradient-text">
                {formatPoints(champion.points)} <span className="text-xs font-bold text-muted">pts</span>
              </div>
            </div>
          </div>
        ) : (
          <EmptyRow text={t.spotlight.noData} />
        )}
      </SpotlightCard>

      <SpotlightCard label={t.spotlight.mostWins} href={mostWins ? `/players/${mostWins.playerId}` : undefined}>
        {mostWins && mostWins.wins > 0 ? (
          <div className="flex items-center gap-3">
            <Avatar name={mostWins.player?.name ?? mostWins.playerId} size="lg" />
            <div className="min-w-0">
              <div className="truncate text-base font-extrabold">
                {mostWins.player?.clan ? <span className="mr-1 text-xs font-semibold text-muted">[{mostWins.player.clan}]</span> : null}
                {mostWins.player?.name ?? mostWins.playerId}
              </div>
              <div className="num text-lg font-black rank-1">
                🏆 {mostWins.wins} <span className="text-xs font-bold text-muted">{t.common.wins.toLowerCase()}</span>
              </div>
            </div>
          </div>
        ) : (
          <EmptyRow text={t.spotlight.noWinner} />
        )}
      </SpotlightCard>

      <SpotlightCard label={t.spotlight.latestTournament} href={latestTournament ? `/tournaments/${latestTournament.slug}` : "/tournaments"}>
        {latestTournament ? (
          <div>
            <div className="truncate text-base font-extrabold">{latestTournament.name}</div>
            <div className="mt-1 text-xs text-muted">{formatDateShort(latestTournament.date)}</div>
            <div className="mt-2 text-sm">
              {latestWinnerName ? (
                <>
                  🥇 <span className="font-bold text-gold">{latestWinnerName}</span>
                </>
              ) : (
                <span className="text-muted">{t.spotlight.noWinner}</span>
              )}
            </div>
          </div>
        ) : (
          <EmptyRow text={t.spotlight.noData} />
        )}
      </SpotlightCard>
    </div>
  );
}
