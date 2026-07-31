"use client";

import { useEffect, useState } from "react";
import { getLiveStats, type OfLiveStats } from "@/lib/openfront";
import { SectionTitle, StatCard } from "@/components/ui";
import { formatDateTime, formatPct } from "@/lib/format";
import { getDict, tpl } from "@/i18n";

const t = getDict();

function ResultBadge({ result }: { result: string }) {
  if (result === "victory") return <span className="result-win font-bold">✔ {t.player.victory}</span>;
  if (result === "defeat") return <span className="result-loss font-bold">✖ {t.player.defeat}</span>;
  return <span className="text-muted">{t.player.incomplete}</span>;
}

/**
 * Bloc stats live OpenFront — récupération côté navigateur (compatible avec
 * l'export statique GitHub Pages ; si l'API bloque la requête, on affiche
 * simplement "indisponible").
 */
export default function LiveStats({ openfrontId }: { openfrontId: string | null }) {
  const [stats, setStats] = useState<OfLiveStats | "loading">("loading");

  useEffect(() => {
    if (!openfrontId) {
      setStats({ ok: false, error: "not_linked", username: null, clanTag: null, recentGames: [], sampleSize: 0, wins: 0, losses: 0, winrate: null });
      return;
    }
    let cancelled = false;
    setStats("loading");
    getLiveStats(openfrontId)
      .then((s) => { if (!cancelled) setStats(s); })
      .catch(() => { if (!cancelled) setStats({ ok: false, username: null, clanTag: null, recentGames: [], sampleSize: 0, wins: 0, losses: 0, winrate: null }); });
    return () => { cancelled = true; };
  }, [openfrontId]);

  return (
    <section className="mt-10">
      <SectionTitle title={t.player.liveTitle} subtitle={t.player.liveSubtitle} />

      {stats === "loading" ? (
        <div className="card animate-pulse p-6 text-sm text-muted">⏳ {t.player.liveLoading}</div>
      ) : stats.error === "not_linked" ? (
        <div className="card p-6 text-sm text-muted">🔗 {t.player.liveNotLinked}</div>
      ) : !stats.ok ? (
        <div className="card p-6 text-sm text-muted">📡 {t.player.liveUnavailable}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label={t.player.liveWinrate}
              value={stats.winrate == null ? "—" : formatPct(stats.winrate)}
              sub={tpl(t.player.liveSample, { n: stats.sampleSize })}
              accent
            />
            <StatCard label={t.common.wins} value={stats.wins} />
            <StatCard label={t.player.defeat + "s"} value={stats.losses} />
            <StatCard label="OpenFront" value={stats.username ?? "—"} sub={stats.clanTag ? `[${stats.clanTag}]` : undefined} />
          </div>

          {stats.recentGames.length > 0 ? (
            <div className="card mt-4 overflow-hidden">
              <div className="micro-label border-b border-line/70 px-4 py-3">{t.player.liveRecent}</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <tbody>
                    {stats.recentGames.map((g) => (
                      <tr key={g.gameId} className="lb-row">
                        <td className="px-4 py-2.5"><ResultBadge result={g.result} /></td>
                        <td className="px-4 py-2.5 text-muted">{g.mode ?? "—"}</td>
                        <td className="hidden px-4 py-2.5 text-muted sm:table-cell">{g.map ?? "—"}</td>
                        <td className="hidden px-4 py-2.5 text-right text-muted md:table-cell">
                          {g.start ? formatDateTime(g.start) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
