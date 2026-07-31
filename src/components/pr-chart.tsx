"use client";

import { useMemo, useRef, useState } from "react";
import { formatDateShort, formatPoints } from "@/lib/format";
import { useI18n } from "@/i18n/provider";

export interface PRChartPoint {
  slug: string;
  name: string;
  date: string;
  /** Points gagnés sur ce tournoi. */
  gained: number;
  /** Total PR cumulé après ce tournoi. */
  cumulative: number;
  bestPlace: number | null;
}

const W = 720;
const H = 190;
const PAD = { left: 12, right: 14, top: 16, bottom: 38 };

/**
 * Courbe d'évolution du Power Ranking, avec lecture au survol.
 *
 * Le survol (souris, tactile) ou les flèches du clavier sélectionnent le
 * tournoi le plus proche et affichent son détail : total PR cumulé, points
 * gagnés et placement. Le SVG s'étire en largeur, donc on convertit la
 * position du pointeur en coordonnées du viewBox plutôt que d'utiliser des
 * pixels écran — sinon la détection se décalerait sur petits écrans.
 */
export default function PRChart({ points }: { points: PRChartPoint[] }) {
  const { t, locale } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const geom = useMemo(() => {
    const max = Math.max(...points.map((p) => p.cumulative), 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) =>
      points.length <= 1 ? W / 2 : PAD.left + (i / (points.length - 1)) * innerW;
    const y = (v: number) => PAD.top + (1 - v / max) * innerH;
    const coords = points.map((p, i) => ({ x: x(i), y: y(p.cumulative) }));
    const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
    const area = coords.length
      ? `${coords[0].x},${H - PAD.bottom} ${line} ${coords[coords.length - 1].x},${H - PAD.bottom}`
      : "";
    return { coords, line, area, baseline: H - PAD.bottom };
  }, [points]);

  /** Index du point le plus proche de l'abscisse du pointeur. */
  function nearestIndex(clientX: number): number | null {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    // Position écran -> coordonnées du viewBox (le SVG est responsive).
    const vx = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    geom.coords.forEach((c, i) => {
      const d = Math.abs(c.x - vx);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
    if (clientX == null) return;
    setActive(nearestIndex(clientX));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (points.length === 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((prev) => {
        const cur = prev ?? -1;
        const next = e.key === "ArrowRight" ? cur + 1 : cur - 1;
        return Math.max(0, Math.min(points.length - 1, next));
      });
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  if (points.length === 0) {
    return (
      <div className="min-w-0">
        <ChartHeader />
        <div className="flex h-[190px] items-center justify-center text-xs text-muted">
          {t.player.chartEmpty}
        </div>
      </div>
    );
  }

  const cur = active != null ? points[active] : null;
  const curCoord = active != null ? geom.coords[active] : null;

  // Le panneau suit le point mais reste dans le cadre.
  const tipW = 190;
  const tipLeftPct = curCoord ? (curCoord.x / W) * 100 : 0;

  return (
    <div className="min-w-0">
      <ChartHeader />

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-[190px] w-full touch-none overflow-visible outline-none"
          role="img"
          aria-label={t.player.chartAria}
          tabIndex={0}
          onMouseMove={onMove}
          onMouseLeave={() => setActive(null)}
          onTouchStart={onMove}
          onTouchMove={onMove}
          onTouchEnd={() => setActive(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          <defs>
            <linearGradient id="pr-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e8781d" stopOpacity=".28" />
              <stop offset="1" stopColor="#e8781d" stopOpacity=".02" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((p) => (
            <line
              key={p}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + p * (H - PAD.top - PAD.bottom)}
              y2={PAD.top + p * (H - PAD.top - PAD.bottom)}
              stroke="#e8e2dc"
              strokeWidth="1"
            />
          ))}

          <polygon className="pr-chart-area" points={geom.area} fill="url(#pr-area)" />
          <polyline
            className="pr-chart-line"
            points={geom.line}
            fill="none"
            stroke="#e8781d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Repère vertical du point survolé */}
          {curCoord ? (
            <line
              x1={curCoord.x}
              x2={curCoord.x}
              y1={PAD.top - 4}
              y2={geom.baseline}
              stroke="#e8781d"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity=".55"
            />
          ) : null}

          {geom.coords.map((c, i) => {
            const isActive = i === active;
            return (
              <g
                key={points[i].slug}
                className="pr-chart-point"
                style={{ animationDelay: `${700 + i * 110}ms` }}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isActive ? 6.5 : 4}
                  fill="#fff"
                  stroke="#e8781d"
                  strokeWidth={isActive ? 3.5 : 2.5}
                />
                <text
                  x={c.x}
                  y={H - 12}
                  textAnchor="middle"
                  fill={isActive ? "#c95d0c" : "#8b837d"}
                  fontSize="10"
                  fontWeight={isActive ? 800 : 400}
                >
                  {formatDateShort(points[i].date, locale).slice(0, 5)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Panneau de lecture — en HTML plutôt qu'en SVG pour hériter des
            styles du thème et rester lisible à toute taille. */}
        {cur ? (
          <div
            className="pointer-events-none absolute top-0 z-20 w-[190px] rounded-lg border border-line bg-white/97 p-3 shadow-lg backdrop-blur"
            style={{
              left: `clamp(0px, calc(${tipLeftPct}% - ${tipW / 2}px), calc(100% - ${tipW}px))`,
            }}
          >
            <div className="truncate text-[11px] font-black text-text">{cur.name}</div>
            <div className="mt-0.5 text-[10px] text-muted">
              {formatDateShort(cur.date, locale)}
              {cur.bestPlace != null ? ` · #${cur.bestPlace}` : ""}
            </div>
            <div className="mt-2 flex items-end justify-between gap-2 border-t border-line/70 pt-2">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-muted">
                  {t.player.chartTotal}
                </div>
                <div className="num text-base font-black leading-none text-accent-strong">
                  {formatPoints(cur.cumulative, locale)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold uppercase tracking-wide text-muted">
                  {t.player.chartGained}
                </div>
                <div className="num text-sm font-extrabold leading-none text-[#1e8e5a]">
                  +{formatPoints(cur.gained, locale)}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-1 text-[10px] text-muted">{t.player.chartHint}</p>
    </div>
  );

  function ChartHeader() {
    return (
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide">{t.player.chartTitle}</div>
          <div className="mt-0.5 text-[10px] text-muted">{t.player.chartSubtitle}</div>
        </div>
        <div className="rounded-md bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-accent-strong">
          {t.player.chartBadge}
        </div>
      </div>
    );
  }
}
