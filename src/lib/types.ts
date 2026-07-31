/**
 * Types centraux de PR-Front.
 *
 * La source de vérité est le dossier `data/` :
 *   - players.json          → joueurs (identifiés par leur public ID OpenFront)
 *   - scoring.config.json   → barème de points
 *   - tournaments/*.json    → résultats des tournois
 */

export type TournamentFormat = "ffa" | "bracket" | "minor";

export interface Player {
  /** ID Discord (18 chiffres) — identité principale du joueur dans le circuit. */
  discordId: string;
  /** Pseudo affiché, lié au compte Discord. */
  name: string;
  /** Public ID OpenFront — optionnel, sert uniquement aux stats live du profil. */
  openfrontId?: string | null;
  clan?: string | null;
  country?: string | null;
}

export interface PhasePlacement {
  /** ID Discord du joueur. */
  player: string;
  /** Placement dans la phase (1 = vainqueur). Absent = simple participation. */
  place?: number | null;
}

export interface TournamentPhase {
  id: string;
  /** Clé du barème : "qualifications", "demi-finale", "finale", "quart-de-finale"... */
  type: string;
  placements: PhasePlacement[];
}

export interface TournamentGame {
  name: string;
  gameId: string;
  players: number;
  gameUrl: string;
  replayUrl: string;
}

export interface TournamentRound {
  round: string;
  entries: TournamentGame[];
}

export interface TournamentDetails {
  /** Horaire ISO de début, quand il est connu. */
  playedAt?: string;
  registered?: number;
  gameCount?: number;
  rounds?: number;
  settings?: string[];
  games?: TournamentRound[];
}

export interface Tournament {
  slug: string;
  name: string;
  /** Date ISO, ex. "2026-07-19". */
  date: string;
  format: TournamentFormat;
  /** Clé de `tiers` dans scoring.config.json : "minor" | "standard" | "major". */
  tier: string;
  map?: string | null;
  /** Nombre total de participants (indicatif). */
  participants: number;
  /** Informations complémentaires et liens de parties, si disponibles. */
  details?: TournamentDetails;
  /** Vrai tant que ce sont des données d'exemple. */
  sample?: boolean;
  phases: TournamentPhase[];
}

export interface ScoringPlaceRange {
  /** Première place (incluse) de la tranche. */
  min: number;
  /** Dernière place (incluse) de la tranche, ou `null` pour "et au-delà". */
  max: number | null;
  points: number;
}

export interface ScoringPhase {
  label: string;
  /** Points par placement exact, ex. { "1": 100, "2": 80 }. */
  places: Record<string, number>;
  /**
   * Tranches de placements (utile pour les gros classements type battle
   * royale : "11e-15e", "100e et au-delà"…). Vérifiées après `places`,
   * avant `defaultPoints`.
   */
  ranges?: ScoringPlaceRange[];
  /** Points si aucun placement précis n'est défini pour ce rang. */
  defaultPoints: number;
  /**
   * Si vrai, cette phase ignore le multiplicateur de tier du tournoi
   * (les points du barème sont déjà les points finaux).
   */
  ignoreTierMultiplier?: boolean;
  /**
   * Si vrai, cette phase compte comme le classement final du tournoi pour
   * les stats (victoires, top3, meilleure place, place moyenne). Par
   * défaut, seule la phase de type "finale" compte.
   */
  countsAsFinal?: boolean;
}

export interface ScoringFormat {
  phaseOrder: string[];
  phases: Record<string, ScoringPhase>;
}

export interface ScoringConfig {
  tiers: Record<string, number>;
  formats: Record<string, ScoringFormat>;
}

/** Attribution de points unitaire (une phase d'un tournoi pour un joueur). */
export interface PhasePointsAward {
  tournamentSlug: string;
  tournamentName: string;
  tournamentDate: string;
  format: TournamentFormat;
  tier: string;
  phaseType: string;
  phaseLabel: string;
  place: number | null;
  basePoints: number;
  /** Points finaux après multiplicateur de tier. */
  points: number;
}

export interface PlayerPR {
  playerId: string;
  points: number;
  /** Tournois joués. */
  events: number;
  /** Finales gagnées (= victoires de tournoi). */
  wins: number;
  /** Top 3 en finale. */
  top3: number;
  bestPlace: number | null;
  avgPlace: number | null;
  awards: PhasePointsAward[];
}

export interface LeaderboardEntry extends PlayerPR {
  rank: number;
  player: Player | null;
}
