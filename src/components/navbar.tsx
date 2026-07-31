"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDict } from "@/i18n";

const t = getDict();

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: t.nav.leaderboard, exact: true },
    { href: "/tournaments", label: t.nav.tournaments, exact: false },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg font-black text-white"
            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-cyan2))" }}
          >
            PR
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">
              PR-<span className="gradient-text">FRONT</span>
            </div>
            <div className="hidden text-[0.65rem] text-muted sm:block">OpenFront.io Power Ranking</div>
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
                  active ? "bg-accent/15 text-violet-300" : "text-muted hover:bg-white/5 hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href="https://openfront.io"
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden rounded-lg border border-line px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-cyan2/50 hover:text-cyan2 sm:block"
          >
            ▶ Jouer
          </a>
        </nav>
      </div>
    </header>
  );
}
