import { getLeaderboard, getScoring, getSearchIndex, getTournaments } from "@/lib/data";
import { isFinalPhase } from "@/lib/pr";
import LeaderboardView, { type LbRow } from "@/components/leaderboard-view";
import Podium from "@/components/podium";
import Spotlight from "@/components/spotlight";
import SearchBox from "@/components/search-box";
import { SampleBadge } from "@/components/ui";
import { getDict } from "@/i18n";

const t = getDict();

export default function HomePage() {
  const entries = getLeaderboard();
  const tournaments = getTournaments();
  const scoring = getScoring();
  const searchIndex = getSearchIndex();
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

  const champion = entries[0] ?? null;
  const mostWins = [...entries].sort((a, b) => b.wins - a.wins)[0] ?? null;
  const latestTournament = tournaments[0] ?? null;
  const latestWinnerName = (() => {
    if (!latestTournament) return null;
    for (const phase of latestTournament.phases) {
      if (!isFinalPhase(scoring, latestTournament, phase.type)) continue;
      const win = phase.placements.find((p) => p.place === 1);
      if (win) return entries.find((e) => e.playerId === win.player)?.player?.name ?? win.player;
    }
    return null;
  })();

  return (
    <div>
      {/* En-tête du classement */}
      <div className="mb-7 grid items-end gap-6 md:grid-cols-[1fr_1.05fr]">
        <div>
          <div className="micro-label mb-2 text-accent-strong">{t.site.tagline}</div>
          <h1 className="text-[2.35rem] font-black leading-none tracking-[-0.045em] sm:text-[2.7rem]">
            POWER RANKING
          </h1>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted">{t.leaderboard.subtitle}</p>
        </div>
        <div>
          <SearchBox items={searchIndex} variant="hero" />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="chip">🏆 {tournaments.length} {t.common.tournaments.toLowerCase()}</span>
            <span className="chip">👥 {rows.length} {t.common.players.toLowerCase()}</span>
            {hasSample ? <SampleBadge label={t.common.sampleBadge} /> : null}
          </div>
        </div>
      </div>

      {/* Spotlight — façon Fortnite Tracker */}
      {entries.length > 0 ? (
        <div className="mb-8">
          <Spotlight
            champion={champion}
            mostWins={mostWins}
            latestTournament={latestTournament}
            latestWinnerName={latestWinnerName}
          />
        </div>
      ) : null}

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
