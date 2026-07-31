import Link from "next/link";
import { Icon } from "@/components/icons";
import { getDict } from "@/i18n";

const t = getDict();

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="text-6xl font-black gradient-text">404</div>
      <p className="mt-4 text-sm text-muted">Cette page n'existe pas (ou ce joueur n'est pas encore dans le circuit).</p>
      <Link href="/" className="chip mt-6 hover:border-accent/60 hover:text-accent-strong">
        <Icon name="arrowLeft" size="xs" /> {t.common.backToLeaderboard}
      </Link>
    </div>
  );
}
