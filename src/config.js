// Zentrale Spielkonstanten. Alles, was du balancen willst, steht hier.

export const YEAR = 2026;
/** Echte Sekunden pro Spielminute (1 Spielstunde = 1 echte Minute). */
export const TICK_SECONDS = 0.25;
export const SHIFT_END = { default: 360, back: 600 }; // Spielminuten bis Schichtende
export const BACKROOMS_START_HOUR = 22;

export const FN = ['Klaus', 'Anna', 'Jonas', 'Mira', 'Ben', 'Lena', 'Otto', 'Eva'];
export const LN = ['Weber', 'Brandt', 'Krüger', 'Vogel', 'Hahn', 'Roth', 'Falk', 'Lenz'];

/** Regale: key -> [Anzeigename, [[Ware, Preis €, Mindestalter], ...]] */
export const SH = {
  snack: ['Snacks', [['Chips', 3, 0], ['Schoki', 2, 0]]],
  drink: ['Getränke', [['Cola', 3, 0], ['Bier', 5, 16]]],
  tab: ['Tabak', [['Zigaretten', 8, 18]]],
};
export const START_STOCK = { snack: 6, drink: 6, tab: 5 };
export const RESTOCK_AMOUNT = 8;
export const ORDER_PRICE = 30;
export const ORDER_DELAY = 120; // Spielminuten = 2 echte Minuten
export const INVENTORY_SLOTS = 2;

/** Möbel: [Emoji, Name, Preis] – erscheinen als 3D-Objekte im Lager. */
export const FU = [['🪴', 'Pflanze', 20], ['💡', 'Lampe', 30], ['🖼️', 'Poster', 25], ['🧶', 'Teppich', 40], ['☕', 'Kaffeemaschine', 50], ['🛋️', 'Sofa', 80]];
/** Boss-Ausrüstung */
export const ITEM_PRICE = { wood: 10, trap: 25, bomb: 40, elek: 35 };
export const GATE_PRICE = 60;
export const POWER_PRICE = 30;

export const WHISPERS = ['Das Licht flackert...', 'Hinter dir kratzt etwas an der Scheibe.', 'Irgendwo tropft es.', 'Die Kühlregale summen ein Lied.'];

export const MAX_MISTAKES = 3;   // danach kommt der Boss
export const MAX_COMPLAINTS = 5; // danach gefeuert
export const SKULLS_TOTAL = 10;
export const HEADS_TOTAL = 8;
/** mögliche Schädel-Verstecke (Weltkoordinaten x,z) */
export const SKULL_SPOTS = [[3, -9], [-14, -5], [-1.2, -9.8], [-4.7, -28], [-9, -52], [-8, -5.5]];
export const SECRET_MONEY = [25, 40, 60, 100, 50, 80];

/** Upgrade-Kosten: unendlich viele Stufen, jede Stufe wird teurer */
export const UPGRADE_BASE = { mm: [100, 1.7], dm: [120, 1.7], hp: [80, 1.5] };
export const upgradeCost = (k, level) => Math.round(UPGRADE_BASE[k][0] * Math.pow(UPGRADE_BASE[k][1], level));
/** Waffenstufe (Werkbank im Lager): ebenfalls ohne Obergrenze */
export const weaponLevelCost = wl => Math.round(60 * Math.pow(1.5, wl - 1));

// ---------------------------------------------------------------- Welten
/** Ab wie vielen geschafften Schichten (gesamt) eine Welt aufgeht. */
export const WORLD_UNLOCK = { tank: 0, back: 5, winter: 8, pirate: 10, alien: 12, pizza: 15 };
// Halloween hat bewusst keinen eigenen Wert: es öffnet erst, wenn alle anderen offen sind.
export const WORLDS = [
  { id: 'tank', label: '⛽ Tankstelle' },
  { id: 'pizza', label: "🍕 Benni Fazbear's" },
  { id: 'back', label: '🟨 Backrooms' },
  { id: 'winter', label: '❄️ Winter' },
  { id: 'pirate', label: '🏴 Piraten' },
  { id: 'alien', label: '👽 Alien' },
  { id: 'hallo', label: '🎃 Halloween' },
];

// ---------------------------------------------------------------- Waffen
const BASE_TYPES = ['Pistole', 'Revolver', 'Schrotflinte', 'Sturmgewehr', 'Scharfschütze', 'Armbrust', 'Flammenwerfer', 'Laser', 'Plasmakanone', 'Donnerhammer'];
const TIERS = ['Rost', 'Stahl', 'Silber', 'Gold', 'Dämon'];
export const BASE_TYPE_NAMES = BASE_TYPES;

/** Index-Konstanten (Indizes bleiben stabil, damit alte Spielstände passen). */
export const W_IDX = { trash: 25, garden: 35, tankAltar: 49, knife: 50, pizzaAltar: 51, shop1: 52, shop2: 53, winterAltar: 54, pirateAltar: 55, halloAltar: 56, evBlade: 57, evBlaster: 58, evRifle: 59, evLaser: 60 };

/**
 * Alle Waffen: { name, dmg, price, lock }
 * lock: null = im Shop kaufbar, sonst Text, warum sie gesperrt ist.
 */
export const WEAPONS = [];
for (const t of TIERS) for (const b of BASE_TYPES) {
  const i = WEAPONS.length;
  WEAPONS.push({ name: t + '-' + b, dmg: Math.round(6 + i * 1.6), price: i ? Math.round(20 * Math.pow(i, 1.25)) : 0, lock: null });
}
const special = (i, name, dmg, price, lock) => { WEAPONS[i] = { name, dmg, price, lock }; };
special(W_IDX.tankAltar, 'Dämon-Donnerhammer', 160, 0, '🔒 Altar');
special(W_IDX.knife, 'Messer', 30, 0, '🔒 4. Schicht');
special(W_IDX.pizzaAltar, 'Fazbear-Nachtmahr', 200, 0, '🔒 Altar');
special(W_IDX.shop1, 'Götterdämmerung', 120, 6000, null);
special(W_IDX.shop2, 'Apokalypse-Kanone', 140, 9000, null);
special(W_IDX.winterAltar, 'Eisdrachen-Zorn', 200, 0, '🔒 Altar');
special(W_IDX.pirateAltar, 'Klabautermann-Kanone', 250, 0, '🔒 Altar');
special(W_IDX.halloAltar, 'Kürbiskönig-Vernichter', 300, 0, '🔒 Altar');
// Event-Waffen (Dark Point Saga) – stark, aber unter den Altar-Waffen
special(W_IDX.evBlade, 'Dark Blade', 150, 0, '🔒 Event');
special(W_IDX.evBlaster, 'Light Blaster', 145, 0, '🔒 Event');
special(W_IDX.evRifle, 'Shadow Rifle', 155, 0, '🔒 Event');
special(W_IDX.evLaser, 'Zukunfts-Laser', 158, 0, '🔒 Event');
WEAPONS[W_IDX.trash].lock = '🔒 Geheimnis';
WEAPONS[W_IDX.garden].lock = '🔒 Garten';

/**
 * Zentrale Altar-Tabelle. Rang = Platz in der Waffen-Rangliste (1 = stärkste).
 * Pizzeria und Winter teilen sich Platz 3 (gleicher Schaden).
 * need: 'skulls' | 'heads' | 'shifts' (Schichten in genau dieser Welt)
 */
export const ALTARS = {
  hallo: { need: 'shifts', count: 30, weapon: W_IDX.halloAltar, rank: 1, boss: true },
  pirate: { need: 'shifts', count: 25, weapon: W_IDX.pirateAltar, rank: 2 },
  winter: { need: 'shifts', count: 20, weapon: W_IDX.winterAltar, rank: 3 },
  pizza: { need: 'heads', count: HEADS_TOTAL, weapon: W_IDX.pizzaAltar, rank: 3 },
  tank: { need: 'skulls', count: SKULLS_TOTAL, weapon: W_IDX.tankAltar, rank: 4 },
};

// ---------------------------------------------------------------- Accounts
export const ADMIN_NAME = 'crim';
/** Hash von Admin-Passwort (siehe hashPw). Nur ein Spiel-Schutz, keine echte Sicherheit. */
export const ADMIN_PW_HASH = 4247803228;
export const GIFT_NAMES = ['dinnerbonegg', 'dinnerboneagg'];
export const GIFT_FIRST_LOGIN = 1000;
export const GIFT_SHIFT = { at: 4, amount: 100 };
export const KNIFE_AT_SHIFT = 4;
