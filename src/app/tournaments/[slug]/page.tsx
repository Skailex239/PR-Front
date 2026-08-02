import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlayer, getPlayers, getScoring, getTournament, getTournaments } from "@/lib/data";
import { basePoints, phaseUsesTierMultiplier, tierMultiplier } from "@/lib/pr";
import TournamentDetailView, { type DetailPhase, type DetailPlayer } from "@/components/tournament-detail-view";
import { getDict } from "@/i18n";

const t = getDict();

export function generateStaticParams() {
  return getTournaments().map((tn) => ({ slug: tn.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tn = getTournament(slug);
  return { title: tn ? tn.name : t.tournaments.title };
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tn = getTournament(slug);
  if (!tn) notFound();

  const scoring = getScoring();
  const mult = tierMultiplier(scoring, tn);
  const order = scoring.formats[tn.format]?.phaseOrder ?? [];
  const playerIndex: Record<string, DetailPlayer> = Object.fromEntries(
    getPlayers().map((p) => [p.discordId, { name: p.name, clan: p.clan ?? null }]),
  );

  const phases: DetailPhase[] = [...tn.phases]
    .sort((a, b) => {
      const ia = order.indexOf(a.type);
      const ib = order.indexOf(b.type);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((phase) => {
      const conf = scoring.formats[tn.format]?.phases[phase.type];
      const usesMult = phaseUsesTierMultiplier(scoring, tn, phase.type);
      const phaseMult = usesMult ? mult : 1;
      return {
        id: phase.id,
        label: conf?.label ?? phase.type,
        showsMultiplier: usesMult,
        rows: [...phase.placements]
          .sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity))
          .map((p) => {
            const pl = getPlayer(p.player);
            return {
              playerId: p.player,
              name: pl?.name ?? p.player,
              clan: pl?.clan ?? null,
              place: p.place ?? null,
              points: Math.round(basePoints(scoring, tn, phase.type, p.place ?? null) * phaseMult),
            };
          }),
      };
    });

  return (
    <TournamentDetailView
      name={tn.name}
      date={tn.date}
      map={tn.map ?? null}
      participants={tn.participants}
      format={tn.format}
      tier={tn.tier}
      sample={Boolean(tn.sample)}
      multiplier={mult}
      phases={phases}
      details={tn.details}
      playerIndex={playerIndex}
    />
  );
}
