"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  getDict,
  isLang,
  localeOf,
  tpl,
  type Dict,
  type Lang,
} from "@/i18n";

interface I18nValue {
  lang: Lang;
  t: Dict;
  locale: string;
  setLang: (lang: Lang) => void;
  /** Interpolation : `fmt(t.player.liveSample, { n: 20 })`. */
  fmt: (template: string, vars: Record<string, string | number>) => string;
  /**
   * `false` tant que la préférence stockée n'a pas été relue (premier rendu).
   * Permet de ne rien afficher qui dépende du choix avant de le connaître.
   */
  langReady: boolean;
  /** L'utilisateur a-t-il déjà choisi une langue ? */
  hasLangPreference: boolean;
  /** Langue déduite du navigateur, proposée par défaut dans la fenêtre de choix. */
  suggestedLang: Lang;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Langue suggérée d'après les préférences du navigateur. */
function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of candidates) {
    const base = raw?.toLowerCase().split("-")[0];
    if (base === "fr" || base === "en") return base;
  }
  return DEFAULT_LANG;
}

/**
 * Fournit la langue courante à toute l'application.
 *
 * Le rendu serveur (et donc le HTML statique de GitHub Pages) utilise toujours
 * `DEFAULT_LANG` : c'est ce qui garantit que le markup initial est identique
 * côté serveur et côté client, sans erreur d'hydratation. Le choix éventuel de
 * l'utilisateur est relu depuis `localStorage` juste après le montage, puis
 * appliqué — le basculement est alors instantané et persistant.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  const [langReady, setLangReady] = useState(false);
  const [hasLangPreference, setHasLangPreference] = useState(false);
  const [suggestedLang, setSuggestedLang] = useState<Lang>(DEFAULT_LANG);

  // Relecture du choix persisté après l'hydratation (jamais pendant le rendu
  // initial, sinon le HTML serveur et client divergeraient).
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      /* localStorage indisponible (mode privé strict) : on garde le défaut. */
    }
    if (isLang(stored)) {
      setHasLangPreference(true);
      setLangState(stored);
    } else {
      setSuggestedLang(detectBrowserLang());
    }
    setLangReady(true);
  }, []);

  // Garde l'attribut lang du <html> synchronisé (accessibilité, moteurs, césure).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setHasLangPreference(true);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* non bloquant : la langue reste appliquée pour la session. */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      t: getDict(lang),
      locale: localeOf(lang),
      setLang,
      fmt: tpl,
      langReady,
      hasLangPreference,
      suggestedLang,
    }),
    [lang, setLang, langReady, hasLangPreference, suggestedLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Accès à la langue courante depuis un composant client. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans un <I18nProvider>.");
  return ctx;
}
