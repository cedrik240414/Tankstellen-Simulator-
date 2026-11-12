// Skins, Seltenheiten, Ränge und Shop-Rotation.

/** Seltenheit: Name, Farbe, Emoji, Preis */
export const RARITY = {
  common: { name: 'Common', color: '#b8c0c8', emoji: '⚪', price: 150 },
  uncommon: { name: 'Uncommon', color: '#3fbf5a', emoji: '🟢', price: 400 },
  rare: { name: 'Rare', color: '#3a7bff', emoji: '🔵', price: 1000 },
  epic: { name: 'Epic', color: '#a64dff', emoji: '🟣', price: 2500 },
  legendary: { name: 'Legendary', color: '#f0b400', emoji: '🟡', price: 6000 },
  mythic: { name: 'Mythic', color: '#ff3030', emoji: '🔴', price: 15000 },
};

/*
 * look: Bauplan für das 3D-Modell (siehe skins3d.js)
 *  skin/shirt/pants/shoes: Farben, head: Kopfform, hat, mask, tie, cape, wings, glow, armor, extra
 */
const C = { skin: 0xf1c9a5, dark: 0x1a1a1f, black: 0x0c0c10 };
const s = (id, name, rarity, emoji, look, only) => ({ id, name, rarity, emoji, look: { skin: C.skin, shirt: 0x6a7782, pants: 0x2b3a55, shoes: 0x222222, head: 'human', hair: 0x3a2a1a, ...look }, only });

export const SKINS = [
  s('standard', 'Standard', 'common', '🧍', { shirt: 0x3a7a4a }),
  // ---------- gewünschte Skins
  s('anzug', 'Anzug', 'uncommon', '🤵', { shirt: 0xf4f4f4, jacket: 0x1d2330, pants: 0x1d2330, tie: true }),
  s('lila', 'William Afton', 'epic', '🟪', { shirt: 0x7a35b8, pants: 0x6a2aa0, tie: true, tieColor: 0x111111, hair: 0x3a2a1a }),
  s('kuerbis', 'Kürbiskopf', 'epic', '🎃', { head: 'pumpkin', shirt: 0x2a1a30, pants: 0x1a1020, cape: 0x3a1050 }),
  s('winter', 'Winter', 'rare', '❄️', { shirt: 0x2e6ad6, pants: 0x223355, hat: 'beanie', hatColor: 0xd03030, scarf: 0xf4f4f4 }),
  s('maskiert', 'Schwarz Maskiert', 'legendary', '🥷', { head: 'mask', shirt: C.black, pants: C.black, shoes: C.black, cape: 0x111111, glow: 0xa040ff }),
  s('soldat', 'Soldat', 'rare', '🪖', { shirt: 0x4a5a32, pants: 0x3f4a2a, shoes: 0x2a2018, hat: 'helmet', hatColor: 0x3f4a2a, vest: 0x5a6a3a }),
  s('alien', 'Alien', 'rare', '👽', { head: 'alien', skin: 0x5adf6a, shirt: 0x2a6a3a, pants: 0x1f4a2a, glow: 0x7aff8a, armor: 0x2a8a4a }),
  s('backrooms', 'Backrooms-Mitarbeiter', 'uncommon', '🟨', { shirt: 0xe0c838, pants: 0xe0c838, shoes: 0x222222, head: 'helmet', visor: 0x222222, hatColor: 0xe8d850 }),
  s('hoodie', 'Typ im Hoodie', 'common', '🧥', { shirt: 0x555c66, pants: 0x22262e, hat: 'hood', hatColor: 0x555c66 }),
  s('bauchtasche', 'Bauchtaschen-Boss', 'rare', '👟', { shirt: 0x111111, pants: 0x111111, shoes: 0xf4f4f4, hat: 'cap', hatColor: 0x111111, bag: 0x8a6a3a, chain: true }),
  s('strohhut', 'Strohhut-Pirat', 'epic', '👒', { shirt: 0xc02020, pants: 0x2a50a0, shoes: 0xc8a060, hat: 'straw', hatColor: 0xe8c860, hair: 0x111111 }),
  s('frosch', 'Frosch', 'uncommon', '🐸', { head: 'frog', skin: 0x4ab84a, shirt: 0x4ab84a, pants: 0x3a9a3a, shoes: 0x3a9a3a }),
  s('benni', "Benni Fazbear", 'legendary', '🐶', { head: 'dog', skin: 0xb8692c, shirt: 0xa05a28, pants: 0xa05a28, shoes: 0x7a431d, hat: 'santa' }),
  s('hacker', 'Hacker', 'mythic', '💻', { head: 'hacker', shirt: 0x101830, pants: 0x0c0c14, hat: 'hood', hatColor: 0x101830, glow: 0x30e0ff }, 'staff'),
  s('admin', 'Admin', 'mythic', '🛡️', { head: 'hacker', shirt: 0xf4f4f4, jacket: 0x111111, pants: 0x111111, tie: true, glow: 0x30e0ff }, 'admin'),
  // ---------- Custom-Skins aus dem Video
  s('mechaniker', 'Tankstellen-Mechaniker', 'common', '🔧', { shirt: 0xf4f4f4, pants: 0xe06a10, hat: 'cap', hatColor: 0xe06a10, belt: 0x3a2a1a }),
  s('space', 'Space Explorer', 'epic', '🧑‍🚀', { head: 'helmet', visor: 0x2a7bff, shirt: 0xe8eef4, pants: 0xe8eef4, shoes: 0x8090a0, armor: 0x2a7bff, pack: 0xc8d0d8 }),
  s('shadowninja', 'Shadow Ninja', 'legendary', '🥷', { head: 'ninja', shirt: C.black, pants: C.black, shoes: C.black, cape: 0x18101f, glow: 0x9a40ff }),
  s('cyberhacker', 'Cyber Hacker', 'rare', '🕶️', { head: 'visor', visor: 0x30e0ff, shirt: 0x1a2a5a, pants: 0x101420, hat: 'hood', hatColor: 0x1a2a5a }),
  s('lavawarrior', 'Lava Warrior', 'legendary', '🌋', { head: 'flame', skin: 0x3a1a10, shirt: 0x2a1410, pants: 0x2a1410, armor: 0xff5010, glow: 0xff7a10 }),
  s('kristall', 'Kristall-Krieger', 'epic', '💠', { head: 'crystal', skin: 0x9fe8ff, shirt: 0x8a9aaa, pants: 0x6a7a8a, armor: 0x5ac8ff, glow: 0x9fe8ff }),
  // ---------- 50 Skin-Ideen
  s('schattenkrieger', 'Schattenkrieger', 'epic', '⚔️', { head: 'mask', shirt: 0x1a1a24, pants: 0x101018, armor: 0x2a2a3a, glow: 0x5050ff }),
  s('feuerdaemon', 'Feuerdämon', 'legendary', '🔥', { head: 'flame', skin: 0x8a1a10, shirt: 0x8a1a10, pants: 0x3a0a08, wings: 0x5a0a08, glow: 0xff4010 }),
  s('eisritter', 'Eisritter', 'epic', '🧊', { head: 'helmet', visor: 0x9fe8ff, shirt: 0xc8e8ff, pants: 0x8ab0d0, armor: 0xe8f8ff, cape: 0x3a7ac8 }),
  s('blitzninja', 'Blitz Ninja', 'rare', '⚡', { head: 'ninja', shirt: 0x202030, pants: 0x202030, glow: 0xfff040, belt: 0xfff040 }),
  s('cyberkrieger', 'Cyber-Krieger', 'epic', '🤖', { head: 'robot', skin: 0x8a9aaa, shirt: 0x3a4a5a, pants: 0x2a3a4a, armor: 0x30e0ff, glow: 0x30e0ff }),
  s('gladiator', 'Goldener Gladiator', 'legendary', '🏛️', { head: 'helmet', visor: 0x111111, hatColor: 0xf0c030, shirt: 0xc89a30, pants: 0x8a2020, armor: 0xf0c030, cape: 0xa01818 }),
  s('phantom', 'Phantom', 'epic', '👻', { head: 'mask', skin: 0xf4f4f4, shirt: 0xe8e8f0, pants: 0xe8e8f0, cape: 0xd8d8e8, glow: 0x9fd8ff, ghost: true }),
  s('dunklerengel', 'Dunkler Engel', 'legendary', '🖤', { shirt: 0x15151a, pants: 0x15151a, wings: 0x111111, hair: 0xe8e8e8, glow: 0xff3050 }),
  s('lavamonster', 'Lava-Monster', 'epic', '🌋', { head: 'flame', skin: 0x3a2a26, shirt: 0x3a2a26, pants: 0x2a1a16, armor: 0xff6020, glow: 0xff6020, big: 1.15 }),
  s('diamantkrieger', 'Diamant-Krieger', 'legendary', '💎', { head: 'crystal', skin: 0x7ae8ff, shirt: 0x5ad0f0, pants: 0x3ab0d0, armor: 0xb0f8ff, glow: 0x7ae8ff }),
  s('banane', 'Bananenmann', 'uncommon', '🍌', { head: 'banana', skin: 0xf8e040, shirt: 0xf8e040, pants: 0xf0d030, shoes: 0x6a4a1a }),
  s('noob', 'Riesiger Noob', 'common', '🟦', { head: 'box', skin: 0xf8d830, shirt: 0x1aa0d8, pants: 0x3a8a3a, big: 1.3 }),
  s('kuehlschrank', 'Kühlschrank', 'uncommon', '🧊', { head: 'fridge', skin: 0xe8eef0, shirt: 0xe8eef0, pants: 0xc8ced0, shoes: 0x8a9096 }),
  s('toilette', 'Toiletten-Krieger', 'uncommon', '🚽', { head: 'toilet', skin: 0xf8f8f8, shirt: 0x6a7a8a, pants: 0x4a5a6a, armor: 0xf8f8f8 }),
  s('kartoffel', 'Tanzende Kartoffel', 'common', '🥔', { head: 'potato', skin: 0xb8904a, shirt: 0xb8904a, pants: 0xa07a3a, dance: true }),
  s('pizzamann', 'Pizza-Mann', 'uncommon', '🍕', { head: 'pizza', skin: 0xf0c060, shirt: 0xc02020, pants: 0xf4f4f4, hat: 'cap', hatColor: 0xc02020 }),
  s('alienhund', 'Alien-Hund', 'rare', '🐕', { head: 'dog', skin: 0x5adf6a, shirt: 0x3a8a4a, pants: 0x2a6a3a, glow: 0x7aff8a }),
  s('superopa', 'Super-Opa', 'rare', '👴', { hair: 0xe8e8e8, shirt: 0x2a50c8, pants: 0x2a50c8, cape: 0xc02020, glasses: true }),
  s('roboterente', 'Roboter-Ente', 'rare', '🦆', { head: 'duck', skin: 0xb0b8c0, shirt: 0x8a9298, pants: 0x6a7278, glow: 0xff8a20 }),
  s('kaktus', 'König Kaktus', 'epic', '🌵', { head: 'cactus', skin: 0x3a9a3a, shirt: 0x3a9a3a, pants: 0x2a7a2a, hat: 'crown', hatColor: 0xf5c518 }),
  s('drachenkoenig', 'Drachenkönig', 'mythic', '🐉', { head: 'dragon', skin: 0x2a8a3a, shirt: 0x1a5a2a, pants: 0x1a4a1a, wings: 0x2a6a2a, hat: 'crown', hatColor: 0xf5c518, glow: 0xffa020 }),
  s('hoellenfuerst', 'Höllenfürst', 'mythic', '😈', { head: 'devil', skin: 0xa01818, shirt: 0x2a0808, pants: 0x1a0505, cape: 0x6a0a0a, wings: 0x3a0a0a, glow: 0xff3010 }),
  s('eisdrache', 'Eisdrache', 'legendary', '🐲', { head: 'dragon', skin: 0x9fd8ff, shirt: 0x7ab8e8, pants: 0x5a98c8, wings: 0xc8eeff, glow: 0x9fe8ff }),
  s('phoenix', 'Goldener Phönix', 'mythic', '🐦‍🔥', { head: 'duck', skin: 0xf0b030, shirt: 0xf09020, pants: 0xd06010, wings: 0xf0c030, glow: 0xffd040 }),
  s('zeitreisender', 'Zeitreisender', 'epic', '⏳', { shirt: 0x5a3a1a, jacket: 0x3a2a1a, pants: 0x2a2a2a, hat: 'tophat', hatColor: 0x2a1a10, glasses: true, glow: 0x40ffd0 }),
  s('sternenkrieger', 'Sternenkrieger', 'epic', '⭐', { head: 'helmet', visor: 0xffe060, shirt: 0x1a2a6a, pants: 0x101a4a, armor: 0xffe060, cape: 0x1a2a6a, glow: 0xffe060 }),
  s('daemonenkoenig', 'Dämonenkönig', 'mythic', '👹', { head: 'devil', skin: 0x4a0a1a, shirt: 0x1a0a10, pants: 0x100508, hat: 'crown', hatColor: 0x8a0a1a, cape: 0x2a0510, glow: 0xff2040 }),
  s('galaxiegott', 'Galaxie-Gott', 'mythic', '🌌', { head: 'galaxy', skin: 0x3a1a8a, shirt: 0x2a1060, pants: 0x1a0840, cape: 0x4a20a0, glow: 0xc080ff, big: 1.1 }),
  s('kristallmagier', 'Kristallmagier', 'epic', '🔮', { shirt: 0x5a2a9a, pants: 0x3a1a6a, hat: 'wizard', hatColor: 0x5a2a9a, cape: 0x3a1a6a, glow: 0xc080ff, hair: 0xe8e8e8 }),
  s('schattenkoenig', 'Schattenkönig', 'mythic', '👑', { head: 'mask', shirt: 0x0c0c12, pants: 0x0c0c12, hat: 'crown', hatColor: 0x6a40c0, cape: 0x18102a, glow: 0x9a60ff }),
  s('zombie', 'Zombie', 'common', '🧟', { skin: 0x7aa85a, shirt: 0x3a6aa0, pants: 0x3a3a6a, hair: 0x2a3a1a }),
  s('skelett', 'Skelett', 'uncommon', '💀', { head: 'skull', skin: 0xeeeedd, shirt: 0xeeeedd, pants: 0xeeeedd, shoes: 0xeeeedd, bones: true }),
  s('vampir', 'Vampir', 'rare', '🧛', { skin: 0xe8e0e8, shirt: 0xf4f4f4, jacket: 0x111111, pants: 0x111111, cape: 0x8a0a1a, hair: 0x111111 }),
  s('werwolf', 'Werwolf', 'rare', '🐺', { head: 'wolf', skin: 0x5a4a3a, shirt: 0x6a5a4a, pants: 0x3a3a5a }),
  s('wissenschaftler', 'Mutierter Wissenschaftler', 'rare', '🧪', { skin: 0x9ad87a, shirt: 0xf4f4f4, pants: 0x3a3a3a, glasses: true, hair: 0xe8e8e8, glow: 0x7aff4a }),
  s('schleim', 'Gift-Schleim', 'uncommon', '🟢', { head: 'blob', skin: 0x7aff4a, shirt: 0x5adf3a, pants: 0x4ac02a, glow: 0x7aff4a }),
  s('radioaktiv', 'Radioaktives Monster', 'epic', '☢️', { head: 'blob', skin: 0xc8ff3a, shirt: 0x6a7a2a, pants: 0x4a5a1a, armor: 0xc8ff3a, glow: 0xc8ff3a }),
  s('cyberzombie', 'Cyber-Zombie', 'rare', '🦾', { skin: 0x7aa85a, shirt: 0x3a4a5a, pants: 0x2a3a4a, armor: 0x8a9aaa, glow: 0xff3030 }),
  s('geisterpirat', 'Geisterpirat', 'epic', '🏴‍☠️', { head: 'skull', skin: 0xc8f0e8, shirt: 0x2a3a3a, pants: 0x1a2a2a, hat: 'pirate', hatColor: 0x111111, ghost: true, glow: 0x7affd8 }),
  s('lavagolem', 'Lava-Golem', 'legendary', '🗿', { head: 'box', skin: 0x4a3a32, shirt: 0x4a3a32, pants: 0x3a2a22, armor: 0xff5010, glow: 0xff5010, big: 1.25 }),
  s('neonninja', 'Neon-Ninja', 'epic', '🌈', { head: 'ninja', shirt: 0x101018, pants: 0x101018, belt: 0xff30d0, glow: 0x30ffd0 }),
  s('astronaut', 'Astronaut', 'rare', '🚀', { head: 'helmet', visor: 0xf0c040, shirt: 0xf4f4f4, pants: 0xf4f4f4, shoes: 0x8a9096, pack: 0xd8dde4 }),
  s('samurai', 'Samurai', 'epic', '🏯', { head: 'helmet', visor: 0x111111, hatColor: 0x8a1a1a, shirt: 0x8a1a1a, pants: 0x1a1a1a, armor: 0x2a2a2a }),
  s('cowboy', 'Weltraum-Cowboy', 'epic', '🤠', { shirt: 0x8a5a2a, pants: 0x2a3a5a, hat: 'cowboy', hatColor: 0x6a4a2a, visorGlow: 0x30e0ff, glow: 0x30e0ff }),
  s('koenignacht', 'König der Nacht', 'legendary', '🌙', { skin: 0xd8e0f0, shirt: 0x101830, pants: 0x0c1020, hat: 'crown', hatColor: 0xc8d8ff, cape: 0x101830, glow: 0x9fb8ff }),
  s('magmaritter', 'Magma-Ritter', 'legendary', '🛡️', { head: 'helmet', visor: 0xff5010, hatColor: 0x3a2a26, shirt: 0x3a2a26, pants: 0x2a1a16, armor: 0xff5010, glow: 0xff5010 }),
  s('diamantdrache', 'Diamant-Drache', 'mythic', '💎', { head: 'dragon', skin: 0x7ae8ff, shirt: 0x5ad0f0, pants: 0x3ab0d0, wings: 0xb0f8ff, glow: 0x7ae8ff }),
  s('glitch', 'Glitch-Monster', 'legendary', '👾', { head: 'glitch', skin: 0xff30d0, shirt: 0x30ffd0, pants: 0x2a2a2a, glow: 0xff30d0 }),
  s('ultimativ', 'Ultimativer Krieger', 'mythic', '🏆', { head: 'helmet', visor: 0xff3030, hatColor: 0xf5c518, shirt: 0x2a2a2a, pants: 0x1a1a1a, armor: 0xf5c518, cape: 0xc01818, wings: 0xf5c518, glow: 0xffd040 }),
];
export const SKIN = Object.fromEntries(SKINS.map(x => [x.id, x]));
export const skinPrice = id => RARITY[SKIN[id].rarity].price;

/** Darf diese Rolle den Skin haben? */
export function skinAllowed(id, role) {
  const k = SKIN[id];
  if (!k) return false;
  if (k.only === 'admin') return role === 'admin';
  if (k.only === 'staff') return role === 'admin' || role === 'op';
  return true;
}

/** Ränge zum Kaufen (werden neben dem Namen angezeigt) */
export const RANKS = [
  { id: 'bronze', name: 'Bronze', emoji: '🥉', price: 1000 },
  { id: 'silber', name: 'Silber', emoji: '🥈', price: 3000 },
  { id: 'gold', name: 'Gold', emoji: '🥇', price: 8000 },
  { id: 'diamant', name: 'Diamant', emoji: '💎', price: 20000 },
  { id: 'koenig', name: 'König', emoji: '👑', price: 50000 },
  { id: 'legende', name: 'Legende', emoji: '🔥', price: 120000 },
  { id: 'mythisch', name: 'Mythisch', emoji: '🌌', price: 300000 },
  { id: 'galaxie', name: 'Galaxie', emoji: '🪐', price: 750000 },
];
export const RANK = Object.fromEntries(RANKS.map(r => [r.id, r]));
export const ROLE_BADGE = { admin: '🛡️', op: '⭐', player: '' };

/** Anzeigename mit Rang-Emoji und Rollen-Abzeichen */
export const displayName = (name, rank, role) => `${ROLE_BADGE[role] || ''}${RANK[rank] ? RANK[rank].emoji : ''} ${name}`.trim();

// ---------------------------------------------------------------- Shop
export const SHOP_SIZE = 8;
export const SHOP_DAYS = 2;
export const FREE_PER_MONTH = 2;
const DAY = 86400000;
export const shopPeriod = now => Math.floor(now / (SHOP_DAYS * DAY));
export const shopEndsAt = now => (shopPeriod(now) + 1) * SHOP_DAYS * DAY;

/** Skins im Shop: alle 2 Tage neu, für alle Spieler gleich */
export function shopSkins(now) {
  let seed = shopPeriod(now) * 7919 + 17;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pool = SKINS.filter(k => !k.only && k.id !== 'standard').map(k => k.id);
  const out = [];
  while (out.length < SHOP_SIZE && pool.length) out.push(pool.splice((rand() * pool.length) | 0, 1)[0]);
  return out;
}
export const monthKey = now => new Date(now).toISOString().slice(0, 7);
/** wie viele Gratis-Skins noch übrig sind */
export const freeLeft = (free, now) => (free && free.month === monthKey(now) ? Math.max(0, FREE_PER_MONTH - free.used) : FREE_PER_MONTH);
