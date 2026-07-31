/**
 * Helpers d'affichage.
 *
 * Chaque fonction accepte une locale optionnelle (« fr-FR » par défaut) pour
 * suivre la langue choisie par l'utilisateur : séparateur de milliers, ordre
 * jour/mois et nom des mois changent entre FR et EN.
 */

const DEFAULT_LOCALE = "fr-FR";

function parseIso(iso: string): Date | null {
  // Une date seule (AAAA-MM-JJ) est interprétée à midi UTC pour éviter qu'un
  // fuseau négatif ne la fasse basculer sur la veille.
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatPoints(n: number, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDate(iso: string, locale: string = DEFAULT_LOCALE): string {
  const d = parseIso(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateShort(iso: string, locale: string = DEFAULT_LOCALE): string {
  const d = parseIso(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(iso: string, locale: string = DEFAULT_LOCALE): string {
  const d = parseIso(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPct(n: number, locale: string = DEFAULT_LOCALE): string {
  return `${n.toLocaleString(locale, { maximumFractionDigits: 1 })} %`;
}

export function initials(name: string): string {
  const clean = name.replace(/^\[[^\]]+\]\s*/, "").trim();
  const parts = clean.split(/[\s_-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : clean.slice(0, 2);
  return letters.toUpperCase();
}

/** #1, #2 … */
export function placeLabel(place: number | null): string {
  return place == null ? "—" : `#${place}`;
}
