"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, FormatBadge, InfoTip, PlaceNumber, SampleBadge, SectionTitle, TierBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDate, formatPoints } from "@/lib/format";
import type { TournamentDetails, TournamentRound } from "@/lib/types";
import PageContainer from "@/components/page-container";
import { useI18n } from "@/i18n/provider";

export interface DetailRow {
  playerId: string;
  name: string;
  clan: string | null;
  place: number | null;
  points: number;
  /** Récompense (monnaie du tier, ex. Plutonium) — 0 si aucune. */
  reward?: number;
}

export interface DetailPhase {
  id: string;
  label: string;
  showsMultiplier: boolean;
  rows: DetailRow[];
}

/** Identité affichable d'un joueur, résolue côté serveur (players.json). */
export interface DetailPlayer {
  name: string;
  clan: string | null;
}

/** Ligne du tableau « Stats du tournoi » (stats sur les parties). */
export interface TournamentStatsRow {
  playerId: string;
  place: number | null;
  gamesPlayed: number;
  wins: number;
  kills: number;
  survived: number;
  bestPlace: number | null;
  furthestStage: string | null;
  playtimeMin: number;
  avgGamePoints: number | null;
  /** Récompense (monnaie du tier, ex. Plutonium) — 0 si aucune. */
  reward?: number;
}

/** Grille de récompenses affichée dans les en-têtes (monnaie + tooltip). */
export interface RewardInfo {
  currency: string;
  name: string;
  /** Si vrai, les montants sont affichés (grille du tier). */
  active: boolean;
}

const STAGE_ORDER: Record<string, number> = { qualifier: 1, semifinal: 2, final: 3 };

function roundNum(label: string): number {
  const m = label.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Rounds triés par phase (qualif → demi → finale) puis par numéro de round. */
function sortRounds(rounds: TournamentRound[]): TournamentRound[] {
  return [...rounds].sort((a, b) => {
    const sa = STAGE_ORDER[a.stage ?? ""] ?? 9;
    const sb = STAGE_ORDER[b.stage ?? ""] ?? 9;
    if (sa !== sb) return sa - sb;
    return roundNum(a.round) - roundNum(b.round);
  });
}

function ScoreCell({ points, placement, kills, top5, reach }: { points?: number; placement?: number; kills?: number; top5?: number; reach?: number }) {
  const { t, locale } = useI18n();
  if (points == null) return <span className="text-muted">—</span>;
  const hasBreakdown =
    placement != null && kills != null && top5 != null && reach != null && placement + kills + top5 + reach === points;
  return (
    <div>
      <div className="num font-extrabold text-ink">{formatPoints(points, locale)}</div>
      {hasBreakdown ? (
        <div className="text-[10px] text-muted" title={t.tournaments.scoreBreakdown}>
          {placement}+{kills}+{top5}+{reach}
        </div>
      ) : null}
    </div>
  );
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
  playerIndex,
  stats = [],
  reward,
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
  playerIndex: Record<string, DetailPlayer>;
  stats?: TournamentStatsRow[];
  reward?: RewardInfo;
}) {
  const { t, locale } = useI18n();
  const [openGames, setOpenGames] = useState<Set<string>>(new Set());

  const toggleGame = (gameId: string) =>
    setOpenGames((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) next.delete(gameId);
      else next.add(gameId);
      return next;
    });

  const rounds = details?.games ? sortRounds(details.games) : [];
  const hasStats = stats.length > 0 && stats.some((s) => s.gamesPlayed > 0);

  return (
    <PageContainer>
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-cyan2"
      >
        <Icon name="arrowLeft" size="xs" /> {t.common.backToTournaments}
      </Link>

      <div className={`card mt-3 p-6 ${tier === "major" ? "major-card" : ""}`}>
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

            {rounds.length ? (
              <div className="mt-6 space-y-7">
                {rounds.map((round, i) => {
                  const stage = round.stage ?? "";
                  const stageLabel = stage ? t.tournaments.stages[stage as keyof typeof t.tournaments.stages] ?? null : null;
                  const prevStage = i > 0 ? rounds[i - 1].stage ?? "" : "";
                  const showStage = stageLabel != null && stage !== prevStage;
                  return (
                    <div key={`${round.round}-${i}`}>
                      {showStage ? (
                        <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-accent-strong">
                          <Icon name="flag" size="xs" /> {stageLabel}
                        </h3>
                      ) : null}
                      <h4 className="mt-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-muted">
                        <Icon name="swords" size="xs" /> {round.round}
                      </h4>
                      <div className="mt-3 space-y-3">
                        {round.entries.map((game) => {
                          const open = openGames.has(game.gameId);
                          return (
                            <div key={game.gameId} className="overflow-hidden rounded-lg border border-line bg-slate-50">
                              {/* En-tête de partie */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-xs">
                                {game.gameUrl ? (
                                  <a href={game.gameUrl} target="_blank" rel="noreferrer" className="font-extrabold text-cyan2 hover:underline">
                                    {game.name}
                                  </a>
                                ) : (
                                  <span className="font-extrabold">{game.name}</span>
                                )}
                                {game.map ? <span className="text-muted">{game.map}</span> : null}
                                <span className="text-muted">
                                  {game.players} {t.common.participants.toLowerCase()}
                                </span>
                                {game.winner ? (
                                  <span className="inline-flex items-center gap-1.5 font-bold text-gold">
                                    <Icon name="medal" size="xs" /> {game.winner}
                                  </span>
                                ) : null}
                                {game.replayUrl ? (
                                  <a href={game.replayUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-muted hover:text-cyan2 hover:underline">
                                    <Icon name="play" size="xs" /> {t.tournaments.replay}
                                  </a>
                                ) : null}
                                {game.results?.length ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleGame(game.gameId)}
                                    aria-expanded={open}
                                    className="ml-auto inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 font-bold text-muted transition-colors hover:border-accent/40 hover:text-accent-strong"
                                  >
                                    {t.tournaments.results}
                                    <Icon
                                      name="chevronDown"
                                      size="xs"
                                      className={`transition-transform ${open ? "rotate-180" : ""}`}
                                    />
                                  </button>
                                ) : null}
                              </div>

                              {/* Résultats de la partie (dépliables) */}
                              {open && game.results?.length ? (
                                <div className="overflow-x-auto border-t border-line/70 bg-white">
                                  <table className="w-full min-w-[760px] text-sm">
                                    <thead>
                                      <tr className="border-b border-line/70 text-left">
                                        <th className="micro-label w-16 px-4 py-2.5">{t.common.place}</th>
                                        <th className="micro-label px-4 py-2.5">{t.common.player}</th>
                                        <th className="micro-label px-4 py-2.5 text-right">{t.common.kills}</th>
                                        <th className="micro-label px-4 py-2.5 text-right">{t.tournaments.score}</th>
                                        <th className="micro-label px-4 py-2.5 text-right">{t.tournaments.result}</th>
                                        <th className="micro-label px-4 py-2.5 text-right">{t.tournaments.duration}</th>
                                        <th className="micro-label px-4 py-2.5 text-right">{t.tournaments.tiles}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {game.results.map((res) => {
                                        const p = playerIndex[res.player];
                                        const pName = p?.name ?? res.player;
                                        return (
                                          <tr key={res.player} className="lb-row">
                                            <td className="px-4 py-2">
                                              <PlaceNumber place={res.place} />
                                            </td>
                                            <td className="px-4 py-2">
                                              <Link
                                                href={`/players/${res.player}`}
                                                className="flex items-center gap-2.5 hover:text-accent-strong hover:underline"
                                              >
                                                <Avatar name={pName} size="sm" />
                                                <span className="font-semibold">
                                                  {p?.clan ? <span className="mr-1 text-xs text-muted">[{p.clan}]</span> : null}
                                                  {pName}
                                                </span>
                                              </Link>
                                            </td>
                                            <td className="num px-4 py-2 text-right font-bold text-muted">
                                              {res.kills != null ? res.kills : "—"}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                              <ScoreCell
                                                points={res.points}
                                                placement={res.placementPoints}
                                                kills={res.killPoints}
                                                top5={res.top5Bonus}
                                                reach={res.reachBonus}
                                              />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                              {res.result === "survived" ? (
                                                <span className="result-win font-bold">{t.tournaments.survived}</span>
                                              ) : res.result ? (
                                                <span className="result-loss font-bold">{t.tournaments.eliminated}</span>
                                              ) : (
                                                <span className="text-muted">—</span>
                                              )}
                                            </td>
                                            <td className="num px-4 py-2 text-right text-muted">
                                              {res.minutes != null ? `${res.minutes.toLocaleString(locale, { maximumFractionDigits: 1 })} min` : "—"}
                                            </td>
                                            <td className="num px-4 py-2 text-right text-muted">
                                              {res.finalTiles != null ? formatPoints(res.finalTiles, locale) : "—"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasStats ? (
        <section className="mt-8">
          <SectionTitle title={t.tournaments.stats} subtitle={t.tournaments.statsHint} />
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-line/70 text-left">
                    <th className="micro-label w-16 px-4 py-3">{t.common.place}</th>
                    <th className="micro-label px-4 py-3">{t.common.player}</th>
                    <th className="micro-label px-4 py-3 text-center">{t.tournaments.colGames}</th>
                    <th className="micro-label px-4 py-3 text-center">{t.tournaments.lobbyWins}</th>
                    <th className="micro-label px-4 py-3 text-center">{t.common.kills}</th>
                    <th className="micro-label px-4 py-3 text-center">{t.tournaments.survivedGames}</th>
                    <th className="micro-label px-4 py-3 text-center">{t.tournaments.bestGamePlace}</th>
                    <th className="micro-label px-4 py-3">{t.tournaments.furthestStage}</th>
                    <th className="micro-label px-4 py-3 text-right">{t.tournaments.playtime}</th>
                    <th className="micro-label px-4 py-3 text-right">{t.tournaments.avgGamePoints}</th>
                    {reward?.active ? (
                      <th className="micro-label px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="plutonium" size="sm" title="Plutonium" />
                          {reward.currency} <InfoTip text={t.tournaments.rewardHint} />
                        </span>
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => {
                    const p = playerIndex[s.playerId];
                    const pName = p?.name ?? s.playerId;
                    const stageLabel = s.furthestStage
                      ? t.tournaments.stages[s.furthestStage as keyof typeof t.tournaments.stages] ?? s.furthestStage
                      : null;
                    return (
                      <tr key={s.playerId} className="lb-row">
                        <td className="px-4 py-2.5">
                          <PlaceNumber place={s.place} />
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/players/${s.playerId}`}
                            className="flex items-center gap-2.5 hover:text-accent-strong hover:underline"
                          >
                            <Avatar name={pName} size="sm" />
                            <span className="font-semibold">
                              {p?.clan ? <span className="mr-1 text-xs text-muted">[{p.clan}]</span> : null}
                              {pName}
                            </span>
                          </Link>
                        </td>
                        <td className="num px-4 py-2.5 text-center font-bold">{s.gamesPlayed}</td>
                        <td className="num px-4 py-2.5 text-center text-muted">{s.wins}</td>
                        <td className="num px-4 py-2.5 text-center text-muted">{s.kills}</td>
                        <td className="num px-4 py-2.5 text-center text-muted">{s.survived}</td>
                        <td className="px-4 py-2.5 text-center">
                          <PlaceNumber place={s.bestPlace} />
                        </td>
                        <td className="px-4 py-2.5 text-xs font-bold text-muted">{stageLabel ?? "—"}</td>
                        <td className="num px-4 py-2.5 text-right text-muted">
                          {s.playtimeMin.toLocaleString(locale, { maximumFractionDigits: 1 })} min
                        </td>
                        <td className="num px-4 py-2.5 text-right font-bold">
                          {s.avgGamePoints != null ? s.avgGamePoints.toLocaleString(locale, { maximumFractionDigits: 1 }) : "—"}
                        </td>
                        {reward?.active ? (
                          <td className="num px-4 py-2.5 text-right font-extrabold text-gold">
                            {formatPoints(s.reward ?? 0, locale)} {reward.currency}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                    {reward?.active ? (
                      <th className="micro-label px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="plutonium" size="sm" title="Plutonium" />
                          {reward.currency} <InfoTip text={t.tournaments.rewardHint} />
                        </span>
                      </th>
                    ) : null}
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
                      {reward?.active ? (
                        <td className="num px-4 py-2.5 text-right font-extrabold text-gold">
                          {formatPoints(r.reward ?? 0, locale)} {reward.currency}
                        </td>
                      ) : null}
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
