import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeaderboard, getPlayer, getPlayerPR, getPlayers, getScoring, getTournament } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import LiveStats from "@/components/live-stats";
import { Avatar } from "@/components/ui";
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

/** Petite stat compacte façon sidebar Fortnite Tracker (LIFETIME STATS). */
function SidebarStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5 border-r border-line/60 py-3 text-center last:border-r-0">
      <div className="num text-lg font-black">{value}</div>
      <div className="text-[0.6rem] font-bold uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  const pr = getPlayerPR(id);
  if (!player && !pr) notFound();

  const name = player?.name ?? id;

  // Regroupe les attributions de points par tournoi (plus récent d'abord).
  const scoring = getScoring();
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
      const tn = getTournament(a.tournamentSlug);
      if (tn && isFinalPhase(scoring, tn, a.phaseType) && a.place != null) {
        g.bestPlace = g.bestPlace == null ? a.place : Math.min(g.bestPlace, a.place);
      }
    }
  }

  return (
    <div>
      <Link href="/" className="text-xs font-semibold text-muted hover:text-accent-strong">
        {t.common.backToLeaderboard}
      </Link>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* ---------- Sidebar façon Fortnite Tracker ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <Avatar name={name} size="xl" />
              <div className="min-w-0">
                <div className="micro-label">{pr ? `${t.common.rank} #${pr.rank}` : t.common.unknownPlayer}</div>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight">{name}</h1>
                {player?.clan ? <div className="mt-1 text-xs font-semibold text-muted">[{player.clan}]</div> : null}
              </div>
              {pr ? (
                <div className="num text-3xl font-black gradient-text">
                  {formatPoints(pr.points)} <span className="text-xs font-bold text-muted">{t.leaderboard.podiumPts}</span>
                </div>
              ) : null}
            </div>

            {pr ? (
              <div className="border-t border-line/70">
                <div className="micro-label px-4 pt-3">{t.player.lifetimeStats}</div>
                <div className="grid grid-cols-2 divide-y divide-line/60 sm:grid-cols-4 sm:divide-y-0">
                  <SidebarStat label={t.common.events} value={pr.events} />
                  <SidebarStat label={t.common.wins} value={pr.wins} />
                  <SidebarStat label={t.common.top3} value={pr.top3} />
                  <SidebarStat label={t.common.avgPlace} value={pr.avgPlace == null ? "—" : `#${pr.avgPlace.toFixed(1)}`} />
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-1.5 border-t border-line/70 p-4">
              <span className="chip" title={t.common.discordId}>💬 {id}</span>
              {player?.openfrontId ? <span className="chip" title={t.player.openfrontId}>🎮 {player.openfrontId}</span> : null}
              {player?.country ? <span className="chip">📍 {player.country}</span> : null}
            </div>
          </div>
        </aside>

        {/* ---------- Contenu principal ---------- */}
        <div className="min-w-0">
          {/* Détail des points */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">{t.player.breakdown}</h2>
              <p className="mt-1 text-sm text-muted">{t.player.breakdownHint}</p>
            </div>
            {groups.length === 0 ? (
              <div className="card p-6 text-sm text-muted">{t.player.noTournament}</div>
            ) : (
              <div className="space-y-4">
                {groups.map((g) => (
                  <div key={g.slug} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-4 py-3">
                      <Link href={`/tournaments/${g.slug}`} className="font-extrabold hover:text-accent-strong hover:underline">
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
      </div>
    </div>
  );
}
