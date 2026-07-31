"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "@/components/search-box";
import { Icon, type IconName } from "@/components/icons";
import LangSwitch from "@/components/lang-switch";
import type { SearchIndexItem } from "@/lib/data";
import { useI18n } from "@/i18n/provider";

const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pr-front-logo.svg`;

type NavKey = "leaderboard" | "tournaments";
type FutureKey = "players" | "clans" | "matches" | "stats" | "history" | "favorites";

const primary: { href: string; key: NavKey; icon: IconName; exact?: boolean }[] = [
  { href: "/", key: "leaderboard", icon: "trophy", exact: true },
  { href: "/tournaments", key: "tournaments", icon: "shield" },
];
const future: { key: FutureKey; icon: IconName }[] = [
  { key: "players", icon: "users" },
  { key: "clans", icon: "flag" },
  { key: "matches", icon: "swords" },
  { key: "stats", icon: "chart" },
  { key: "history", icon: "history" },
  { key: "favorites", icon: "star" },
];

export default function Navbar({ searchIndex }: { searchIndex: SearchIndexItem[] }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[246px] flex-col bg-sidebar text-white lg:flex">
        <Link href="/" className="flex h-[98px] items-center px-7" aria-label={t.nav.home}>
          <img src={LOGO} alt="PR-Front" className="brand-logo h-16 w-16 object-contain" />
        </Link>

        <nav className="mt-1 space-y-1">
          {primary.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}><Icon name={item.icon} size="md" /><span>{t.nav[item.key]}</span></Link>;
          })}
          {future.map((item) => <span key={item.key} title={t.nav.soon} className="sidebar-link cursor-default"><Icon name={item.icon} size="md" /><span>{t.nav[item.key]}</span></span>)}
        </nav>

        <div className="mt-auto border-t border-white/5 p-5">
          <div className="flex items-center gap-3 rounded-xl px-1 py-2">
            <img src={LOGO} alt="" className="brand-logo h-9 w-9 object-contain" />
            <div className="min-w-0 flex-1"><div className="text-xs font-bold">PR_Front</div><div className="text-[10px] text-white/45">{t.nav.admin}</div></div>
            <Icon name="settings" size="md" />
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 h-[60px] border-b border-line bg-white/95 backdrop-blur lg:left-[246px]">
        <div className="flex h-full items-center gap-4 px-5 lg:px-8">
          <button className="text-text" aria-label={t.nav.openMenu}><Icon name="menu" size="md" /></button>
          <Link href="/" className="lg:hidden" aria-label={t.nav.home}><img src={LOGO} alt="PR-Front" className="brand-logo h-9 w-9 object-contain" /></Link>
          <div className="ml-auto hidden w-[260px] sm:block"><SearchBox items={searchIndex} variant="nav" /></div>
          <LangSwitch className="ml-auto sm:ml-0" />
          <a href="https://openfront.io" target="_blank" rel="noreferrer" className="play-button"><Icon name="play" size="xs" /> {t.nav.play}</a>
        </div>
      </header>
    </>
  );
}
