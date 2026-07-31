"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { useI18n } from "@/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="text-6xl font-black gradient-text">404</div>
      <p className="mt-4 text-sm text-muted">{t.notFound.message}</p>
      <Link href="/" className="chip mt-6 hover:border-accent/60 hover:text-accent-strong">
        <Icon name="arrowLeft" size="xs" /> {t.common.backToLeaderboard}
      </Link>
    </div>
  );
}
