"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, RankCircle } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatPoints } from "@/lib/format";
import { useI18n } from "@/i18n/provider";

export interface LbRow {
  rank: number;
  id: string;
  name: string;
  clan: string | null;
  points: number;
  events: number;
  wins: number;
  top3: number;
  avgPlace: number | null;
}

type FilterId = "all" | "recurring" | "top100" | "clan";

export default function LeaderboardView({ rows }: { rows: LbRow[] }) {
  const { t, locale, fmt } = useI18n();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const filters: { id: FilterId; label: string; hint?: string; count: number }[] = useMemo(
    () => [
      { id: "all", label: t.leaderboard.filterAll, count: rows.length },
      {
        id: "recurring",
        label: t.leaderboard.filterRecurring,
        hint: t.leaderboard.filterRecurringHint,
        count: rows.filter((r) => r.events >= 2).length,
      },
      {
        id: "top100",
        label: t.leaderboard.filterTop100,
        count: Math.min(100, rows.length),
      },
      {
        id: "clan",
        label: t.leaderboard.filterWithClan,
        count: rows.filter((r) => r.clan).length,
      },
    ],
    [rows, t],
  );

  const filtered = useMemo(() => {
    let out = rows;
    if (filter === "recurring") out = out.filter((r) => r.events >= 2);
    else if (filter === "top100") out = out.filter((r) => r.rank <= 100);
    else if (filter === "clan") out = out.filter((r) => r.clan);

    const needle = q.trim().toLowerCase();
    if (needle) {
      out = out.filter((r) => `${r.name} ${r.id} ${r.clan ?? ""}`.toLowerCase().includes(needle));
    }
    return out;
  }, [rows, q, filter]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-black uppercase tracking-wide">
          {t.leaderboard.generalTitle}
        </h2>
        <div className="relative w-full sm:max-w-[240px]">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.common.search}
            className="w-full rounded-md border border-line bg-panel py-2 pl-9 pr-3 text-xs text-text placeholder:text-muted focus:border-accent/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line/70 px-4 py-2.5">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              title={f.hint}
              aria-pressed={active}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                active
                  ? "border-accent/50 bg-accent/10 text-accent-strong"
                  : "border-line bg-panel text-muted hover:border-accent/30 hover:text-accent-strong"
              }`}
            >
              {f.label}
              <span className="num ml-1.5 opacity-60">{f.count}</span>
            </button>
          );
        })}
        <span className="num ml-auto text-[11px] text-muted">
          {fmt(t.leaderboard.filterCount, { shown: filtered.length, total: rows.length })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line/70 text-left">
              <th className="micro-label w-14 px-4 py-3">#</th>
              <th className="micro-label px-4 py-3">{t.leaderboard.colPlayer}</th>
              <th className="micro-label px-4 py-3 text-right">{t.leaderboard.colPr}</th>
              <th className="micro-label px-4 py-3 text-right">{t.leaderboard.colEvents}</th>
              <th className="micro-label px-4 py-3 text-right">{t.leaderboard.colWins}</th>
              <th className="micro-label hidden px-4 py-3 text-right md:table-cell">
                {t.leaderboard.colTop3}
              </th>
              <th className="micro-label hidden px-4 py-3 text-right md:table-cell">
                {t.leaderboard.colAvgPlace}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="lb-row">
                <td className="px-4 py-3">
                  <RankCircle rank={r.rank} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/players/${r.id}`} className="group flex items-center gap-3">
                    <Avatar name={r.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold group-hover:text-accent-strong group-hover:underline">
                          {r.clan ? (
                            <span className="mr-1.5 text-xs font-semibold text-muted">
                              [{r.clan}]
                            </span>
                          ) : null}
                          {r.name}
                        </span>
                        {r.events === 1 ? (
                          <span
                            title={t.leaderboard.newBadgeHint}
                            className="shrink-0 rounded border border-cyan2/40 bg-cyan2/10 px-1.5 py-px text-[9px] font-extrabold uppercase text-cyan2"
                          >
                            {t.leaderboard.newBadge}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[0.65rem] text-muted">{r.id}</div>
                    </div>
                  </Link>
                </td>
                <td className="num px-4 py-3 text-right text-base font-extrabold gradient-text">
                  {formatPoints(r.points, locale)}
                </td>
                <td className="num px-4 py-3 text-right text-muted">{r.events}</td>
                <td className="num px-4 py-3 text-right text-muted">{r.wins}</td>
                <td className="num hidden px-4 py-3 text-right text-muted md:table-cell">
                  {r.top3}
                </td>
                <td className="num hidden px-4 py-3 text-right text-muted md:table-cell">
                  {r.avgPlace == null ? "—" : `#${r.avgPlace.toFixed(1)}`}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                  {t.common.noResult}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
