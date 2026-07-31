/**
 * Tests des helpers d'interface : recherche joueur, formatage localisé et
 * dictionnaires i18n.
 *
 *   npm test
 */
import test from "node:test";
import assert from "node:assert/strict";

import { normalizeQuery, matchesQuery } from "./search.ts";
import { formatPoints, formatDate, formatDateShort } from "./format.ts";
import { getDict, localeOf, tpl, LANGS, isLang } from "../i18n/index.ts";

// ---------- Recherche : ID Discord ----------

test("normalizeQuery détecte un ID Discord brut", () => {
  const q = normalizeQuery("302050872383242240");
  assert.equal(q.isId, true);
  assert.equal(q.needle, "302050872383242240");
});

test("normalizeQuery accepte une mention Discord <@id> et <@!id>", () => {
  assert.deepEqual(normalizeQuery("<@302050872383242240>"), {
    needle: "302050872383242240",
    isId: true,
  });
  assert.deepEqual(normalizeQuery("<@!302050872383242240>"), {
    needle: "302050872383242240",
    isId: true,
  });
});

test("normalizeQuery tolère les espaces d'un copier-coller", () => {
  const q = normalizeQuery("  30205087 2383242240 ");
  assert.equal(q.isId, true);
  assert.equal(q.needle, "302050872383242240");
});

test("normalizeQuery traite un pseudo comme du texte, en minuscules", () => {
  const q = normalizeQuery("  Pyrrha ");
  assert.equal(q.isId, false);
  assert.equal(q.needle, "pyrrha");
});

test("un pseudo numérique court n'est pas confondu avec un ID", () => {
  // 4 chiffres : sous le seuil, on reste en recherche texte.
  assert.equal(normalizeQuery("1337").isId, false);
});

// ---------- Recherche : correspondance ----------

const item = { id: "302050872383242240", name: "Pyrrha", clan: "LUX" };

test("recherche par ID partiel", () => {
  assert.equal(matchesQuery(item, normalizeQuery("3020508")), true);
  assert.equal(matchesQuery(item, normalizeQuery("999999999")), false);
});

test("recherche par pseudo, insensible à la casse", () => {
  assert.equal(matchesQuery(item, normalizeQuery("PYR")), true);
});

test("recherche par tag de clan", () => {
  assert.equal(matchesQuery(item, normalizeQuery("lux")), true);
});

test("une recherche par ID ne matche pas sur le pseudo", () => {
  // Un ID ne doit jamais ramener un joueur dont seul le nom contient ces chiffres.
  const numericName = { id: "111111111111111111", name: "302050872383242240", clan: null };
  assert.equal(matchesQuery(numericName, normalizeQuery("302050872383242240")), false);
});

test("une requête vide ne matche rien", () => {
  assert.equal(matchesQuery(item, normalizeQuery("   ")), false);
});

// ---------- Formatage localisé ----------

test("formatPoints suit la locale", () => {
  // Espace insécable en FR, virgule en EN : on compare les chiffres seulement.
  const fr = formatPoints(1805, "fr-FR").replace(/\s|\u202f|\u00a0/g, "");
  assert.equal(fr, "1805");
  assert.equal(formatPoints(1805, "en-GB"), "1,805");
});

test("formatDate produit un libellé distinct par langue", () => {
  const fr = formatDate("2026-07-25", "fr-FR");
  const en = formatDate("2026-07-25", "en-GB");
  assert.match(fr, /juillet/);
  assert.match(en, /July/);
  assert.notEqual(fr, en);
});

test("formatDateShort ne décale pas la date malgré le fuseau", () => {
  // Régression : une date seule interprétée à minuit UTC pouvait basculer
  // sur la veille selon le fuseau du navigateur.
  assert.match(formatDateShort("2026-07-25", "fr-FR"), /^25\/07\/2026$/);
});

test("formatDate renvoie l'entrée telle quelle si elle est invalide", () => {
  assert.equal(formatDate("pas-une-date", "fr-FR"), "pas-une-date");
});

// ---------- i18n ----------

test("les dictionnaires FR et EN ont exactement les mêmes clés", () => {
  const paths = (obj: unknown, prefix = ""): string[] => {
    if (obj === null || typeof obj !== "object") return [prefix];
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      paths(v, prefix ? `${prefix}.${k}` : k),
    );
  };
  const fr = paths(getDict("fr")).sort();
  const en = paths(getDict("en")).sort();
  assert.deepEqual(en, fr);
});

test("aucune valeur de traduction n'est vide", () => {
  const walk = (obj: unknown, path = ""): void => {
    if (typeof obj === "string") {
      assert.ok(obj.trim().length > 0, `valeur vide en ${path}`);
      return;
    }
    if (obj && typeof obj === "object") {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        walk(v, path ? `${path}.${k}` : k);
      }
    }
  };
  for (const lang of LANGS) walk(getDict(lang));
});

test("localeOf associe la bonne locale Intl", () => {
  assert.equal(localeOf("fr"), "fr-FR");
  assert.equal(localeOf("en"), "en-GB");
});

test("isLang valide les codes connus", () => {
  assert.equal(isLang("fr"), true);
  assert.equal(isLang("en"), true);
  assert.equal(isLang("de"), false);
  assert.equal(isLang(null), false);
});

test("tpl interpole les variables", () => {
  assert.equal(tpl("{shown} joueur(s) sur {total}", { shown: 12, total: 506 }), "12 joueur(s) sur 506");
  // Variable absente : le trou reste visible plutôt que d'afficher "undefined".
  assert.equal(tpl("{a} et {b}", { a: 1 }), "1 et {b}");
});

test("les clés du bandeau et de la fenêtre de langue sont présentes", () => {
  for (const lang of LANGS) {
    const d = getDict(lang);
    assert.ok(d.hero.title.length > 0);
    assert.ok(d.lang.dialogTitle.length > 0);
    assert.ok(d.lang.dialogSubtitle.length > 0);
    assert.ok(d.lang.dialogHint.length > 0);
    assert.ok(d.lang.suggested.length > 0);
  }
});

test("le titre du bandeau mentionne OpenFront dans les deux langues", () => {
  for (const lang of LANGS) {
    assert.match(getDict(lang).hero.title, /OpenFront/);
  }
});

test("les chaînes à trous existent dans les deux langues", () => {
  for (const lang of LANGS) {
    const d = getDict(lang);
    assert.match(d.leaderboard.filterCount, /\{shown\}.*\{total\}/);
    assert.match(d.player.playedCount, /\{n\}/);
    assert.match(d.player.liveSample, /\{n\}/);
    assert.match(d.tournaments.count, /\{n\}/);
  }
});
