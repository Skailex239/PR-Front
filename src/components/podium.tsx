"use client";

import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { Avatar } from "@/components/ui";
import { useI18n } from "@/i18n/provider";

function PodiumCard({ entry, big }: { entry: LeaderboardEntry; big?: boolean }) {
  const { t, locale } = useI18n();
  const name = entry.player?.name ?? entry.playerId;
  const glow = entry.rank === 1 ? "podium-glow-1" : entry.rank === 2 ? "podium-glow-2" : "podium-glow-3";
  const medal = entry.rank === 1 ? "rank-1" : entry.rank === 2 ? "rank-2" : "rank-3";

  return (
    <Link href={`/players/${entry.playerId}`} className={`card card-hover ${glow} block h-full min-h-[190px] p-4 text-center`}>
      <div className={`num text-2xl font-black ${medal}`}>#{entry.rank}</div>
      <div className="mt-2 flex justify-center">
        <Avatar name={name} size="md" />
      </div>
      <div className="mt-2 truncate text-sm font-extrabold tracking-tight">{name}</div>
      {entry.player?.clan ? <div className="mt-1 text-xs text-muted">[{entry.player.clan}]</div> : null}
      <div className="num mt-2 text-xl font-black gradient-text">
        {formatPoints(entry.points, locale)}
        <span className="ml-1 text-xs font-bold text-muted">{t.leaderboard.podiumPts}</span>
      </div>
      <div className="mt-2 text-[0.7rem] text-muted">
        {entry.events} {t.common.tournaments.toLowerCase()} · {entry.wins} {t.common.wins.toLowerCase()}
      </div>
    </Link>
  );
}

export default function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null;
  const [first, second, third] = entries;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch">
      {/* Ordre visuel : 2e à gauche, 1er au centre sur desktop */}
      <div className="order-2 sm:order-1">{second ? <PodiumCard entry={second} /> : null}</div>
      <div className="order-1 sm:order-2">{first ? <PodiumCard entry={first} big /> : null}</div>
      <div className="order-3">{third ? <PodiumCard entry={third} /> : null}</div>
    </div>
  );
}
