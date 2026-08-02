import { ICONS, DEFAULT_STROKE, type IconName } from "@/lib/icon-paths";

export type { IconName };

const SIZES = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

export type IconSize = keyof typeof SIZES;

export interface IconProps {
  /** Nom de l'icône dans la librairie maison (`src/lib/icon-paths.ts`). */
  name: IconName;
  /** Taille prédéfinie ; ignorée si `className` fixe déjà h-/w-. */
  size?: IconSize;
  className?: string;
  /**
   * Texte alternatif. Fourni → l'icône est exposée aux lecteurs d'écran.
   * Omis → l'icône est purement décorative (`aria-hidden`).
   */
  title?: string;
  /** Surcharge ponctuelle de l'épaisseur du trait. */
  strokeWidth?: number;
}

/**
 * Icône SVG maison — remplace les émojis du site.
 *
 * Le tracé utilise `currentColor` : la couleur suit celle du texte parent,
 * ce qui garde les icônes cohérentes avec le thème (accent orange, muted…)
 * et lisibles en impression / contraste élevé, là où les émojis dépendaient
 * de la police système de chaque OS.
 */
export function Icon({ name, size = "sm", className = "", title, strokeWidth }: IconProps) {
  const def = ICONS[name];
  const stroke = strokeWidth ?? def.stroke ?? DEFAULT_STROKE;
  const hasSize = /(^|\s)(h-|w-|size-)/.test(className);

  return (
    <svg
      viewBox={def.viewBox ?? "0 0 24 24"}
      className={`inline-block shrink-0 ${hasSize ? "" : SIZES[size]} ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {def.paths.map((p, i) =>
        p.fill ? (
          <path key={i} d={p.d} fill={def.fillColor ?? "currentColor"} stroke="none" />
        ) : (
          <path key={i} d={p.d} strokeWidth={p.width ?? stroke} />
        ),
      )}
    </svg>
  );
}

export default Icon;
