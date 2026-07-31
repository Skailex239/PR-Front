"use client";

import { LANGS, type Lang } from "@/i18n";
import { useI18n } from "@/i18n/provider";

/**
 * Bascule FR / EN — segmented control compact pour la barre du haut.
 * Le choix est mémorisé (localStorage) et appliqué à toute l'interface.
 */
export default function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className={`inline-flex items-center rounded-md border border-line bg-panel p-0.5 ${className}`}
      role="group"
      aria-label={t.lang.label}
    >
      {LANGS.map((code: Lang) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            title={code === "fr" ? t.lang.frFull : t.lang.enFull}
            className={`rounded px-2 py-1 text-[11px] font-extrabold uppercase transition-colors ${
              active
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:bg-accent/10 hover:text-accent-strong"
            }`}
          >
            {code === "fr" ? t.lang.fr : t.lang.en}
          </button>
        );
      })}
    </div>
  );
}
