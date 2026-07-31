import type { Metadata } from "next";
import { getPlayer, getTournaments, getScoring } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import TournamentsView, { type TournamentCard } from "@/components/tournaments-view";
import type { ScoringConfig, Tournament } from "@/lib/types";
import { getDict } from "@/i18n";

const t = getDict();

export const metadata: Metadata = { title: t.tournaments.title };

function winnerOf(tn: Tournament, scoring: ScoringConfig) {
  for (const phase of tn.phases) {
    if (!isFinalPhase(scoring, tn, phase.type)) continue;
    const win = phase.placements.find((p) => p.place === 1);
    if (win) return getPlayer(win.player)?.name ?? win.player;
  }
  return null;
}

export default function TournamentsPage() {
  const scoring = getScoring();
  const tournaments: TournamentCard[] = getTournaments().map((tn) => ({
    slug: tn.slug,
    name: tn.name,
    date: tn.date,
    format: tn.format,
    tier: tn.tier,
    participants: tn.participants,
    series: tn.series ?? null,
    sample: Boolean(tn.sample),
    winner: winnerOf(tn, scoring),
  }));

  return <TournamentsView tournaments={tournaments} />;
}
