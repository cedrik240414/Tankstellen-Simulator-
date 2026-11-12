import { describe, it, expect } from 'vitest';
import * as L from '../src/logic.js';
import { WEAPONS, ALTARS, W_IDX, WORLD_UNLOCK, SH } from '../src/config.js';

/** reproduzierbarer Zufall */
const seeded = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const many = (n, hour = 3) => { const r = seeded(7), out = []; for (let i = 0; i < n; i++) out.push(L.makeCustomer(hour, {}, r)); return out; };

describe('Ausweisprüfung', () => {
  const all = many(3000);
  it('jede Anomalie ist mit Ausweis + Register erkennbar', () => {
    for (const c of all.filter(c => c.an)) expect(L.findDiscrepancies(c).length, JSON.stringify(c)).toBeGreaterThan(0);
  });
  it('normale Kunden haben keine Abweichung', () => {
    for (const c of all.filter(c => !c.an)) expect(L.findDiscrepancies(c), JSON.stringify(c)).toEqual([]);
  });
  it('alle vier Anomalie-Arten kommen vor', () => {
    expect(new Set(all.filter(c => c.an).map(c => c.k))).toEqual(new Set([1, 2, 3, 4]));
  });
  it('der Ausweis-Status ist ein lesbarer Text (früher stand dort 0)', () => {
    for (const c of all) expect(['lebendig', 'TOT', 'HONK']).toContain(c.st);
  });
  it('Status TOT steht im Register, Kauf für Tote steht im Register der zweiten Person', () => {
    for (const c of all.filter(c => c.k === 1)) expect(c.rec.st).toBe('TOT');
    for (const c of all.filter(c => c.k === 4)) expect(c.wrec.st).toBe('TOT');
  });
  it('die Gans ist nie eine Anomalie', () => {
    const g = all.filter(c => c.goose);
    expect(g.length).toBeGreaterThan(0);
    for (const c of g) { expect(c.an).toBe(false); expect(c.name).toBe('Gans toll'); }
  });
  it('Geheimfiguren kommen höchstens einmal pro Schicht', () => {
    const flags = {}, r = seeded(3);
    const names = [];
    for (let i = 0; i < 2000; i++) { const c = L.makeCustomer(1, flags, r); if (L.isSecret(c)) names.push(c.name); }
    expect(names.sort()).toEqual(['Basti', 'König Oink', 'William Afton']);
  });
  it('König Oink unterschreibt mit "Legends Never dies"', () => {
    const flags = { af: 1, bg: 1 }, r = seeded(11);
    let c; do c = L.makeCustomer(1, flags, r); while (!c.rk);
    expect(c.sig).toBe('Legends Never dies');
    expect(L.findDiscrepancies(c)).toEqual([]);
  });
});

describe('Verkaufen, Ablehnen, Erschießen', () => {
  const human = { an: false, age: 30, it: ['Bier', 5, 16] };
  const minor = { an: false, age: 14, it: ['Bier', 5, 16] };
  const anomaly = { an: true, age: 30, it: ['Chips', 3, 0] };
  it('Verkauf an Erwachsene bringt Geld', () => expect(L.sellOutcome(human)).toMatchObject({ money: 5 }));
  it('Geld-Multiplikator wirkt', () => expect(L.sellOutcome(human, 2).money).toBe(10));
  it('Bier an 14-Jährige: Strafe und Beschwerde', () => expect(L.sellOutcome(minor)).toMatchObject({ money: -10, complaint: 1 }));
  it('Zigaretten erst ab 18', () => expect(L.sellOutcome({ an: false, age: 17, it: ['Zigaretten', 8, 18] }).complaint).toBe(1));
  it('Verkauf an Anomalie ist ein Fehler', () => expect(L.sellOutcome(anomaly).mistake).toBe(1));
  it('Anomalie erschießen bringt 10€, kein Fehler', () => { const o = L.shootOutcome(anomaly); expect(o.money).toBe(10); expect(o.mistake).toBeUndefined(); });
  it('Menschen erschießen ist ein Fehler', () => expect(L.shootOutcome(human).mistake).toBe(1));
  it('die Gans erschießen ist ein Fehler', () => expect(L.shootOutcome({ goose: true, an: false }).mistake).toBe(1));
  it('Anomalie ablehnen oder ignorieren ist ein Fehler', () => {
    expect(L.refuseOutcome(anomaly).mistake).toBe(1);
    expect(L.ignoreOutcome(anomaly).mistake).toBe(1);
  });
  it('Menschen ablehnen ist ok, ignorieren gibt eine Beschwerde', () => {
    expect(L.refuseOutcome(human).mistake).toBeUndefined();
    expect(L.ignoreOutcome(human).complaint).toBe(1);
  });
  it('Geheimfiguren zahlen 30€ extra', () => expect(L.sellOutcome({ af: 1, an: false, age: 45, it: ['Chips', 3, 0], name: 'x' }).money).toBe(33));
});

describe('Welten freischalten', () => {
  it('Tankstelle ist immer offen', () => expect(L.worldUnlocked('tank', 0)).toBe(true));
  it('Schwellen kommen aus der Konfiguration', () => {
    for (const [w, n] of Object.entries(WORLD_UNLOCK)) {
      expect(L.worldUnlocked(w, n)).toBe(true);
      if (n > 0) expect(L.worldUnlocked(w, n - 1)).toBe(false);
    }
  });
  it('Halloween öffnet erst, wenn alle anderen Welten offen sind', () => {
    const max = Math.max(...Object.values(WORLD_UNLOCK));
    expect(L.worldUnlocked('hallo', max - 1)).toBe(false);
    expect(L.worldUnlocked('hallo', max)).toBe(true);
    for (let s = 0; s < 40; s++) if (L.worldUnlocked('hallo', s)) for (const w of Object.keys(WORLD_UNLOCK)) expect(L.worldUnlocked(w, s)).toBe(true);
  });
  it('Admin hat alles offen', () => expect(L.worldUnlocked('hallo', 0, true)).toBe(true));
});

describe('Waffen und Altäre', () => {
  it('50 Grundwaffen + Messer + Sonder- und Event-Waffen, alle mit Namen und Schaden', () => {
    expect(WEAPONS.length).toBe(61);
    for (const w of WEAPONS) { expect(w.name).toBeTruthy(); expect(w.dmg).toBeGreaterThan(0); }
    expect(new Set(WEAPONS.map(w => w.name)).size).toBe(61);
  });
  it('Rangliste der Altar-Waffen stimmt mit der zentralen Tabelle', () => {
    for (const a of Object.values(ALTARS)) expect(L.weaponRank(a.weapon)).toBe(a.rank);
  });
  it('Halloween stärkste, Piraten 2., Winter und Pizzeria 3., Tankstelle 4.', () => {
    expect(L.weaponRank(W_IDX.halloAltar)).toBe(1);
    expect(L.weaponRank(W_IDX.pirateAltar)).toBe(2);
    expect(L.weaponRank(W_IDX.winterAltar)).toBe(3);
    expect(L.weaponRank(W_IDX.pizzaAltar)).toBe(3);
    expect(L.weaponRank(W_IDX.tankAltar)).toBe(4);
  });
  it('Altar-Waffen kann man nicht kaufen', () => {
    for (const a of Object.values(ALTARS)) expect(L.canBuyWeapon(a.weapon, [0], 1e9).ok).toBe(false);
    expect(L.canBuyWeapon(W_IDX.knife, [0], 1e9).ok).toBe(false);
  });
  it('Shop-Waffe kaufen: Preis und genug Geld', () => {
    expect(L.canBuyWeapon(5, [0], 0).ok).toBe(false);
    expect(L.canBuyWeapon(5, [0], 1e6)).toMatchObject({ ok: true, price: WEAPONS[5].price });
    expect(L.canBuyWeapon(5, [0, 5], 1e6).ok).toBe(false);
  });
  it('Schaden steigt mit Waffenstufe und Upgrade', () => {
    expect(L.weaponDamage(10, 2, 0)).toBe(WEAPONS[10].dmg * 2);
    expect(L.weaponDamage(10, 1, 2)).toBe(Math.round(WEAPONS[10].dmg * 1.5));
  });
  it('Schädel-Altar braucht 10 Schädel', () => {
    expect(L.useAltar('tank', { skulls: 9, heads: 0, worldShifts: 0, own: [] }).ok).toBe(false);
    expect(L.useAltar('tank', { skulls: 10, heads: 0, worldShifts: 0, own: [] })).toMatchObject({ ok: true, weapon: W_IDX.tankAltar });
    expect(L.useAltar('tank', { skulls: 10, heads: 0, worldShifts: 0, own: [W_IDX.tankAltar] }).ok).toBe(false);
  });
  it('Pizzeria-Altar braucht 8 Köpfe', () => {
    expect(L.useAltar('pizza', { skulls: 10, heads: 7, worldShifts: 99, own: [] }).ok).toBe(false);
    expect(L.useAltar('pizza', { skulls: 0, heads: 8, worldShifts: 0, own: [] }).weapon).toBe(W_IDX.pizzaAltar);
  });
  it('Welt-Altäre zählen Schichten in genau dieser Welt', () => {
    for (const [w, n] of [['winter', 20], ['pirate', 25], ['hallo', 30]]) {
      expect(L.useAltar(w, { skulls: 10, heads: 8, worldShifts: n - 1, own: [] }).ok).toBe(false);
      expect(L.useAltar(w, { skulls: 0, heads: 0, worldShifts: n, own: [] }).ok).toBe(true);
    }
  });
  it('Halloween-Altar startet einen Bosskampf', () => expect(L.useAltar('hallo', { worldShifts: 30, own: [] }).boss).toBe(true));
  it('Welten ohne eigenen Altar nutzen den Schädel-Altar', () => expect(L.altarFor('alien')).toBe(ALTARS.tank));
});

describe('Schichten und Belohnungen', () => {
  it('Messer ab der 4. Schicht', () => {
    expect(L.shiftRewards('x', 3, [0]).knife).toBe(false);
    expect(L.shiftRewards('x', 4, [0]).knife).toBe(true);
    expect(L.shiftRewards('x', 5, [0, W_IDX.knife]).knife).toBe(false);
  });
  it('Dinnerboneagg bekommt nach der 4. Schicht 100€ (beide Schreibweisen)', () => {
    expect(L.shiftRewards('Dinnerboneagg', 4, [0]).bonus).toBe(100);
    expect(L.shiftRewards('dinnerbonegg', 4, [0]).bonus).toBe(100);
    expect(L.shiftRewards('Dinnerboneagg', 5, [0]).bonus).toBe(0);
    expect(L.shiftRewards('andere', 4, [0]).bonus).toBe(0);
  });
  it('Uhr: Tankstelle ab 00:00, Backrooms ab 22:00', () => {
    expect(L.clock(0, 'tank')).toBe('00:00');
    expect(L.clock(125, 'tank')).toBe('02:05');
    expect(L.clock(0, 'back')).toBe('22:00');
    expect(L.clock(600, 'back')).toBe('08:00');
  });
  it('Leben wachsen mit Upgrade und Möbeln', () => {
    expect(L.hpMax({ hp: 0 }, 0)).toBe(5);
    expect(L.hpMax({ hp: 2 }, 6)).toBe(9);
  });
});

it('jedes Regal hat Waren mit Preis und Mindestalter', () => {
  for (const [, items] of Object.values(SH)) for (const it of items) { expect(it[1]).toBeGreaterThan(0); expect(it[2]).toBeGreaterThanOrEqual(0); }
});
