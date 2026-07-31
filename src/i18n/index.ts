import fr, { type Dict } from "./fr";
import en from "./en";

export type Lang = "fr" | "en";

const dicts: Record<Lang, Dict> = { fr, en };

/** Langue par défaut du site (future bascule : lire un cookie/paramètre ici). */
export const DEFAULT_LANG: Lang = "fr";

export function getDict(lang: Lang = DEFAULT_LANG): Dict {
  return dicts[lang] ?? fr;
}

/** Petit helper pour les chaînes à trous : "sur les {n} dernières parties". */
export function tpl(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export { fr, en };
export type { Dict };
