import { getDict } from "@/i18n";

const t = getDict();

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line/70 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted sm:px-6">
        <div className="font-semibold">
          PR-<span className="gradient-text">FRONT</span> — {t.footer.byline}
        </div>
        <div className="mt-2">{t.footer.data}</div>
      </div>
    </footer>
  );
}
