import { describe, it, expect } from 'vitest';
import { SKINS, SKIN, RARITY, shopSkins, shopEndsAt, freeLeft, monthKey, skinAllowed, skinPrice, displayName, RANKS, SHOP_SIZE } from '../src/content.js';
import { STORY, eventReward, EVENT_TITLES, EV_WEAPON } from '../src/events.js';
import { upgradeCost, weaponLevelCost, WEAPONS } from '../src/config.js';

const DAY = 86400000, T0 = Date.UTC(2026, 10, 12, 10);

describe('Skins', () => {
  it('alle gewünschten Skins gibt es', () => {
    for (const id of ['anzug', 'lila', 'kuerbis', 'winter', 'maskiert', 'soldat', 'alien', 'backrooms', 'hoodie', 'bauchtasche', 'strohhut', 'frosch', 'benni', 'hacker', 'admin']) expect(SKIN[id], id).toBeTruthy();
  });
  it('alle 50 Skin-Ideen und die Custom-Skins aus dem Video sind dabei', () => {
    for (const n of ['Schattenkrieger', 'Bananenmann', 'Drachenkönig', 'Zombie', 'Neon-Ninja', 'Ultimativer Krieger', 'Shadow Ninja', 'Lava Warrior', 'Tankstellen-Mechaniker', 'Space Explorer'])
      expect(SKINS.some(k => k.name === n), n).toBe(true);
    expect(SKINS.length).toBeGreaterThanOrEqual(70);
  });
  it('jeder Skin hat eine gültige Seltenheit und eindeutige ID', () => {
    for (const k of SKINS) expect(RARITY[k.rarity], k.id).toBeTruthy();
    expect(new Set(SKINS.map(k => k.id)).size).toBe(SKINS.length);
  });
  it('Admin-Skin nur für Admins, Hacker-Skin für Admins und OPs', () => {
    expect(skinAllowed('admin', 'admin')).toBe(true);
    expect(skinAllowed('admin', 'op')).toBe(false);
    expect(skinAllowed('hacker', 'op')).toBe(true);
    expect(skinAllowed('hacker', 'player')).toBe(false);
    expect(skinAllowed('frosch', 'player')).toBe(true);
  });
  it('Anzug hat eine einstellbare Krawatte', () => expect(SKIN.anzug.look.tie).toBe(true));
  it('Preis kommt aus der Seltenheit', () => expect(skinPrice('frosch')).toBe(RARITY.uncommon.price));
});

describe('Shop', () => {
  it('zeigt 8 Skins, alle 2 Tage neu, nie Admin/Hacker', () => {
    const a = shopSkins(T0);
    expect(a.length).toBe(SHOP_SIZE);
    expect(a).not.toContain('admin'); expect(a).not.toContain('hacker');
    const periodStart = shopEndsAt(T0) - 2 * DAY;
    expect(shopSkins(periodStart)).toEqual(shopSkins(periodStart + 2 * DAY - 1));
    expect(shopSkins(periodStart + 2 * DAY)).not.toEqual(a);
  });
  it('2 Gratis-Skins pro Monat', () => {
    expect(freeLeft(null, T0)).toBe(2);
    expect(freeLeft({ month: monthKey(T0), used: 1 }, T0)).toBe(1);
    expect(freeLeft({ month: monthKey(T0), used: 2 }, T0)).toBe(0);
    expect(freeLeft({ month: '2026-10', used: 2 }, T0)).toBe(2);
  });
});

describe('Ränge', () => {
  it('Emoji steht neben dem Namen, Rollen-Abzeichen davor', () => {
    expect(displayName('Mia', 'gold', 'player')).toBe('🥇 Mia');
    expect(displayName('crim', '', 'admin')).toBe('🛡️ crim');
    expect(displayName('Dinnerboneagg', 'koenig', 'op')).toBe('⭐👑 Dinnerboneagg');
  });
  it('Ränge werden teurer', () => { for (let i = 1; i < RANKS.length; i++) expect(RANKS[i].price).toBeGreaterThan(RANKS[i - 1].price); });
});

describe('Unendliche Upgrades', () => {
  it('jede Stufe kostet mehr, auch Stufe 50', () => {
    for (const k of ['mm', 'dm', 'hp']) for (let l = 0; l < 50; l++) expect(upgradeCost(k, l + 1)).toBeGreaterThan(upgradeCost(k, l));
    expect(weaponLevelCost(30)).toBeGreaterThan(weaponLevelCost(29));
  });
});

describe('Events', () => {
  it('genau 15 Story-Events', () => { expect(STORY.length).toBe(15); expect(EVENT_TITLES[0]).toBe('1. The Dark Point'); });
  it('jedes Event hat Kameraeinstellungen mit Text', () => { for (const e of STORY) { expect(e.shots.length).toBeGreaterThan(1); for (const s of e.shots) expect(s.text).toBeTruthy(); } });
  it('Belohnung: Geld für alle, Waffe nur für ausgewählte Spieler (etwa jeder Dritte)', () => {
    let weapons = 0;
    for (let i = 0; i < 300; i++) { const r = eventReward(5, 'e1', 'Spieler' + i); expect(r.money).toBe(500); if (r.weapon != null) { weapons++; expect(r.weapon).toBe(EV_WEAPON.blaster); } }
    expect(weapons).toBeGreaterThan(60); expect(weapons).toBeLessThan(140);
    expect(eventReward(3, 'e9', 'x').weapon).toBeNull();
  });
  it('Event 1 schenkt allen Teilnehmern den Skin Schwarz Maskiert', () => {
    for (let i = 0; i < 30; i++) expect(eventReward(1, 'e1', 'Spieler' + i)).toMatchObject({ skin: 'maskiert', money: 300 });
    expect(eventReward(2, 'e2', 'x').skin).toBeNull();
  });
  it('Dark Blade bei Event 1: etwa jeder Zweite, Admins immer', () => {
    let n = 0;
    for (let i = 0; i < 400; i++) if (eventReward(1, 'e7', 'Spieler' + i, 'player').weapon === EV_WEAPON.blade) n++;
    expect(n).toBeGreaterThan(150); expect(n).toBeLessThan(250);
    for (let i = 0; i < 50; i++) expect(eventReward(1, 'e7', 'Admin' + i, 'admin').weapon).toBe(EV_WEAPON.blade);
    // bei anderen Events haben Admins keinen Vorteil
    let a = 0; for (let i = 0; i < 300; i++) if (eventReward(5, 'e8', 'Admin' + i, 'admin').weapon != null) a++;
    expect(a).toBeLessThan(150);
  });
  it('Event-Waffen existieren', () => { for (const i of Object.values(EV_WEAPON)) expect(WEAPONS[i].lock).toBe('🔒 Event'); });
});
