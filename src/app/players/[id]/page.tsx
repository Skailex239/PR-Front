import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeaderboard, getPlayer, getPlayerPR, getPlayers, getScoring, getTournament } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import LiveStats from "@/components/live-stats";
import { Avatar, FormatBadge, TierBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDateShort, formatPoints } from "@/lib/format";
import type { PhasePointsAward, TournamentFormat } from "@/lib/types";
import { getDict } from "@/i18n";

const t = getDict();

export function generateStaticParams() {
  const ids = new Set<string>([...getPlayers().map((p) => p.discordId), ...getLeaderboard().map((e) => e.playerId)]);
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
  tier: string;
  format: TournamentFormat;
  awards: PhasePointsAward[];
}

function PRChart({ groups }: { groups: TournamentGroup[] }) {
  const chronological = [...groups].sort((a, b) => a.date.localeCompare(b.date));
  let sum = 0;
  const values = chronological.map((g) => ({ ...g, cumulative: (sum += g.total) }));
  const width = 720, height = 168, left = 10, right = 12, top = 14, bottom = 35;
  const max = Math.max(...values.map((v) => v.cumulative), 1);
  const x = (i: number) => values.length <= 1 ? width / 2 : left + (i / (values.length - 1)) * (width - left - right);
  const y = (value: number) => top + (1 - value / max) * (height - top - bottom);
  const points = values.map((v, i) => `${x(i)},${y(v.cumulative)}`).join(" ");
  const area = values.length ? `${left},${height-bottom} ${points} ${x(values.length-1)},${height-bottom}` : "";

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between">
        <div><div className="text-xs font-black uppercase tracking-wide">Évolution du Power Ranking</div><div className="mt-0.5 text-[10px] text-muted">Points cumulés après chaque tournoi</div></div>
        <div className="rounded-md bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-accent-strong">POWER RANKING</div>
      </div>
      {values.length === 0 ? <div className="flex h-36 items-center justify-center text-xs text-muted">Aucune donnée</div> : (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[168px] w-full overflow-visible" role="img" aria-label="Évolution des points PR cumulés">
          <defs><linearGradient id="pr-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8781d" stopOpacity=".28"/><stop offset="1" stopColor="#e8781d" stopOpacity=".02"/></linearGradient></defs>
          {[0, .5, 1].map((p) => <line key={p} x1={left} x2={width-right} y1={top+p*(height-top-bottom)} y2={top+p*(height-top-bottom)} stroke="#e8e2dc" strokeWidth="1" />)}
          <polygon className="pr-chart-area" points={area} fill="url(#pr-area)" />
          <polyline className="pr-chart-line" points={points} fill="none" stroke="#e8781d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {values.map((v, i) => <g key={v.slug} className="pr-chart-point" style={{ animationDelay: `${700 + i * 110}ms` }}><circle cx={x(i)} cy={y(v.cumulative)} r="4" fill="#fff" stroke="#e8781d" strokeWidth="2.5"/><text x={x(i)} y={height-11} textAnchor="middle" fill="#8b837d" fontSize="10">{formatDateShort(v.date).slice(0,5)}</text></g>)}
        </svg>
      )}
    </div>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return <div><div className="text-[10px] font-semibold text-muted">{label}</div><div className={`num mt-1 text-xl font-black ${accent ? "text-accent-strong" : "text-text"}`}>{value}</div></div>;
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  const pr = getPlayerPR(id);
  if (!player && !pr) notFound();
  const name = player?.name ?? id;
  const scoring = getScoring();
  const groups: TournamentGroup[] = [];

  if (pr) {
    for (const a of [...pr.awards].reverse()) {
      let group = groups.find((g) => g.slug === a.tournamentSlug);
      const tournament = getTournament(a.tournamentSlug);
      if (!group) {
        group = { slug: a.tournamentSlug, name: a.tournamentName, date: a.tournamentDate, total: 0, bestPlace: null, tier: a.tier, format: a.format, awards: [] };
        groups.push(group);
      }
      group.awards.push(a);
      group.total += a.points;
      if (tournament && isFinalPhase(scoring, tournament, a.phaseType) && a.place != null) group.bestPlace = group.bestPlace == null ? a.place : Math.min(group.bestPlace, a.place);
    }
  }

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent-strong"><Icon name="arrowLeft" size="xs" /> {t.common.backToLeaderboard}</Link>

      <section className="mt-3 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[#d76511] via-[#ee8b2e] to-[#f6c16e]" />
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[280px_1fr] lg:px-8">
          <div className="flex items-center gap-4 lg:border-r lg:border-line lg:pr-7">
            <div className="relative">
              <div className="rounded-xl border-4 border-orange-100 shadow-md"><Avatar name={name} size="xl" /></div>
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center bg-accent text-sm font-black text-white [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]"><Icon name="bolt" size="sm" /></div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-muted">Power Ranking</div>
              <h1 className="mt-0.5 truncate text-xl font-black">{player?.clan ? <span className="mr-1.5 text-xs text-muted">[{player.clan}]</span> : null}{name}</h1>
              <div className="num mt-1 text-[2rem] font-black leading-none text-accent-strong">{pr ? formatPoints(pr.points) : "—"}</div>
              <div className="mt-1 text-[10px] font-bold text-muted">#{pr?.rank ?? "—"} du classement · ID {id}</div>
            </div>
          </div>
          <PRChart groups={groups} />
        </div>

        {pr ? <div className="grid border-t border-line bg-[#fbf7f1] lg:grid-cols-2">
          <div className="border-b border-line px-6 py-5 lg:border-b-0 lg:border-r lg:px-8">
            <h2 className="mb-4 text-sm font-black">Totaux du circuit</h2>
            <div className="grid grid-cols-3 gap-6"><Metric label="Points PR" value={formatPoints(pr.points)} accent/><Metric label="Tournois" value={pr.events}/><Metric label="Attributions" value={pr.awards.length}/></div>
          </div>
          <div className="px-6 py-5 lg:px-8">
            <h2 className="mb-4 text-sm font-black">Placements</h2>
            <div className="grid grid-cols-4 gap-5"><Metric label="Victoires" value={pr.wins}/><Metric label="Top 3" value={pr.top3}/><Metric label="Meilleure place" value={pr.bestPlace == null ? "—" : `#${pr.bestPlace}`}/><Metric label="Place moyenne" value={pr.avgPlace == null ? "—" : `#${pr.avgPlace.toFixed(1)}`}/></div>
          </div>
        </div> : null}
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-black uppercase tracking-tight">Résultats des tournois</h2><p className="mt-0.5 text-xs text-muted">{groups.length} tournoi{groups.length > 1 ? "s" : ""} joué{groups.length > 1 ? "s" : ""}</p></div>
          <div className="rounded-md bg-orange-50 px-3 py-2 text-xs font-bold text-accent-strong">Historique PR</div>
        </div>
        {groups.length === 0 ? <div className="p-8 text-sm text-muted">{t.player.noTournament}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#f7f4ef]"><tr className="border-b border-line text-left"><th className="micro-label px-5 py-3">Tournoi</th><th className="micro-label px-4 py-3">Format</th><th className="micro-label px-4 py-3 text-center">Place</th><th className="micro-label px-4 py-3 text-center">Phases</th><th className="micro-label px-5 py-3 text-right">Points PR</th></tr></thead>
              <tbody>{groups.map((g) => <tr key={g.slug} className="lb-row">
                <td className="px-5 py-4"><Link href={`/tournaments/${g.slug}`} className="font-extrabold hover:text-accent-strong hover:underline">{g.name}</Link><div className="mt-1 text-[11px] text-muted">{formatDateShort(g.date)}</div></td>
                <td className="px-4 py-4"><div className="flex gap-1.5"><FormatBadge format={g.format} label={t.formats[g.format] ?? g.format}/><TierBadge tier={g.tier}/></div></td>
                <td className={`num px-4 py-4 text-center text-base font-black ${g.bestPlace != null && g.bestPlace <= 3 ? `rank-${g.bestPlace}` : ""}`}>{g.bestPlace == null ? "—" : `#${g.bestPlace}`}</td>
                <td className="num px-4 py-4 text-center font-bold text-muted">{g.awards.length}</td>
                <td className="num px-5 py-4 text-right text-base font-black text-accent-strong">+{formatPoints(g.total)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <LiveStats openfrontId={player?.openfrontId ?? null} />
    </div>
  );
}
