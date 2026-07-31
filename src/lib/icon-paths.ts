/**
 * Géométrie des icônes maison de PR-Front.
 *
 * Source de vérité unique, en données pures (pas de JSX) pour que :
 *   - `src/components/icons.tsx` les rende en React (composant <Icon />) ;
 *   - `scripts/gen-icons.ts` en génère des fichiers SVG autonomes dans
 *     `public/icons/` (utilisés par le README et réutilisables ailleurs).
 *
 * Toutes les icônes sont dessinées sur une grille 24×24, tracées au trait
 * (`currentColor`), avec quelques remplissages ponctuels pour les formes qui
 * doivent rester lisibles en 14-16 px (étoile, éclair, pastilles…).
 */

export interface IconPath {
  /** Attribut `d` du <path>. */
  d: string;
  /** Rempli plutôt que tracé (par défaut : tracé). */
  fill?: boolean;
  /** Épaisseur spécifique à ce tracé (sinon : épaisseur de l'icône). */
  width?: number;
}

export interface IconDef {
  /** Épaisseur de trait par défaut de l'icône. */
  stroke?: number;
  paths: IconPath[];
}

/** Épaisseur de trait par défaut de la librairie. */
export const DEFAULT_STROKE = 1.7;

/**
 * Conserve l'inférence des clés (pour `IconName`) tout en typant chaque valeur
 * comme un `IconDef` complet — `as const satisfies` perdrait les champs
 * optionnels (`fill`, `stroke`, `width`) sur les icônes qui ne les utilisent pas.
 */
const defineIcons = <T extends Record<string, IconDef>>(icons: T): { [K in keyof T]: IconDef } => icons;

export const ICONS = defineIcons({
  /* ---------------------------------------------------------------- Navigation */
  menu: {
    paths: [{ d: "M4 6.9h16M4 12h11M4 17.1h16" }],
  },
  arrowLeft: {
    paths: [{ d: "M19.2 12H5.2m6.2-6.4L5 12l6.4 6.4" }],
  },
  arrowRight: {
    paths: [{ d: "M4.8 12h14m-6.2-6.4L18.8 12l-6.4 6.4" }],
  },
  search: {
    paths: [
      { d: "M4.4 11a6.6 6.6 0 1 0 13.2 0a6.6 6.6 0 1 0 -13.2 0Z" },
      { d: "m16.1 16.1 4.3 4.3" },
    ],
  },
  play: {
    paths: [{ d: "M8.6 5.2 19 12 8.6 18.8V5.2Z", fill: true }],
  },
  settings: {
    paths: [
      {
        d: "M10.55 2.81L13.45 2.81L13.08 5.18L16.06 6.42L17.47 4.48L19.52 6.53L17.58 7.94L18.82 10.92L21.19 10.55L21.19 13.45L18.82 13.08L17.58 16.06L19.52 17.47L17.47 19.52L16.06 17.58L13.08 18.82L13.45 21.19L10.55 21.19L10.92 18.82L7.94 17.58L6.53 19.52L4.48 17.47L6.42 16.06L5.18 13.08L2.81 13.45L2.81 10.55L5.18 10.92L6.42 7.94L4.48 6.53L6.53 4.48L7.94 6.42L10.92 5.18Z",
      },
      { d: "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z" },
    ],
  },

  /* -------------------------------------------------------------- Compétition */
  trophy: {
    paths: [
      { d: "M7.6 3.4h8.8v5.1a4.4 4.4 0 0 1-8.8 0V3.4Z" },
      { d: "M7.6 5.3H4.4v1.3a3.7 3.7 0 0 0 3.4 3.6" },
      { d: "M16.4 5.3h3.2v1.3a3.7 3.7 0 0 1-3.4 3.6" },
      { d: "M12 12.9v3.6" },
      { d: "M9.7 16.5h4.6l1 4H8.7l1-4Z" },
      { d: "M7.6 20.5h8.8" },
    ],
  },
  medal: {
    paths: [
      { d: "M8.4 2.9 11 9.1M15.6 2.9 13 9.1" },
      { d: "M5.9 14.8a6.1 6.1 0 1 0 12.2 0a6.1 6.1 0 1 0 -12.2 0Z" },
      {
        d: "M12 11.8L12.75 13.76L14.85 13.87L13.22 15.2L13.76 17.23L12 16.08L10.24 17.23L10.78 15.2L9.15 13.87L11.25 13.76Z",
        fill: true,
      },
    ],
  },
  crown: {
    paths: [
      { d: "m3 7.2 4.8 4.2L12 3.8l4.2 7.6L21 7.2l-2 11.4H5L3 7.2Z" },
      { d: "M5.4 18.6h13.2" },
    ],
  },
  star: {
    paths: [
      {
        d: "M12 3.3L14.26 9.19L20.56 9.52L15.66 13.49L17.29 19.58L12 16.15L6.71 19.58L8.34 13.49L3.44 9.52L9.74 9.19Z",
      },
    ],
  },
  starFilled: {
    paths: [
      {
        d: "M12 3.3L14.26 9.19L20.56 9.52L15.66 13.49L17.29 19.58L12 16.15L6.71 19.58L8.34 13.49L3.44 9.52L9.74 9.19Z",
        fill: true,
      },
    ],
  },
  shield: {
    paths: [
      { d: "M12 3 5.5 6v5c0 4.2 2.7 7.7 6.5 9 3.8-1.3 6.5-4.8 6.5-9V6L12 3Z" },
      { d: "m9.1 11.7 2.1 2.2 3.7-4.2" },
    ],
  },
  swords: {
    paths: [
      // Épée montant vers le haut-droite
      { d: "M9.07 16.98L19.35 6.71L20.3 3.7L17.29 4.65L7.02 14.93Z" },
      { d: "M9.03 18.22 5.78 14.97" },
      { d: "M7.4 16.6 5 19" },
      // Épée montant vers le haut-gauche
      { d: "M16.98 14.93L6.71 4.65L3.7 3.7L4.65 6.71L14.93 16.98Z" },
      { d: "M18.22 14.97 14.97 18.22" },
      { d: "M16.6 16.6 19 19" },
    ],
  },
  target: {
    paths: [
      { d: "M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0Z" },
      { d: "M7.1 12a4.9 4.9 0 1 0 9.8 0a4.9 4.9 0 1 0 -9.8 0Z" },
      { d: "M10.4 12a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z", fill: true },
    ],
  },
  flag: {
    paths: [{ d: "M6 21V3.6m0 1.3h11.4l-2.6 3.6 2.6 3.6H6" }],
  },

  /* ------------------------------------------------------------------ Joueurs */
  users: {
    paths: [
      { d: "M15.6 19.8v-1.7a3.9 3.9 0 0 0-3.9-3.9H6.9A3.9 3.9 0 0 0 3 18.1v1.7" },
      { d: "M5.8 7.5a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z" },
      { d: "M16.4 4.5a3.5 3.5 0 0 1 0 6.5" },
      { d: "M17.9 14.4a3.9 3.9 0 0 1 3.1 3.7v1.7" },
    ],
  },
  bolt: {
    paths: [
      { d: "M13.6 2.2 5.4 13.6h5.2l-1.2 8.2 8.2-11.6h-5.2l1.2-8Z", fill: true },
    ],
  },

  /* ------------------------------------------------------------------- Statuts */
  check: {
    stroke: 2.4,
    paths: [{ d: "m4.8 12.5 4.9 5 9.5-10.6" }],
  },
  close: {
    stroke: 2.4,
    paths: [{ d: "M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6" }],
  },
  warning: {
    paths: [
      { d: "M12 3.5 21.4 19.9H2.6L12 3.5Z" },
      { d: "M12 9.6v4.6" },
      { d: "M12 17.5h.02", width: 2.2 },
    ],
  },
  link: {
    paths: [
      { d: "M10.3 13.7a4.1 4.1 0 0 0 5.8 0l2.8-2.8a4.1 4.1 0 1 0-5.8-5.8l-1.6 1.6" },
      { d: "M13.7 10.3a4.1 4.1 0 0 0-5.8 0l-2.8 2.8a4.1 4.1 0 1 0 5.8 5.8l1.6-1.6" },
    ],
  },
  broadcast: {
    paths: [
      { d: "M10.1 12a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0Z", fill: true },
      { d: "M8.6 8.6a4.8 4.8 0 0 0 0 6.8" },
      { d: "M15.4 15.4a4.8 4.8 0 0 0 0-6.8" },
      { d: "M5.9 5.9a8.6 8.6 0 0 0 0 12.2" },
      { d: "M18.1 18.1a8.6 8.6 0 0 0 0-12.2" },
    ],
  },
  hourglass: {
    paths: [
      { d: "M6.6 3.2h10.8M6.6 20.8h10.8" },
      { d: "M7.8 3.2v2.6c0 2 1.6 3 2.9 4.2L12 11.4l1.3-1.4c1.3-1.2 2.9-2.2 2.9-4.2V3.2" },
      { d: "M7.8 20.8v-2.6c0-2 1.6-3 2.9-4.2L12 12.6l1.3 1.4c1.3 1.2 2.9 2.2 2.9 4.2v2.6" },
      { d: "M9.7 18.6h4.6L12 15.8l-2.3 2.8Z", fill: true },
    ],
  },
  history: {
    paths: [
      { d: "M3.6 12a8.4 8.4 0 1 0 2.6-6.1L3.4 8.6" },
      { d: "M3.2 3.6v5.2h5.2" },
      { d: "M12 7.4v5l3.4 2" },
    ],
  },
  chart: {
    paths: [
      { d: "M4 20.2v-9.8h3.9v9.8M10.1 20.2V4.2H14v16M16.1 20.2v-6.9H20v6.9" },
      { d: "M2.6 20.2h18.8" },
    ],
  },

  /* --------------------------------------------------------- Docs / README */
  globe: {
    paths: [
      { d: "M3.4 12a8.6 8.6 0 1 0 17.2 0a8.6 8.6 0 1 0 -17.2 0Z" },
      { d: "M3.4 12h17.2" },
      { d: "M12 3.4c2.3 2.4 3.6 5.3 3.6 8.6s-1.3 6.2-3.6 8.6c-2.3-2.4-3.6-5.3-3.6-8.6S9.7 5.8 12 3.4Z" },
    ],
  },
  note: {
    paths: [
      { d: "M13.4 3.6H5.4a1.6 1.6 0 0 0-1.6 1.6v13.2a1.6 1.6 0 0 0 1.6 1.6h13.2a1.6 1.6 0 0 0 1.6-1.6v-8" },
      { d: "m18.4 2.6 3 3-7.9 7.9-3.6.6.6-3.6 7.9-7.9Z" },
    ],
  },
  bulb: {
    paths: [
      // Ampoule : verre rond + col, base plate en haut du culot
      { d: "M12 2.6a6.4 6.4 0 0 0-3.7 11.6c.6.5 1 1.2 1 2v.5h5.4v-.5c0-.8.4-1.5 1-2A6.4 6.4 0 0 0 12 2.6Z" },
      { d: "M9.3 18.5h5.4M10.4 21h3.2" },
      // Filament
      { d: "M10.2 8.9 12 11.4l1.8-2.5" },
      { d: "M12 11.4v3.3" },
    ],
  },
  rocket: {
    paths: [
      { d: "M12 2.6c2.7 2.4 4.2 5.6 4.2 9.2 0 2.3-.6 4.4-1.7 6.2H9.5A12.6 12.6 0 0 1 7.8 11.8c0-3.6 1.5-6.8 4.2-9.2Z" },
      { d: "M10.1 10a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0Z" },
      { d: "M7.9 10.7 4.7 13.9c-.6.6-.9 1.3-.9 2.1v2.8l4.1-2.5" },
      { d: "m16.1 10.7 3.2 3.2c.6.6.9 1.3.9 2.1v2.8l-4.1-2.5" },
      { d: "M10.3 20.2c.5.8 1.1 1.4 1.7 1.9.6-.5 1.2-1.1 1.7-1.9" },
    ],
  },
  puzzle: {
    paths: [
      // Pièce de puzzle : tenon en haut, mortaise à gauche
      {
        d: "M9.4 3.4a2.6 2.6 0 0 1 5.2 0v.9h4.6a1 1 0 0 1 1 1v13.3a1 1 0 0 1-1 1H5.4a1 1 0 0 1-1-1v-4.5h.9a2.6 2.6 0 0 0 0-5.2h-.9V5.3a1 1 0 0 1 1-1h4.6v-.9Z",
      },
    ],
  },
});

export type IconName = keyof typeof ICONS;

/** Liste triée des noms d'icônes (pratique pour les scripts / tests). */
export const ICON_NAMES = Object.keys(ICONS).sort() as IconName[];
