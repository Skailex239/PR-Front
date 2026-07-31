"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, RankCircle } from "@/components/ui";
import { formatPoints } from "@/lib/format";
import { getDict } from "@/i18n";

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

const t = getDict();

export default function LeaderboardView({ rows }: { rows: LbRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.id} ${r.clan ?? ""}`.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-black tracking-wide">CLASSEMENT GÉNÉRAL</h2>
        <div className="relative w-full sm:max-w-[240px]">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.common.search}
            className="w-full rounded-md border border-line bg-panel py-2 pl-9 pr-3 text-xs text-text placeholder:text-muted focus:border-accent/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line/70 text-left">
              <th className="micro-label px-4 py-3 w-14">#</th>
              <th className="micro-label px-4 py-3">{t.leaderboard.colPlayer}</th>
              <th className="micro-label px-4 py-3 text-right">{t.leaderboard.colPr}</th>
              <th className="micro-label px-4 py-3 text-right">{t.leaderboard.colEvents}</th>
              <th className="micro-label px-4 py-3 text-right">{t.leaderboard.colWins}</th>
              <th className="micro-label hidden px-4 py-3 text-right md:table-cell">{t.leaderboard.colTop3}</th>
              <th className="micro-label hidden px-4 py-3 text-right md:table-cell">{t.leaderboard.colAvgPlace}</th>
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
                      <div className="truncate font-bold group-hover:text-accent-strong group-hover:underline">
                        {r.clan ? <span className="mr-1.5 text-xs font-semibold text-muted">[{r.clan}]</span> : null}
                        {r.name}
                      </div>
                      <div className="text-[0.65rem] text-muted">{r.id}</div>
                    </div>
                  </Link>
                </td>
                <td className="num px-4 py-3 text-right text-base font-extrabold gradient-text">
                  {formatPoints(r.points)}
                </td>
                <td className="num px-4 py-3 text-right text-muted">{r.events}</td>
                <td className="num px-4 py-3 text-right text-muted">{r.wins}</td>
                <td className="num hidden px-4 py-3 text-right text-muted md:table-cell">{r.top3}</td>
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
