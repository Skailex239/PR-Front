"use client";

import { useEffect, useState } from "react";
import { SectionTitle, FormatBadge, TierBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useI18n } from "@/i18n/provider";
import PageContainer from "@/components/page-container";
import type { CalendarEvent } from "@/lib/types";

/** Fuseau utilisé quand aucun fuseau n'est précisé dans data/calendar.json. */
const DEFAULT_TIME_ZONE = "Europe/Paris";

type CalDict = ReturnType<typeof useI18n>["t"]["calendar"];

function safeTimeZone(timeZone?: string): string {
  if (!timeZone) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function hasExplicitTimeZone(iso: string): boolean {
  return /(?:z|[+-]\d{2}:?\d{2})$/i.test(iso);
}

function getLocalDateParts(iso: string) {
  const match = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] ?? 0),
    minute: Number(match[5] ?? 0),
    second: Number(match[6] ?? 0),
  };
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>;
}

function partsToUtcMs(parts: ReturnType<typeof getLocalDateParts>): number {
  if (!parts) return Number.NaN;
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

/** Convertit une date locale d'un fuseau IANA en instant réel. */
function zonedTimeToDate(iso: string, timeZone: string): Date | null {
  const wanted = getLocalDateParts(iso);
  if (!wanted) return null;

  try {
    const wantedUtc = partsToUtcMs(wanted);
    let candidate = new Date(wantedUtc);

    // Ajuste l'instant jusqu'à ce que ses composants dans `timeZone`
    // correspondent aux composants locaux demandés.
    for (let i = 0; i < 3; i += 1) {
      const current = getZonedParts(candidate, timeZone);
      const currentUtc = Date.UTC(
        current.year,
        current.month - 1,
        current.day,
        current.hour,
        current.minute,
        current.second,
      );
      candidate = new Date(candidate.getTime() + (wantedUtc - currentUtc));
    }

    return Number.isNaN(candidate.getTime()) ? null : candidate;
  } catch {
    return null;
  }
}

function toDate(iso?: string, timeZone = DEFAULT_TIME_ZONE): Date | null {
  if (!iso) return null;
  const d = hasExplicitTimeZone(iso) ? new Date(iso) : zonedTimeToDate(iso, timeZone);
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

function fmtFull(iso: string, locale: string, timeZone: string): string {
  const d = toDate(iso, timeZone);
  if (!d) return iso;
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(d);
}

function fmtDayMonth(iso: string | undefined, locale: string, timeZone: string): { day: string; month: string } {
  const d = toDate(iso, timeZone);
  if (!d) return { day: "—", month: "" };
  return {
    day: new Intl.DateTimeFormat(locale, { day: "2-digit", timeZone }).format(d),
    month: new Intl.DateTimeFormat(locale, { month: "short", timeZone }).format(d),
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** Compte à rebours live vers un instant donné (rendu uniquement côté client). */
function Countdown({ target, c }: { target: Date; c: CalDict }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  // Avant montage : on n'affiche rien pour éviter toute divergence SSR/client.
  if (now === null) return null;
  const diff = target.getTime() - now;
  if (diff <= 0) return <span className="font-extrabold text-accent-strong">{c.live}</span>;
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return (
    <span className="num font-extrabold text-accent-strong">
      {days > 0 ? `${days}${c.day} ` : ""}
      {pad(hours)}
      {c.hour} {pad(mins)}
      {c.minute} {pad(secs)}
      {c.second}
    </span>
  );
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const { t, locale } = useI18n();
  const c = t.calendar;

  return (
    <PageContainer>
      <SectionTitle title={c.title} subtitle={c.subtitle} />
      {events.length === 0 ? (
        <p className="text-sm text-muted">{c.empty}</p>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => {
            const timeZone = safeTimeZone(ev.timeZone);
            const isSummerFfa = ev.series === "2026 Summer FFA";
            const start = toDate(ev.startsAt ?? ev.date, timeZone);
            const close = toDate(ev.registrationClosesAt, timeZone);
            const { day, month } = fmtDayMonth(ev.startsAt ?? ev.date, locale, timeZone);
            return (
              <div
                key={ev.slug}
                className={`card relative flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch ${
                  isSummerFfa ? "summer-ffa-card" : ""
                }`}
              >
                {isSummerFfa ? <Icon name="radiation" className="summer-ffa-mark h-16 w-16" /> : null}
                {/* Bloc date */}
                <div
                  className={`flex w-full shrink-0 flex-row items-center gap-3 rounded-xl px-4 py-3 sm:w-28 sm:flex-col sm:justify-center sm:gap-0 sm:text-center ${
                    isSummerFfa ? "bg-white/10" : "bg-black/5"
                  }`}
                >
                  <div className="num text-3xl font-extrabold leading-none">{day}</div>
                  <div className="micro-label mt-0 sm:mt-1">{month}</div>
                </div>
                {/* Contenu */}
                <div className="relative flex-1">
                  {ev.series ? <div className="micro-label">{ev.series}</div> : null}
                  <div className="mt-1 text-lg font-extrabold tracking-tight">{ev.name}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <FormatBadge format={ev.format} label={t.formats[ev.format] ?? ev.format} />
                    <TierBadge tier={ev.tier} />
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <Icon name="hourglass" size="xs" />
                      <span>
                        <span className="font-semibold text-text">{c.startsIn} :</span>{" "}
                        {start ? <Countdown target={start} c={c} /> : null}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Icon name="calendar" size="xs" />
                      <span>
                        {c.starts} {ev.startsAt ? fmtFull(ev.startsAt, locale, timeZone) : ev.date}
                      </span>
                    </div>
                    {close ? (
                      <div className="flex items-center gap-2 text-muted">
                        <Icon name="link" size="xs" />
                        <span>
                          {c.registrationCloses} {fmtFull(ev.registrationClosesAt as string, locale, timeZone)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {ev.registrationUrl ? (
                    <a
                      href={ev.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="play-button mt-4 inline-flex"
                    >
                      <Icon name="link" size="xs" /> {c.register}
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
