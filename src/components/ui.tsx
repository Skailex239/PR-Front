import type { ReactNode } from "react";
import { initials } from "@/lib/format";

/** Petits composants UI partagés (server-safe). */

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="micro-label">{label}</div>
      <div className={`num mt-2 text-2xl font-extrabold sm:text-3xl ${accent ? "gradient-text" : ""}`}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-7 w-7 text-[0.6rem]",
    md: "h-10 w-10 text-xs",
    lg: "h-16 w-16 text-lg",
    xl: "h-20 w-20 text-2xl",
  } as const;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-line font-extrabold tracking-wide text-text/90 ${sizes[size]}`}
      style={{ background: "linear-gradient(135deg, rgba(124,92,255,.35), rgba(0,212,255,.25))" }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function SampleBadge({ label }: { label: string }) {
  return (
    <span className="chip border-amber-400/40 bg-amber-400/10 text-amber-300">
      ⚠ {label}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    major: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
    standard: "border-cyan2/40 bg-cyan2/10 text-cyan2",
    minor: "border-line bg-white/5 text-muted",
  };
  const text: Record<string, string> = { major: "★ Major", standard: "Standard", minor: "Mineur" };
  return <span className={`chip ${styles[tier] ?? styles.minor}`}>{text[tier] ?? tier}</span>;
}

export function FormatBadge({ format, label }: { format: string; label: string }) {
  return (
    <span className="chip border-accent/40 bg-accent/10 text-accent-strong">
      {format === "bracket" ? "⚔" : "🌐"} {label}
    </span>
  );
}

export function PlaceNumber({ place }: { place: number | null }) {
  if (place == null) return <span className="text-muted">—</span>;
  const cls = place === 1 ? "rank-1" : place === 2 ? "rank-2" : place === 3 ? "rank-3" : "text-text";
  return <span className={`num font-extrabold ${cls}`}>#{place}</span>;
}

export function RankCircle({ rank, size = "md" }: { rank: number; size?: "md" | "lg" }) {
  const medal = rank === 1 ? "rank-1 border-gold/60" : rank === 2 ? "rank-2 border-silver/60" : rank === 3 ? "rank-3 border-bronze/60" : "text-muted border-line";
  const sz = size === "lg" ? "h-12 w-12 text-lg" : "h-8 w-8 text-sm";
  return (
    <div className={`num flex shrink-0 items-center justify-center rounded-full border bg-white/[0.03] font-extrabold ${sz} ${medal}`}>
      {rank}
    </div>
  );
}
