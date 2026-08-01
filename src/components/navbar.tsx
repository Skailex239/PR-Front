"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "@/components/search-box";
import { Icon, type IconName } from "@/components/icons";
import LangSwitch from "@/components/lang-switch";
import type { SearchIndexItem } from "@/lib/data";
import { useI18n } from "@/i18n/provider";

const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pr-front-logo.svg`;

type NavKey = "home" | "leaderboard" | "tournaments";

const primary: { href: string; key: NavKey; icon: IconName; exact?: boolean }[] = [
  { href: "/", key: "home", icon: "home", exact: true },
  { href: "/ranking", key: "leaderboard", icon: "trophy" },
  { href: "/tournaments", key: "tournaments", icon: "shield" },
];

/** Liste de liens partagée entre la sidebar desktop et le tiroir mobile. */
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  return (
    <>
      {primary.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
          >
            <Icon name={item.icon} size="md" />
            <span>{t.nav[item.key]}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function Navbar({ searchIndex }: { searchIndex: SearchIndexItem[] }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // Ferme le tiroir après navigation (changement de route).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Ferme sur Échap + verrouille le scroll du body quand le tiroir est ouvert.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[246px] flex-col bg-sidebar text-white lg:flex">
        <Link href="/" className="flex h-[98px] items-center px-7" aria-label={t.nav.homeAria}>
          <img src={LOGO} alt="PR-Front" className="brand-logo h-16 w-16 object-contain" />
        </Link>

        <nav className="mt-1 space-y-1">
          <NavLinks />
        </nav>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 h-[60px] border-b border-line bg-white/95 backdrop-blur lg:left-[246px]">
        <div className="flex h-full items-center gap-4 px-5 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t.nav.menu}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-beige lg:hidden"
          >
            <Icon name="menu" size="lg" />
          </button>
          <Link href="/" className="lg:hidden" aria-label={t.nav.homeAria}>
            <img src={LOGO} alt="PR-Front" className="brand-logo h-9 w-9 object-contain" />
          </Link>
          <div className="ml-auto hidden w-[260px] sm:block">
            <SearchBox items={searchIndex} variant="nav" />
          </div>
          <LangSwitch className="ml-auto sm:ml-0" />
          <a
            href="https://openfront.io"
            target="_blank"
            rel="noreferrer"
            className="play-button"
          >
            <Icon name="play" size="xs" /> {t.nav.play}
          </a>
        </div>
      </header>

      {/* ---------- Tiroir de navigation mobile ---------- */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Panneau */}
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.homeAria}
          className={`absolute inset-y-0 left-0 flex w-[280px] flex-col bg-sidebar text-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[60px] items-center justify-between pl-7 pr-3">
            <Link href="/" onClick={() => setOpen(false)} aria-label={t.nav.homeAria}>
              <img src={LOGO} alt="PR-Front" className="brand-logo h-10 w-10 object-contain" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.nav.closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:bg-white/10"
            >
              <Icon name="close" size="lg" />
            </button>
          </div>

          <div className="px-2 pb-3">
            <SearchBox items={searchIndex} variant="nav" />
          </div>

          <nav className="mt-1 space-y-1 pb-6">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      </div>
    </>
  );
}
