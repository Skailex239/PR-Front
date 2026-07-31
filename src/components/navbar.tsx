"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "@/components/search-box";
import type { SearchIndexItem } from "@/lib/data";

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    menu: <><path d="M4 7h16M4 12h11M4 17h16" /></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a3 3 0 0 0 3 3m8-4h3v1a3 3 0 0 1-3 3M12 12v5m-4 3h8"/></>,
    shield: <path d="M12 3 5.5 6v5c0 4.2 2.7 7.7 6.5 9 3.8-1.3 6.5-4.8 6.5-9V6L12 3Zm0 4v7m0 0 3-3m-3 3-3-3" />,
    users: <><path d="M16 19v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V19"/><circle cx="9.5" cy="7.5" r="3"/><path d="M16 5.2a3 3 0 0 1 0 5.6m1.5 2.9a4 4 0 0 1 3.5 3.8V19"/></>,
    flag: <><path d="M6 21V4m0 1h10l-2 3 2 3H6"/></>,
    swords: <><path d="m5 3 6.5 6.5M3 5l2-2m.5 7.5L3 13l3 3 2.5-2.5M19 3l-7 7m7-7 2 2-7 7m-4 2-4 4m-1 3-2-2 3-3m8.5-2.5L21 19l-2 2-5.5-5.5"/></>,
    chart: <><path d="M4 20V10h4v10m2 0V4h4v16m2 0v-7h4v7M2 20h20"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5m4-2v6l4 2"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7 2-.4Z" transform="translate(3 0) scale(.75)"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pr-front-logo.svg`;

const primary = [
  { href: "/", label: "Classement", icon: "trophy", exact: true },
  { href: "/tournaments", label: "Tournois", icon: "shield" },
];
const future = [
  { label: "Joueurs", icon: "users" },
  { label: "Clans", icon: "flag" },
  { label: "Matchs", icon: "swords" },
  { label: "Statistiques", icon: "chart" },
  { label: "Historique", icon: "history" },
  { label: "Favoris", icon: "star" },
];

export default function Navbar({ searchIndex }: { searchIndex: SearchIndexItem[] }) {
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[246px] flex-col bg-sidebar text-white lg:flex">
        <Link href="/" className="flex h-[98px] items-center px-7" aria-label="PR-Front — Accueil">
          <img src={LOGO} alt="PR-Front" className="brand-logo h-16 w-16 object-contain" />
        </Link>

        <nav className="mt-1 space-y-1">
          {primary.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}><Icon name={item.icon}/><span>{item.label}</span></Link>;
          })}
          {future.map((item) => <span key={item.label} className="sidebar-link cursor-default"><Icon name={item.icon}/><span>{item.label}</span></span>)}
        </nav>

        <div className="mt-auto border-t border-white/5 p-5">
          <div className="flex items-center gap-3 rounded-xl px-1 py-2">
            <img src={LOGO} alt="" className="brand-logo h-9 w-9 object-contain" />
            <div className="min-w-0 flex-1"><div className="text-xs font-bold">PR_Front</div><div className="text-[10px] text-white/45">Admin</div></div>
            <Icon name="settings"/>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 h-[60px] border-b border-line bg-white/95 backdrop-blur lg:left-[246px]">
        <div className="flex h-full items-center gap-4 px-5 lg:px-8">
          <button className="text-text" aria-label="Ouvrir le menu"><Icon name="menu" /></button>
          <Link href="/" className="lg:hidden" aria-label="PR-Front — Accueil"><img src={LOGO} alt="PR-Front" className="brand-logo h-9 w-9 object-contain" /></Link>
          <div className="ml-auto hidden w-[260px] sm:block"><SearchBox items={searchIndex} variant="nav" /></div>
          <a href="https://openfront.io" target="_blank" rel="noreferrer" className="play-button"><span className="text-[10px]">▷</span> Jouer</a>
        </div>
      </header>
    </>
  );
}
