"use client";

import Link from "next/link";
import { FormatBadge, PlaceNumber, SampleBadge, SectionTitle, TierBadge, Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDate, formatPoints } from "@/lib/format";
import type { TournamentDetails } from "@/lib/types";
import PageContainer from "@/components/page-container";
import { useI18n } from "@/i18n/provider";

export interface DetailRow {
  playerId: string;
  name: string;
  clan: string | null;
  place: number | null;
  points: number;
}

export interface DetailPhase {
  id: string;
  label: string;
  showsMultiplier: boolean;
  rows: DetailRow[];
}

export default function TournamentDetailView({
  name,
  date,
  map,
  participants,
  format,
  tier,
  sample,
  multiplier,
  phases,
  details,
}: {
  name: string;
  date: string;
  map: string | null;
  participants: number;
  format: string;
  tier: string;
  sample: boolean;
  multiplier: number;
  phases: DetailPhase[];
  details?: TournamentDetails;
}) {
  const { t, locale } = useI18n();

  return (
    <PageContainer>
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-cyan2"
      >
        <Icon name="arrowLeft" size="xs" /> {t.common.backToTournaments}
      </Link>

      <div className="card mt-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="micro-label">
              {formatDate(date, locale)} · {map ? `${t.common.map} ${map} · ` : ""}
              {participants} {t.common.participants.toLowerCase()}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{name}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <FormatBadge format={format} label={t.formats[format] ?? format} />
              <TierBadge tier={tier} />
              {sample ? <SampleBadge label={t.common.sampleBadge} /> : null}
            </div>
          </div>
        </div>
      </div>

      {details ? (
        <section className="mt-8">
          <SectionTitle title={t.tournaments.details} />
          <div className="card p-5">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              {details.registered ? <span><b className="text-ink">{details.registered}</b> {t.tournaments.registered}</span> : null}
              {details.gameCount ? <span><b className="text-ink">{details.gameCount}</b> {t.tournaments.games}</span> : null}
              {details.rounds ? <span><b className="text-ink">{details.rounds}</b> {t.tournaments.rounds}</span> : null}
            </div>
            {details.settings?.length ? <p className="mt-3 text-sm text-muted">{details.settings.join(" · ")}</p> : null}
            {details.games?.length ? (
              <div className="mt-5 space-y-4">
                {details.games.map((round) => (
                  <div key={round.round}>
                    <h3 className="text-sm font-extrabold">{round.round}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {round.entries.map((game) => (
                        <div key={game.gameId} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-xs">
                          <a href={game.gameUrl} target="_blank" rel="noreferrer" className="font-bold text-cyan2 hover:underline">{game.name}</a>
                          <span className="mx-1.5 text-muted">·</span>{game.players} {t.common.participants.toLowerCase()}
                          <span className="mx-1.5 text-muted">·</span>
                          <a href={game.replayUrl} target="_blank" rel="noreferrer" className="font-semibold text-muted hover:text-cyan2 hover:underline">{t.tournaments.replay}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="mt-8 space-y-8">
        {phases.map((phase) => (
          <section key={phase.id}>
            <SectionTitle title={`${t.common.phase} — ${phase.label}`} />
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line/70 text-left">
                    <th className="micro-label w-20 px-4 py-3">{t.common.place}</th>
                    <th className="micro-label px-4 py-3">{t.common.player}</th>
                    <th className="micro-label px-4 py-3 text-right">
                      {t.common.points}
                      {phase.showsMultiplier ? ` (×${multiplier})` : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {phase.rows.map((r) => (
                    <tr key={r.playerId} className="lb-row">
                      <td className="px-4 py-2.5">
                        <PlaceNumber place={r.place} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/players/${r.playerId}`}
                          className="flex items-center gap-3 hover:text-accent-strong hover:underline"
                        >
                          <Avatar name={r.name} size="sm" />
                          <span className="font-semibold">
                            {r.clan ? (
                              <span className="mr-1.5 text-xs text-muted">[{r.clan}]</span>
                            ) : null}
                            {r.name}
                          </span>
                        </Link>
                      </td>
                      <td className="num px-4 py-2.5 text-right font-extrabold gradient-text">
                        +{formatPoints(r.points, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
