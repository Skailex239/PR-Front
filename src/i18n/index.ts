import fr, { type Dict } from "./fr.ts";
import en from "./en.ts";

export type Lang = "fr" | "en";

const dicts: Record<Lang, Dict> = { fr, en };

/** Langue par défaut du site (rendu serveur / premier paint). */
export const DEFAULT_LANG: Lang = "fr";

export const LANGS: Lang[] = ["fr", "en"];

/** Clé de persistance du choix de langue (localStorage + cookie). */
export const LANG_STORAGE_KEY = "pr-front-lang";

export function isLang(v: unknown): v is Lang {
  return v === "fr" || v === "en";
}

export function getDict(lang: Lang = DEFAULT_LANG): Dict {
  return dicts[lang] ?? fr;
}

/** Locale Intl associée à une langue (dates, nombres). */
export function localeOf(lang: Lang): string {
  return lang === "en" ? "en-GB" : "fr-FR";
}

/** Petit helper pour les chaînes à trous : "sur les {n} dernières parties". */
export function tpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export { fr, en };
export type { Dict };
