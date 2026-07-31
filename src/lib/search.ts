/**
 * Normalisation des requêtes de recherche joueur — logique pure, testée.
 */

export interface NormalizedQuery {
  needle: string;
  /** La saisie ressemble à un ID Discord (recherche restreinte aux ID). */
  isId: boolean;
}

/**
 * Nettoie une saisie utilisateur.
 *
 * Discord propose plusieurs façons de copier une identité : « Copier l'ID »
 * donne `302050872383242240`, mais coller une mention depuis un message donne
 * `<@302050872383242240>` (ou `<@!…>` pour un surnom). On accepte les deux, et
 * on tolère les espaces parasites d'un copier-coller.
 */
export function normalizeQuery(raw: string): NormalizedQuery {
  const trimmed = raw.trim();
  const mention = trimmed.match(/^<@!?(\d+)>$/);
  const cleaned = (mention ? mention[1] : trimmed).replace(/\s+/g, "");
  // Un ID Discord (snowflake) fait 17 à 20 chiffres ; on accepte dès 5 chiffres
  // pour que la recherche fonctionne au fil de la frappe.
  const isId = /^\d{5,20}$/.test(cleaned);
  return {
    needle: isId ? cleaned : trimmed.toLowerCase(),
    isId,
  };
}

export interface SearchableItem {
  id: string;
  name: string;
  clan: string | null;
}

/** Un item correspond-il à la requête normalisée ? */
export function matchesQuery(item: SearchableItem, q: NormalizedQuery): boolean {
  if (!q.needle) return false;
  if (q.isId) return item.id.includes(q.needle);
  return `${item.name} ${item.clan ?? ""} ${item.id}`.toLowerCase().includes(q.needle);
}
