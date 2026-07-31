/**
 * Chargement des données depuis `data/` (côté serveur uniquement).
 */

import { cache } from "react";
import fs from "node:fs";
import path from "node:path";
import type { Player, ScoringConfig, Tournament } from "./types";
import { computeLeaderboard, type DataError } from "./pr";
import type { LeaderboardEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(file: string): T {
  const full = path.join(DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(full, "utf8")) as T;
  } catch (e) {
    throw new Error(`Impossible de lire ${file}: ${(e as Error).message}`);
  }
}

export const getPlayers = cache((): Player[] => {
  const raw = readJson<{ players: Player[] }>("players.json");
  return raw.players.filter((p) => p && typeof p.id === "string" && typeof p.name === "string");
});

export const getScoring = cache((): ScoringConfig => {
  const raw = readJson<ScoringConfig & { _note?: string }>("scoring.config.json");
  return { tiers: raw.tiers ?? {}, formats: raw.formats ?? {} };
});

export const getTournaments = cache((): Tournament[] => {
  const dir = path.join(DATA_DIR, "tournaments");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const tournaments = files.map((f) => {
    const t = readJson<Tournament>(path.join("tournaments", f));
    if (!t.slug || !t.format || !Array.isArray(t.phases)) {
      throw new Error(`Tournoi invalide dans ${f} : slug, format et phases sont requis.`);
    }
    return t;
  });
  // Plus récents d'abord.
  return tournaments.sort((a, b) => b.date.localeCompare(a.date));
});

export const getTournament = cache((slug: string): Tournament | null => {
  return getTournaments().find((t) => t.slug === slug) ?? null;
});

/** Classement calculé. Lève une DataError si une donnée est incohérente. */
export const getLeaderboard = cache((): LeaderboardEntry[] => {
  return computeLeaderboard(getTournaments(), getPlayers(), getScoring());
});

export const getPlayerPR = cache((playerId: string): LeaderboardEntry | null => {
  return getLeaderboard().find((e) => e.playerId === playerId) ?? null;
});

export const getPlayer = cache((playerId: string): Player | null => {
  return getPlayers().find((p) => p.id === playerId) ?? null;
});

export type { DataError };
