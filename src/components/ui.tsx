"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { useI18n } from "@/i18n/provider";

const PLAYER_AVATAR = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/player-avatar.svg`;

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
    sm: "h-7 w-7",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  } as const;
  return (
    <img
      src={PLAYER_AVATAR}
      alt={`Avatar de ${name}`}
      className={`player-avatar shrink-0 rounded-lg object-cover ${sizes[size]}`}
    />
  );
}

export function SampleBadge({ label }: { label: string }) {
  return (
    <span className="chip border-amber-400/40 bg-amber-400/10 text-amber-300">
      <Icon name="warning" size="xs" /> {label}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    major: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
    standard: "border-cyan2/40 bg-cyan2/10 text-cyan2",
    minor: "border-line bg-white/5 text-muted",
  };
  return (
    <span className={`chip ${styles[tier] ?? styles.minor}`}>
      {tier === "major" ? <Icon name="starFilled" size="xs" /> : null}
      {t.tiers[tier] ?? tier}
    </span>
  );
}

/** Icône associée à chaque format de tournoi. */
const FORMAT_ICONS: Record<string, IconName> = {
  bracket: "swords",
  minor: "target",
  ffa: "globe",
};

export function FormatBadge({ format, label }: { format: string; label: string }) {
  return (
    <span className="chip border-accent/40 bg-accent/10 text-accent-strong">
      <Icon name={FORMAT_ICONS[format] ?? "globe"} size="xs" /> {label}
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
