"use client";

import SearchBox from "@/components/search-box";
import { Icon } from "@/components/icons";
import type { SearchIndexItem } from "@/lib/data";
import { useI18n } from "@/i18n/provider";

const HERO_BG = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/hero-bg.jpg`;

/**
 * Bandeau d'accueil — grand titre + barre de recherche, façon Fortnite Tracker.
 *
 * Le fond illustré est purement décoratif : il est posé en `background-image`
 * (et non en <img>) et surmonté d'un voile sombre, afin que le titre blanc
 * garde un contraste suffisant quelle que soit la zone de l'image.
 */
export default function Hero({
  items,
  tournamentCount,
  playerCount,
}: {
  items: SearchIndexItem[];
  tournamentCount: number;
  playerCount: number;
}) {
  const { t } = useI18n();

  return (
    <section className="hero-band relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
        aria-hidden
      />
      {/* Voile sombre : garantit la lisibilité du texte blanc par-dessus l'image. */}
      <div className="hero-veil absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto w-full max-w-[760px] px-5 py-14 text-center sm:px-8 sm:py-16">
        <p className="hero-kicker text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">
          {t.site.name} · {t.site.tagline}
        </p>

        <h1 className="hero-title mt-3 text-[1.9rem] font-black uppercase leading-[1.05] tracking-[-0.01em] text-white sm:text-[2.6rem]">
          {t.hero.title}
        </h1>

        <div className="hero-search mt-7 text-left">
          <SearchBox items={items} variant="hero" />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-white/75">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="trophy" size="xs" /> {tournamentCount}{" "}
            {t.common.tournaments.toLowerCase()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="users" size="xs" /> {playerCount} {t.common.players.toLowerCase()}
          </span>
        </div>
      </div>
    </section>
  );
}
