import Link from "next/link";
import type { Metadata } from "next";
import { getPlayer, getTournaments, getScoring } from "@/lib/data";
import { SectionTitle, FormatBadge, TierBadge, SampleBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Tournament } from "@/lib/types";
import { getDict, tpl } from "@/i18n";

const t = getDict();

export const metadata: Metadata = { title: t.tournaments.title };

function winnerOf(tn: Tournament) {
  for (const phase of tn.phases) {
    if (phase.type !== "finale") continue;
    const win = phase.placements.find((p) => p.place === 1);
    if (win) return getPlayer(win.player)?.name ?? win.player;
  }
  return null;
}

export default function TournamentsPage() {
  const tournaments = getTournaments();
  getScoring(); // valide la config tôt

  return (
    <div>
      <SectionTitle title={t.tournaments.title} subtitle={t.tournaments.subtitle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tn) => {
          const winner = winnerOf(tn);
          return (
            <Link key={tn.slug} href={`/tournaments/${tn.slug}`} className="card card-hover block p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="micro-label">{formatDate(tn.date)}</div>
                {tn.sample ? <SampleBadge label={t.common.sampleBadge} /> : null}
              </div>
              <div className="mt-2 text-lg font-extrabold tracking-tight">{tn.name}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <FormatBadge format={tn.format} label={t.formats[tn.format] ?? tn.format} />
                <TierBadge tier={tn.tier} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>
                  👥 {tn.participants} {t.common.participants.toLowerCase()}
                </span>
                {winner ? (
                  <span className="truncate">
                    🥇 <span className="font-semibold text-gold">{winner}</span>
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted">{tpl(t.tournaments.count, { n: tournaments.length })}</p>
    </div>
  );
}
