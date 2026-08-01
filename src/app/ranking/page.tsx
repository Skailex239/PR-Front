import type { Metadata } from "next";
import { getLeaderboard, getScoring, getTournaments } from "@/lib/data";
import RankingView from "@/components/ranking-view";
import type { LbRow } from "@/components/leaderboard-view";
import { getDict } from "@/i18n";

const t = getDict();

export const metadata: Metadata = { title: t.leaderboard.title };

export default function RankingPage() {
  const entries = getLeaderboard();
  const tournaments = getTournaments();
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

  return (
    <RankingView rows={rows} podium={entries.slice(0, 3)} hasSample={hasSample} />
  );
}
