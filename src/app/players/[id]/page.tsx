import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeaderboard, getPlayer, getPlayerPR, getPlayers } from "@/lib/data";
import LiveStats from "@/components/live-stats";
import { Avatar, SectionTitle, StatCard } from "@/components/ui";
import { formatDate, formatPoints, placeLabel } from "@/lib/format";
import type { PhasePointsAward } from "@/lib/types";
import { getDict } from "@/i18n";

const t = getDict();

/** Profils pré-générés en statique (compatible GitHub Pages). */
export function generateStaticParams() {
  const ids = new Set<string>([
    ...getPlayers().map((p) => p.discordId),
    ...getLeaderboard().map((e) => e.playerId),
  ]);
  return [...ids].map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayer(id);
  return { title: player ? player.name : id };
}

interface TournamentGroup {
  slug: string;
  name: string;
  date: string;
  total: number;
  bestPlace: number | null;
  awards: PhasePointsAward[];
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  const pr = getPlayerPR(id);
  if (!player && !pr) notFound();

  const name = player?.name ?? id;
  const displayName = player?.clan ? `[${player.clan}] ${name}` : name;

  // Regroupe les attributions de points par tournoi (plus récent d'abord).
  const groups: TournamentGroup[] = [];
  if (pr) {
    for (const a of [...pr.awards].reverse()) {
      let g = groups.find((x) => x.slug === a.tournamentSlug);
      if (!g) {
        g = { slug: a.tournamentSlug, name: a.tournamentName, date: a.tournamentDate, total: 0, bestPlace: null, awards: [] };
        groups.push(g);
      }
      g.awards.push(a);
      g.total += a.points;
      if (a.phaseType === "finale" && a.place != null) {
        g.bestPlace = g.bestPlace == null ? a.place : Math.min(g.bestPlace, a.place);
      }
    }
  }

  return (
    <div>
      <Link href="/" className="text-xs font-semibold text-muted hover:text-cyan2">
        {t.common.backToLeaderboard}
      </Link>

      {/* En-tête profil */}
      <div className="card mt-3 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={name} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="micro-label">{pr ? `${t.common.rank} #${pr.rank}` : t.common.unknownPlayer}</div>
          <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">{displayName}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip" title={t.common.discordId}>💬 {id}</span>
            {player?.openfrontId ? <span className="chip" title={t.player.openfrontId}>🎮 {player.openfrontId}</span> : null}
            {player?.country ? <span className="chip">📍 {player.country}</span> : null}
            {player?.clan ? <span className="chip">🛡 {player.clan}</span> : null}
          </div>
        </div>
        {pr ? (
          <div className="text-left sm:text-right">
            <div className="micro-label">{t.player.prPoints}</div>
            <div className="num text-4xl font-black gradient-text sm:text-5xl">{formatPoints(pr.points)}</div>
          </div>
        ) : null}
      </div>

      {/* Cartes de stats compétitives */}
      {pr ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={t.common.events} value={pr.events} />
          <StatCard label={t.common.wins} value={pr.wins} />
          <StatCard label={t.common.top3} value={pr.top3} />
          <StatCard
            label={t.common.avgPlace}
            value={pr.avgPlace == null ? "—" : `#${pr.avgPlace.toFixed(1)}`}
            sub={pr.bestPlace != null ? `${t.common.bestPlace} : ${placeLabel(pr.bestPlace)}` : undefined}
          />
        </div>
      ) : null}

      {/* Détail des points */}
      <section className="mt-10">
        <SectionTitle title={t.player.breakdown} subtitle={t.player.breakdownHint} />
        {groups.length === 0 ? (
          <div className="card p-6 text-sm text-muted">{t.player.noTournament}</div>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.slug} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-4 py-3">
                  <Link href={`/tournaments/${g.slug}`} className="font-extrabold hover:text-violet-300 hover:underline">
                    {g.name}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{formatDate(g.date)}</span>
                    {g.bestPlace != null ? (
                      <span className={g.bestPlace <= 3 ? `rank-${g.bestPlace} font-extrabold` : ""}>
                        {placeLabel(g.bestPlace)}
                      </span>
                    ) : null}
                    <span className="num text-sm font-extrabold gradient-text">+{formatPoints(g.total)}</span>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {g.awards.map((a, i) => (
                      <tr key={`${a.phaseType}-${i}`} className="lb-row">
                        <td className="px-4 py-2.5 text-muted">{a.phaseLabel}</td>
                        <td className="px-4 py-2.5">
                          {a.place != null ? (
                            <span className={`num font-bold ${a.place === 1 ? "rank-1" : a.place === 2 ? "rank-2" : a.place === 3 ? "rank-3" : "text-text"}`}>
                              {placeLabel(a.place)}
                            </span>
                          ) : (
                            <span className="text-muted">{t.common.participation}</span>
                          )}
                        </td>
                        <td className="num px-4 py-2.5 text-right font-extrabold gradient-text">+{formatPoints(a.points)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats live OpenFront (chargées côté navigateur via le public ID OpenFront) */}
      <LiveStats openfrontId={player?.openfrontId ?? null} />
    </div>
  );
}
