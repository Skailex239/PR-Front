import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getSearchIndex } from "@/lib/data";
import { getDict } from "@/i18n";

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
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <Navbar searchIndex={searchIndex} />
        <div className="min-h-screen pt-[60px] lg:pl-[246px]">
          <main className="mx-auto w-full max-w-[1080px] px-5 py-10 sm:px-8 lg:py-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
