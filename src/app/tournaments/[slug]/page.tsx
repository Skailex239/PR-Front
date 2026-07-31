import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlayer, getScoring, getTournament, getTournaments } from "@/lib/data";
import { basePoints, phaseUsesTierMultiplier, tierMultiplier } from "@/lib/pr";
import { FormatBadge, PlaceNumber, SampleBadge, SectionTitle, TierBadge, Avatar } from "@/components/ui";
import { formatDate, formatPoints } from "@/lib/format";
import { getDict } from "@/i18n";

const t = getDict();

export function generateStaticParams() {
  return getTournaments().map((tn) => ({ slug: tn.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
  const phases = [...tn.phases].sort((a, b) => {
    const ia = order.indexOf(a.type);
    const ib = order.indexOf(b.type);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div>
      <Link href="/tournaments" className="text-xs font-semibold text-muted hover:text-cyan2">
        {t.common.backToTournaments}
      </Link>

      <div className="card mt-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="micro-label">
              {formatDate(tn.date)} · {tn.map ? `${t.common.map} ${tn.map} · ` : ""}
              {tn.participants} {t.common.participants.toLowerCase()}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{tn.name}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <FormatBadge format={tn.format} label={t.formats[tn.format] ?? tn.format} />
              <TierBadge tier={tn.tier} />
              {tn.sample ? <SampleBadge label={t.common.sampleBadge} /> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {phases.map((phase) => {
          const conf = scoring.formats[tn.format]?.phases[phase.type];
          const label = conf?.label ?? phase.type;
          const rows = [...phase.placements].sort(
            (a, b) => (a.place ?? Infinity) - (b.place ?? Infinity),
          );
          return (
            <section key={phase.id}>
              <SectionTitle title={`${t.common.phase} — ${label}`} />
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line/70 text-left">
                      <th className="micro-label w-20 px-4 py-3">{t.common.place}</th>
                      <th className="micro-label px-4 py-3">{t.common.player}</th>
                      <th className="micro-label px-4 py-3 text-right">
                        {t.common.points}
                        {phaseUsesTierMultiplier(scoring, tn, phase.type) ? ` (×${mult})` : ""}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const pl = getPlayer(p.player);
                      const phaseMult = phaseUsesTierMultiplier(scoring, tn, phase.type) ? mult : 1;
                      const pts = Math.round(basePoints(scoring, tn, phase.type, p.place ?? null) * phaseMult);
                      return (
                        <tr key={p.player} className="lb-row">
                          <td className="px-4 py-2.5"><PlaceNumber place={p.place ?? null} /></td>
                          <td className="px-4 py-2.5">
                            <Link href={`/players/${p.player}`} className="flex items-center gap-3 hover:text-accent-strong hover:underline">
                              <Avatar name={pl?.name ?? p.player} size="sm" />
                              <span className="font-semibold">
                                {pl?.clan ? <span className="mr-1.5 text-xs text-muted">[{pl.clan}]</span> : null}
                                {pl?.name ?? p.player}
                              </span>
                            </Link>
                          </td>
                          <td className="num px-4 py-2.5 text-right font-extrabold gradient-text">
                            +{formatPoints(pts)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
