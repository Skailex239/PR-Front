"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Avatar, FormatBadge, PlaceNumber, TierBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import PRChart, { type PRChartPoint } from "@/components/pr-chart";
import LiveStats from "@/components/live-stats";
import { formatDateShort, formatPoints } from "@/lib/format";
import type { TournamentFormat } from "@/lib/types";
import PageContainer from "@/components/page-container";
import { useI18n } from "@/i18n/provider";

/** Une partie (lobby) d'un tournoi : place du joueur consulté + gagnant. */
export interface PlayerGameRow {
  round: string;
  gameName: string;
  gameId: string;
  gameUrl?: string;
  replayUrl?: string;
  players: number;
  /** Place du joueur consulté dans cette partie (null = non renseigné). */
  place: number | null;
  /** Kills du joueur consulté dans cette partie (null = non renseigné). */
  kills: number | null;
  /** Pseudo du gagnant de la partie (null = pas de gagnant / ex-aequo). */
  winner: string | null;
}

export interface PlayerViewGroup {
  slug: string;
  name: string;
  date: string;
  total: number;
  bestPlace: number | null;
  tier: string;
  format: TournamentFormat;
  phases: number;
  /** Parties du tournoi (détail dépliable), avec leur vainqueur. */
  games: PlayerGameRow[];
}

export interface PlayerViewProps {
  id: string;
  name: string;
  clan: string | null;
  openfrontId: string | null;
  pr: {
    points: number;
    rank: number;
    events: number;
    awards: number;
    wins: number;
    top3: number;
    bestPlace: number | null;
    avgPlace: number | null;
  } | null;
  groups: PlayerViewGroup[];
  chart: PRChartPoint[];
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-muted">{label}</div>
      <div className={`num mt-1 text-xl font-black ${accent ? "text-accent-strong" : "text-text"}`}>
        {value}
      </div>
    </div>
  );
}

export default function PlayerView({
  id,
  name,
  clan,
  openfrontId,
  pr,
  groups,
  chart,
}: PlayerViewProps) {
  const { t, locale, fmt } = useI18n();
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(new Set());

  const toggleGames = (slug: string) =>
    setOpenSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <PageContainer>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent-strong"
      >
        <Icon name="arrowLeft" size="xs" /> {t.common.backToLeaderboard}
      </Link>

      <section className="mt-3 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[#d76511] via-[#ee8b2e] to-[#f6c16e]" />
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[280px_1fr] lg:px-8">
          <div className="flex items-center gap-4 lg:border-r lg:border-line lg:pr-7">
            <div className="relative">
              <div className="rounded-xl border-4 border-orange-100 shadow-md">
                <Avatar name={name} size="xl" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center bg-accent text-sm font-black text-white [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
                <Icon name="bolt" size="sm" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-muted">{t.leaderboard.title}</div>
              <h1 className="mt-0.5 truncate text-xl font-black">
                {clan ? <span className="mr-1.5 text-xs text-muted">[{clan}]</span> : null}
                {name}
              </h1>
              <div className="num mt-1 text-[2rem] font-black leading-none text-accent-strong">
                {pr ? formatPoints(pr.points, locale) : "—"}
              </div>
              <div className="mt-1 text-[10px] font-bold text-muted">
                #{pr?.rank ?? "—"} {t.player.rankSuffix} · {t.player.idLabel} {id}
              </div>
            </div>
          </div>
          <PRChart points={chart} />
        </div>

        {pr ? (
          <div className="grid border-t border-line bg-[#fbf7f1] lg:grid-cols-2">
            <div className="border-b border-line px-6 py-5 lg:border-b-0 lg:border-r lg:px-8">
              <h2 className="mb-4 text-sm font-black">{t.player.circuitTotals}</h2>
              <div className="grid grid-cols-3 gap-6">
                <Metric label={t.player.prPoints} value={formatPoints(pr.points, locale)} accent />
                <Metric label={t.common.tournaments} value={pr.events} />
                <Metric label={t.player.awardsLabel} value={pr.awards} />
              </div>
            </div>
            <div className="px-6 py-5 lg:px-8">
              <h2 className="mb-4 text-sm font-black">{t.player.placementsTitle}</h2>
              <div className="grid grid-cols-4 gap-5">
                <Metric label={t.common.wins} value={pr.wins} />
                <Metric label={t.common.top3} value={pr.top3} />
                <Metric
                  label={t.common.bestPlace}
                  value={pr.bestPlace == null ? "—" : `#${pr.bestPlace}`}
                />
                <Metric
                  label={t.player.avgPlaceShort}
                  value={pr.avgPlace == null ? "—" : `#${pr.avgPlace.toFixed(1)}`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">
              {t.player.resultsTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {fmt(t.player.playedCount, { n: groups.length })}
            </p>
          </div>
          <div className="rounded-md bg-orange-50 px-3 py-2 text-xs font-bold text-accent-strong">
            {t.player.historyBadge}
          </div>
        </div>
        {groups.length === 0 ? (
          <div className="p-8 text-sm text-muted">{t.player.noTournament}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#f7f4ef]">
                <tr className="border-b border-line text-left">
                  <th className="micro-label px-5 py-3">{t.player.colTournament}</th>
                  <th className="micro-label px-4 py-3">{t.common.format}</th>
                  <th className="micro-label px-4 py-3 text-center">{t.common.place}</th>
                  <th className="micro-label px-4 py-3 text-center">{t.player.colPhases}</th>
                  <th className="micro-label px-5 py-3 text-right">{t.player.prPoints}</th>
                  <th className="micro-label px-5 py-3 text-right">{t.player.details}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const open = openSlugs.has(g.slug);
                  return (
                    <Fragment key={g.slug}>
                      <tr className={`lb-row ${open ? "bg-[#fbf7f1]" : ""}`}>
                        <td className="px-5 py-4">
                          <Link
                            href={`/tournaments/${g.slug}`}
                            className="font-extrabold hover:text-accent-strong hover:underline"
                          >
                            {g.name}
                          </Link>
                          <div className="mt-1 text-[11px] text-muted">
                            {formatDateShort(g.date, locale)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1.5">
                            <FormatBadge format={g.format} label={t.formats[g.format] ?? g.format} />
                            <TierBadge tier={g.tier} />
                          </div>
                        </td>
                        <td
                          className={`num px-4 py-4 text-center text-base font-black ${
                            g.bestPlace != null && g.bestPlace <= 3 ? `rank-${g.bestPlace}` : ""
                          }`}
                        >
                          {g.bestPlace == null ? "—" : `#${g.bestPlace}`}
                        </td>
                        <td className="num px-4 py-4 text-center font-bold text-muted">{g.phases}</td>
                        <td className="num px-5 py-4 text-right text-base font-black text-accent-strong">
                          +{formatPoints(g.total, locale)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {g.games.some((game) => game.winner != null || game.place != null) ? (
                            <button
                              onClick={() => toggleGames(g.slug)}
                              aria-expanded={open}
                              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs font-bold text-muted transition-colors hover:border-accent/40 hover:text-accent-strong"
                            >
                              {t.player.details}
                              <Icon
                                name="chevronDown"
                                size="xs"
                                className={`transition-transform ${open ? "rotate-180" : ""}`}
                              />
                            </button>
                          ) : (
                            <span className="text-xs text-muted/60">—</span>
                          )}
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-t border-line/60 bg-[#fbf9f5]">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-muted">
                              <Icon name="swords" size="xs" />
                              {t.player.gamesTitle} — {g.name}
                            </div>
                            <div className="mt-3 overflow-x-auto">
                              <table className="w-full min-w-[560px] text-sm">
                                <thead>
                                  <tr className="border-b border-line/70 text-left">
                                    <th className="micro-label px-3 py-2">{t.player.colRound}</th>
                                    <th className="micro-label px-3 py-2">{t.player.colGame}</th>
                                    <th className="micro-label px-3 py-2 text-center">
                                      {t.common.place}
                                    </th>
                                    <th className="micro-label px-3 py-2">{t.player.winner}</th>
                                    <th className="micro-label px-3 py-2 text-center">
                                      {t.common.players}
                                    </th>
                                    <th className="micro-label px-3 py-2 text-right">
                                      {t.tournaments.replay}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {g.games.map((game) => (
                                    <tr
                                      key={game.gameId}
                                      className="border-b border-line/50 last:border-0"
                                    >
                                      <td className="px-3 py-2 text-xs font-bold text-muted">
                                        {game.round}
                                      </td>
                                      <td className="px-3 py-2">
                                        {game.gameUrl ? (
                                          <a
                                            href={game.gameUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            title={t.tournaments.openGame}
                                            className="font-extrabold hover:text-accent-strong hover:underline"
                                          >
                                            {game.gameName}
                                          </a>
                                        ) : (
                                          <span className="font-extrabold">{game.gameName}</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {game.place != null ? (
                                          <PlaceNumber place={game.place} />
                                        ) : (
                                          <span className="text-muted">—</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 font-extrabold">
                                        {game.winner ?? <span className="text-muted">—</span>}
                                      </td>
                                      <td className="px-3 py-2 text-center text-xs text-muted">
                                        {game.players}
                                        {game.kills != null ? (
                                          <span className="ml-1.5 text-muted/70">({game.kills} ⚔)</span>
                                        ) : null}
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        {game.replayUrl ? (
                                          <a
                                            href={game.replayUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-accent-strong hover:underline"
                                          >
                                            <Icon name="play" size="xs" /> {t.tournaments.replay}
                                          </a>
                                        ) : null}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Le bloc « stats live » n'a de sens que si un compte OpenFront est relié
          (aucun ne l'est aujourd'hui : afficher un encart vide sur les 506
          profils n'apporterait rien). */}
      {openfrontId ? <LiveStats openfrontId={openfrontId} /> : null}
    </PageContainer>
  );
}
