/**
 * Génère les fichiers SVG autonomes de `public/icons/` à partir de la
 * géométrie partagée (`src/lib/icon-paths.ts`).
 *
 * Ces fichiers servent au README (GitHub ne rend pas les composants React) et
 * restent réutilisables ailleurs (OG images, bot Discord…).
 *
 *   npm run icons
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ICONS, DEFAULT_STROKE, type IconName } from "../src/lib/icon-paths.ts";

const OUT_DIR = join(import.meta.dirname, "..", "public", "icons");

/** Couleur des SVG statiques : l'accent orange du thème, lisible clair/sombre. */
const COLOR = "#c95d0c";

function toSvg(name: IconName, color = COLOR): string {
  const def = ICONS[name];
  const stroke = def.stroke ?? DEFAULT_STROKE;
  const fill = def.fillColor ?? color;
  const body = def.paths
    .map((p) =>
      p.fill
        ? `  <path d="${p.d}" fill="${fill}"/>`
        : `  <path d="${p.d}" fill="none" stroke="${color}" stroke-width="${p.width ?? stroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox ?? "0 0 24 24"}" width="24" height="24" role="img" aria-label="${name}">\n${body}\n</svg>\n`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith(".svg")) rmSync(join(OUT_DIR, f));
}

const names = Object.keys(ICONS) as IconName[];
for (const name of names) {
  writeFileSync(join(OUT_DIR, `${name}.svg`), toSvg(name), "utf8");
}

console.log(`${names.length} icônes générées dans public/icons/`);
