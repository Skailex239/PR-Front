import Link from "next/link";
import { Avatar } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { formatDateShort, formatPoints } from "@/lib/format";
import type { LeaderboardEntry, Tournament } from "@/lib/types";
import { getDict } from "@/i18n";

const t = getDict();

type Tone = "yellow" | "cyan" | "purple";
type Mark = Extract<IconName, "crown" | "trophy" | "flag">;

const tones: Record<Tone, { header: string; text: string; corner: string }> = {
  yellow: { header: "bg-[#f4ec55]", text: "text-[#17191d]", corner: "border-t-[#c9a819]" },
  cyan: { header: "bg-[#21b9e8]", text: "text-[#063d55]", corner: "border-t-[#078bb8]" },
  purple: { header: "bg-[#7738b5]", text: "text-white", corner: "border-t-[#55238c]" },
};

function SpotlightCard({ label, href, tone, mark, children }: { label: string; href?: string; tone: Tone; mark: Mark; children: React.ReactNode }) {
  const style = tones[tone];
  const card = (
    <div className="spotlight-card group overflow-hidden rounded-[3px] border border-line bg-white shadow-[0_3px_10px_rgba(22,28,38,.08)]">
      <div className={`relative flex h-9 items-center justify-between overflow-hidden px-4 ${style.header} ${style.text}`}>
        <span className="text-[11px] font-black uppercase tracking-[-0.015em]">{label}</span>
        <span className="relative z-10 text-[10px] font-extrabold">{t.spotlight.viewAll}</span>
        <span className={`absolute right-[62px] top-0 h-0 w-0 border-l-[22px] border-t-[36px] border-l-transparent opacity-80 ${style.corner}`} aria-hidden />
        <span className="absolute inset-y-0 right-0 w-[62px] bg-black/10" aria-hidden />
      </div>
      <div className="relative flex h-[76px] items-center overflow-hidden px-4">
        {children}
        <Icon name={mark} className="pointer-events-none absolute -bottom-3 right-3 h-[70px] w-[70px] rotate-[-7deg] text-slate-900/[0.055]" strokeWidth={1.5} />
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function PlayerIdentity({ entry, stat }: { entry: LeaderboardEntry; stat: React.ReactNode }) {
  const name = entry.player?.name ?? entry.playerId;
  return (
    <div className="relative z-10 flex min-w-0 items-center gap-3">
      <div className="rounded-lg border-2 border-white shadow-md"><Avatar name={name} size="md" /></div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-black text-slate-900">
          {entry.player?.clan ? <span className="mr-1 text-[10px] font-bold text-slate-400">[{entry.player.clan}]</span> : null}{name}
        </div>
        <div className="num mt-1 text-xs font-extrabold text-slate-400">{stat}</div>
      </div>
    </div>
  );
}

export default function Spotlight({ champion, mostWins, latestTournament, latestWinnerName }: { champion: LeaderboardEntry | null; mostWins: LeaderboardEntry | null; latestTournament: Tournament | null; latestWinnerName: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SpotlightCard label={t.spotlight.champion} href={champion ? `/players/${champion.playerId}` : undefined} tone="yellow" mark="crown">
        {champion ? <PlayerIdentity entry={champion} stat={<>PR {formatPoints(champion.points)}</>} /> : <span className="text-xs text-muted">{t.spotlight.noData}</span>}
      </SpotlightCard>

      <SpotlightCard label={t.spotlight.mostWins} href={mostWins ? `/players/${mostWins.playerId}` : undefined} tone="cyan" mark="trophy">
        {mostWins ? <PlayerIdentity entry={mostWins} stat={<>{mostWins.wins} {t.common.wins.toLowerCase()}</>} /> : <span className="text-xs text-muted">{t.spotlight.noWinner}</span>}
      </SpotlightCard>

      <SpotlightCard label={t.spotlight.latestTournament} href={latestTournament ? `/tournaments/${latestTournament.slug}` : "/tournaments"} tone="purple" mark="flag">
        {latestTournament ? (
          <div className="relative z-10 flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#f2eafa] text-[#7738b5] shadow-md"><Icon name="flag" size="md" /></div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-black text-slate-900">{latestTournament.name}</div>
              <div className="mt-1 truncate text-[11px] font-bold text-slate-400">{formatDateShort(latestTournament.date)}{latestWinnerName ? ` · ${latestWinnerName}` : ""}</div>
            </div>
          </div>
        ) : <span className="text-xs text-muted">{t.spotlight.noData}</span>}
      </SpotlightCard>
    </div>
  );
}
