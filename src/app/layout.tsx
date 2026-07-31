import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getSearchIndex } from "@/lib/data";
import { DEFAULT_LANG, getDict } from "@/i18n";
import { I18nProvider } from "@/i18n/provider";
import LangDialog from "@/components/lang-dialog";

const t = getDict();

export const metadata: Metadata = {
  title: { default: `${t.site.name} — ${t.site.tagline}`, template: `%s · ${t.site.name}` },
  description: t.site.description,
  applicationName: t.site.name,
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getSearchIndex();
  return (
    <html lang={DEFAULT_LANG}>
      <body className="min-h-screen antialiased">
        <I18nProvider>
          <LangDialog />
          <Navbar searchIndex={searchIndex} />
          <div className="min-h-screen pt-[60px] lg:pl-[246px]">
            {/* Pas de contrainte de largeur ici : chaque page place son propre
                <PageContainer>, ce qui laisse le bandeau d'accueil s'étendre
                sur toute la largeur. */}
            <main>{children}</main>
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
