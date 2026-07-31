"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "@/components/search-box";
import type { SearchIndexItem } from "@/lib/data";
import { getDict } from "@/i18n";

const t = getDict();

export default function Navbar({ searchIndex }: { searchIndex: SearchIndexItem[] }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: t.nav.leaderboard, exact: true },
    { href: "/tournaments", label: t.nav.tournaments, exact: false },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg font-black text-white"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-gold))" }}
          >
            PR
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-base font-extrabold tracking-tight">
              PR-<span className="gradient-text">FRONT</span>
            </div>
            <div className="text-[0.65rem] text-muted">OpenFront.io Power Ranking</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-accent/15 text-accent-strong" : "text-muted hover:bg-accent/5 hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden sm:block">
          <SearchBox items={searchIndex} variant="nav" />
        </div>

        <a
          href="https://openfront.io"
          target="_blank"
          rel="noreferrer"
          className="hidden shrink-0 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent/60 hover:text-accent-strong md:block"
        >
          ▶ Jouer
        </a>
      </div>
    </header>
  );
}
