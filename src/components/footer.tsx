"use client";

import { useI18n } from "@/i18n/provider";
const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pr-front-logo.svg`;

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-line/70 py-8">
      <div className="mx-auto flex max-w-[1080px] flex-col items-center px-4 text-center text-xs text-muted sm:px-6">
        <img src={LOGO} alt="PR-Front" className="brand-logo mb-3 h-10 w-10 object-contain" />
        <div className="font-semibold">{t.footer.byline}</div>
        <div className="mt-2">{t.footer.data}</div>
      </div>
    </footer>
  );
}
