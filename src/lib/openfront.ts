/**
 * Client de l'API publique OpenFront (https://api.openfront.io/public/...).
 *
 * Défensif par design : les formes exactes de certaines réponses ne sont pas
 * documentées, et les rate limits sont stricts → on parsé tolère les champs
 * manquants et on remonte ok:false en cas d'échec, sans casser la page.
 */

export interface OfRecentGame {
  gameId: string;
  start: string | null;
  mode: string | null;
  map: string | null;
  result: "victory" | "defeat" | "incomplete" | string;
  totalPlayers: number | null;
  username: string | null;
  clanTag: string | null;
}

export interface OfLiveStats {
  ok: boolean;
  error?: string;
  /** Pseudo actuel détecté via l'API, si disponible. */
  username: string | null;
  clanTag: string | null;
  recentGames: OfRecentGame[];
  sampleSize: number;
  wins: number;
  losses: number;
  /** Winrate en % sur l'échantillon récent, null si indéterminé. */
  winrate: number | null;
}

const API = "https://api.openfront.io/public";

function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function parseGame(raw: unknown): OfRecentGame | null {
  if (typeof raw !== "object" || raw === null) return null;
  const g = raw as Record<string, unknown>;
  const gameId = asStr(g.gameId);
  if (!gameId) return null;
  const result = asStr(g.result) ?? "incomplete";
  return {
    gameId,
    start: asStr(g.start),
    mode: asStr(g.mode),
    map: asStr(g.map),
    result,
    totalPlayers: asNum(g.totalPlayers),
    username: asStr(g.username),
    clanTag: asStr(g.clanTag),
  };
}

async function fetchJson(url: string, revalidate = 300): Promise<unknown> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Récupère l'historique récent de parties publiques du joueur et agrège un
 * mini-bilan victoires/défaites. Toute erreur réseau/API → ok:false.
 */
export async function getLiveStats(playerId: string): Promise<OfLiveStats> {
  const empty: OfLiveStats = {
    ok: false,
    username: null,
    clanTag: null,
    recentGames: [],
    sampleSize: 0,
    wins: 0,
    losses: 0,
    winrate: null,
  };
  if (!/^[A-Za-z0-9]{4,32}$/.test(playerId)) {
    return { ...empty, error: "invalid_id" };
  }
  try {
    const [gamesRes, infoRes] = await Promise.allSettled([
      fetchJson(`${API}/player/${encodeURIComponent(playerId)}/games`),
      fetchJson(`${API}/player/${encodeURIComponent(playerId)}`),
    ]);

    let recentGames: OfRecentGame[] = [];
    if (gamesRes.status === "fulfilled") {
      const body = gamesRes.value as Record<string, unknown>;
      const results = Array.isArray(body?.results) ? body.results : [];
      recentGames = results.map(parseGame).filter((g): g is OfRecentGame => g !== null);
    }

    let username: string | null = null;
    let clanTag: string | null = null;
    if (infoRes.status === "fulfilled") {
      const info = infoRes.value as Record<string, unknown>;
      username = asStr(info?.username) ?? asStr(info?.name);
      clanTag = asStr(info?.clanTag) ?? asStr(info?.clan);
    }
    // À défaut, on prend l'identité de la dernière partie.
    username ??= recentGames.find((g) => g.username)?.username ?? null;
    clanTag ??= recentGames.find((g) => g.clanTag)?.clanTag ?? null;

    const wins = recentGames.filter((g) => g.result === "victory").length;
    const losses = recentGames.filter((g) => g.result === "defeat").length;
    const decided = wins + losses;

    return {
      ok: recentGames.length > 0 || username !== null,
      username,
      clanTag,
      recentGames: recentGames.slice(0, 10),
      sampleSize: recentGames.length,
      wins,
      losses,
      winrate: decided > 0 ? Math.round((wins / decided) * 1000) / 10 : null,
    };
  } catch (e) {
    return { ...empty, error: (e as Error).message };
  }
}
