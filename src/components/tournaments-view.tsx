"use client";

import Link from "next/link";
import { SectionTitle, FormatBadge, TierBadge, SampleBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import PageContainer from "@/components/page-container";
import { useI18n } from "@/i18n/provider";

export interface TournamentCard {
  slug: string;
  name: string;
  date: string;
  format: string;
  tier: string;
  participants: number;
  series: string | null;
  sample: boolean;
  winner: string | null;
}

export default function TournamentsView({ tournaments }: { tournaments: TournamentCard[] }) {
  const { t, locale, fmt } = useI18n();
  const groups = Array.from(
    tournaments.reduce((bySeries, tournament) => {
      const key = tournament.series ?? t.tournaments.otherSeries;
      const group = bySeries.get(key) ?? [];
      group.push(tournament);
      bySeries.set(key, group);
      return bySeries;
    }, new Map<string, TournamentCard[]>()),
  );

  return (
    <PageContainer>
      <SectionTitle title={t.tournaments.title} subtitle={t.tournaments.subtitle} />
      <div className="space-y-9">
        {groups.map(([series, group]) => (
          <section key={series}>
            <div className="mb-4 flex items-center gap-2">
              {series.startsWith("2026 Summer FFA") ? <Icon name="radiation" size="md" className="text-accent" /> : null}
              <h3 className="text-lg font-extrabold tracking-tight">{series}</h3>
              <span className="text-xs text-muted">({group.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((tn) => {
                const isSummerFfa = tn.series?.startsWith("2026 Summer FFA") ?? false;
                return (
                  <Link
                    key={tn.slug}
                    href={`/tournaments/${tn.slug}`}
                    className={`card card-hover block p-5 ${isSummerFfa ? "summer-ffa-card" : ""} ${tn.tier === "major" ? "major-card" : ""}`}
                  >
                    {isSummerFfa ? <Icon name="radiation" className="summer-ffa-mark h-16 w-16" /> : null}
                    <div className="relative flex items-start justify-between gap-2">
                      <div className={`micro-label ${isSummerFfa ? "text-white/75" : ""}`}>{formatDate(tn.date, locale)}</div>
                      {tn.sample ? <SampleBadge label={t.common.sampleBadge} /> : null}
                    </div>
                    <div className={`relative mt-2 text-lg font-extrabold tracking-tight ${isSummerFfa ? "text-white" : ""}`}>{tn.name}</div>
                    <div className="relative mt-3 flex flex-wrap gap-1.5">
                      <FormatBadge format={tn.format} label={t.formats[tn.format] ?? tn.format} />
                      <TierBadge tier={tn.tier} />
                    </div>
                    <div className={`relative mt-4 flex items-center justify-between text-xs ${isSummerFfa ? "text-white/80" : "text-muted"}`}>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="users" size="xs" /> {tn.participants} {t.common.participants.toLowerCase()}
                      </span>
                      {tn.winner ? (
                        <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                          <Icon name="medal" size="xs" className={isSummerFfa ? "text-white" : "text-gold"} />
                          <span className={`truncate font-semibold ${isSummerFfa ? "text-white" : "text-gold"}`}>{tn.winner}</span>
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">{fmt(t.tournaments.count, { n: tournaments.length })}</p>
    </PageContainer>
  );
}
