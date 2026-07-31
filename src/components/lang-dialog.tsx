"use client";

import { useEffect, useRef } from "react";
import { LANGS, type Lang } from "@/i18n";
import { useI18n } from "@/i18n/provider";

/**
 * Choix de la langue à la première visite.
 *
 * Ne s'affiche que si aucune préférence n'est enregistrée : dès que
 * l'utilisateur a choisi (ici ou via la bascule de la barre du haut), la
 * fenêtre ne réapparaît plus. Le rendu est conditionné à `langReady` pour
 * éviter tout affichage furtif chez un visiteur qui a déjà choisi.
 */
export default function LangDialog() {
  const { t, lang, langReady, hasLangPreference, setLang, suggestedLang } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = langReady && !hasLangPreference;

  // Fermeture au clavier + focus initial sur le panneau (accessibilité).
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLang(lang);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, lang, setLang]);

  // Empêche le défilement de l'arrière-plan tant que le choix n'est pas fait.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const labels: Record<Lang, { full: string; sub: string }> = {
    fr: { full: t.lang.frFull, sub: "Français" },
    en: { full: t.lang.enFull, sub: "English" },
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-dialog-title"
    >
      <div className="absolute inset-0 bg-[#0d1016]/70 backdrop-blur-sm" aria-hidden />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="lang-dialog relative w-full max-w-[380px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_24px_60px_rgba(8,10,16,.35)] outline-none"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#d76511] via-[#ee8b2e] to-[#f6c16e]" />

        <div className="px-6 pb-6 pt-6 text-center">
          <h2 id="lang-dialog-title" className="text-base font-black tracking-tight">
            {t.lang.dialogTitle}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[300px] text-xs leading-relaxed text-muted">
            {t.lang.dialogSubtitle}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {LANGS.map((code) => {
              const suggested = code === suggestedLang;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`group relative flex flex-col items-center gap-1 rounded-lg border px-3 py-4 transition-all ${
                    suggested
                      ? "border-accent/60 bg-accent/[0.06] hover:border-accent hover:bg-accent/10"
                      : "border-line bg-white hover:border-accent/40 hover:bg-accent/[0.04]"
                  }`}
                >
                  <span className="text-lg font-black uppercase tracking-wide text-accent-strong">
                    {code === "fr" ? t.lang.fr : t.lang.en}
                  </span>
                  <span className="text-[11px] font-bold text-text">{labels[code].full}</span>
                  {suggested ? (
                    <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wide text-accent-strong">
                      {t.lang.suggested}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[10px] text-muted">{t.lang.dialogHint}</p>
        </div>
      </div>
    </div>
  );
}
