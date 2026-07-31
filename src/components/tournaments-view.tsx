"use client";

import Link from "next/link";
import { SectionTitle, FormatBadge, TierBadge, SampleBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/i18n/provider";

export interface TournamentCard {
  slug: string;
  name: string;
  date: string;
  format: string;
  tier: string;
  participants: number;
  sample: boolean;
  winner: string | null;
}

export default function TournamentsView({ tournaments }: { tournaments: TournamentCard[] }) {
  const { t, locale, fmt } = useI18n();

  return (
    <div>
      <SectionTitle title={t.tournaments.title} subtitle={t.tournaments.subtitle} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tn) => (
          <Link
            key={tn.slug}
            href={`/tournaments/${tn.slug}`}
            className="card card-hover block p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="micro-label">{formatDate(tn.date, locale)}</div>
              {tn.sample ? <SampleBadge label={t.common.sampleBadge} /> : null}
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-tight">{tn.name}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <FormatBadge format={tn.format} label={t.formats[tn.format] ?? tn.format} />
              <TierBadge tier={tn.tier} />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="users" size="xs" /> {tn.participants}{" "}
                {t.common.participants.toLowerCase()}
              </span>
              {tn.winner ? (
                <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                  <Icon name="medal" size="xs" className="text-gold" />
                  <span className="truncate font-semibold text-gold">{tn.winner}</span>
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">
        {fmt(t.tournaments.count, { n: tournaments.length })}
      </p>
    </div>
  );
}
