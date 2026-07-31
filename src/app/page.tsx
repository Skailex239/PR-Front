import { getLeaderboard, getTournaments } from "@/lib/data";
import LeaderboardView, { type LbRow } from "@/components/leaderboard-view";
import Podium from "@/components/podium";
import { SampleBadge } from "@/components/ui";
import { getDict } from "@/i18n";

const t = getDict();

export default function HomePage() {
  const entries = getLeaderboard();
  const tournaments = getTournaments();
  const hasSample = tournaments.some((tn) => tn.sample);

  const rows: LbRow[] = entries.map((e) => ({
    rank: e.rank,
    id: e.playerId,
    name: e.player?.name ?? e.playerId,
    clan: e.player?.clan ?? null,
    points: e.points,
    events: e.events,
    wins: e.wins,
    top3: e.top3,
    avgPlace: e.avgPlace,
  }));

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="micro-label mb-2">{t.site.tagline}</div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          POWER <span className="gradient-text">RANKING</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{t.leaderboard.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="chip">🏆 {tournaments.length} {t.common.tournaments.toLowerCase()}</span>
          <span className="chip">👥 {rows.length} {t.common.players.toLowerCase()}</span>
          {hasSample ? <SampleBadge label={t.common.sampleBadge} /> : null}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="card mx-auto max-w-lg p-10 text-center text-sm text-muted">{t.leaderboard.empty}</div>
      ) : (
        <>
          <Podium entries={entries.slice(0, 3)} />
          <div className="mt-8">
            <LeaderboardView rows={rows} />
          </div>
        </>
      )}
    </div>
  );
}
import SearchPlayer from '../components/Search';
export default function Home() { return <main className="p-8"><h1 className="text-3xl text-amber-900">Fortnite Tracker Style</h1><SearchPlayer /></main> }
