"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatPoints } from "@/lib/format";
import type { SearchIndexItem } from "@/lib/data";
import { normalizeQuery, matchesQuery } from "@/lib/search";
import { useI18n } from "@/i18n/provider";

/**
 * Barre de recherche joueurs — façon Fortnite Tracker : saisie → dropdown de
 * résultats (avatar, rang, points) → clic ou Entrée ouvre le profil.
 *
 * `variant="hero"` : grande barre centrale de la page d'accueil.
 * `variant="nav"`  : version compacte dans la navbar.
 */
export default function SearchBox({
  items,
  variant = "nav",
}: {
  items: SearchIndexItem[];
  variant?: "hero" | "nav";
}) {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const query = useMemo(() => normalizeQuery(q), [q]);
  const { needle, isId } = query;

  const results = useMemo(() => {
    if (!needle) return [];
    return items.filter((i) => matchesQuery(i, query)).slice(0, variant === "hero" ? 8 : 6);
  }, [items, query, variant]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(id: string) {
    setOpen(false);
    setQ("");
    router.push(`/players/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const isHero = variant === "hero";

  return (
    <div ref={rootRef} className={`relative ${isHero ? "w-full" : "w-full"}`}>
      <div
        className={
          isHero
            ? "flex items-center gap-3 rounded-md bg-white px-5 py-4 shadow-[0_10px_30px_rgba(8,10,16,.28)]"
            : "flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 shadow-sm"
        }
      >
        {isHero ? null : <Icon name="search" size="sm" className="text-muted" />}
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={isHero ? t.search.heroPlaceholder : t.search.navPlaceholder}
          className={`w-full bg-transparent text-text placeholder:text-[#9aa2ae] focus:outline-none ${isHero ? "text-[15px]" : "text-xs"}`}
        />
        {isHero ? (
          <button
            type="button"
            onClick={() => results[active] && go(results[active].id)}
            aria-label={t.search.heroCta}
            title={t.search.heroCta}
            className="shrink-0 rounded-md p-1 text-[#5b6472] transition-colors hover:text-accent-strong"
          >
            <Icon name="arrowRight" size="md" />
          </button>
        ) : null}
      </div>

      {open && needle ? (
        <div className="card absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted">{t.search.noResults}</div>
          ) : (
            <>
              {results.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    i === active ? "bg-accent/10" : "hover:bg-accent/5"
                  }`}
                >
                  <span className="num w-8 shrink-0 text-xs font-extrabold text-muted">#{r.rank}</span>
                  <Avatar name={r.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {r.clan ? <span className="mr-1 text-xs font-semibold text-muted">[{r.clan}]</span> : null}
                      {r.name}
                    </span>
                    {isId ? (
                      <span className="num block truncate text-[10px] text-muted">{r.id}</span>
                    ) : null}
                  </span>
                  <span className="num shrink-0 text-xs font-extrabold gradient-text">{formatPoints(r.points, locale)}</span>
                </button>
              ))}
              {isId ? (
                <div className="px-2.5 pb-1 pt-2 text-[0.65rem] text-muted">{t.search.idHint}</div>
              ) : isHero ? (
                <div className="px-2.5 pb-1 pt-2 text-[0.65rem] text-muted">{t.search.resultsHint}</div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
