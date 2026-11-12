import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, memoryStorage } from '../src/storage.js';
import { hashPw } from '../src/logic.js';

let ls, st;
beforeEach(() => { ls = memoryStorage(); st = createStore(ls); });

describe('Login', () => {
  it('neue Spieler werden angelegt, Passwort wird geprüft', () => {
    expect(st.login('Mia', 'abc').ok).toBe(true);
    expect(st.login('Mia', 'abc').ok).toBe(true);
    expect(st.login('Mia', 'falsch').ok).toBe(false);
  });
  it('Passwort wird nur als Hash gespeichert', () => {
    st.login('Mia', 'geheim');
    expect(ls.getItem('ns_users')).not.toContain('geheim');
    expect(JSON.parse(ls.getItem('ns_users')).Mia).toBe(hashPw('geheim'));
  });
  it('zu kurze Eingaben werden abgelehnt', () => {
    expect(st.login('M', 'abc').ok).toBe(false);
    expect(st.login('Mia', 'ab').ok).toBe(false);
  });
  it('Admin crim nur mit Hotdog24', () => {
    expect(st.login('crim', 'Hotdog24')).toEqual({ ok: true, admin: true });
    expect(st.login('crim', 'hotdog24').ok).toBe(false);
  });
});

describe('Schichten', () => {
  it('zählt gesamt und pro Welt getrennt', () => {
    st.recordShift('Mia', 'tank'); st.recordShift('Mia', 'tank'); st.recordShift('Mia', 'winter');
    expect(st.shifts('Mia')).toBe(3);
    expect(st.worldShifts('Mia', 'tank')).toBe(2);
    expect(st.worldShifts('Mia', 'winter')).toBe(1);
    expect(st.worldShifts('Mia', 'pirate')).toBe(0);
    expect(st.shifts('Tom')).toBe(0);
  });
});

describe('Geschenke und Bonus', () => {
  it('1000€ Geschenk nur einmal, für beide Schreibweisen', () => {
    expect(st.takeGift('Dinnerboneagg')).toBe(1000);
    expect(st.takeGift('Dinnerboneagg')).toBe(0);
    expect(st.takeGift('dinnerbonegg')).toBe(1000);
    expect(st.takeGift('Tom')).toBe(0);
  });
  it('Bonus wird einmal ausgezahlt', () => {
    st.addBonus('Mia', 100);
    expect(st.takeBonus('Mia')).toBe(100);
    expect(st.takeBonus('Mia')).toBe(0);
  });
});

describe('Fortschritt', () => {
  it('speichert und lädt Geld, Waffen, Möbel, Items, Upgrades, Schädel, Köpfe', () => {
    const S = { m: 321, wl: 2, fu: [0, 3], it: { wood: 2, trap: 1, bomb: 0, elek: 0 }, gate: 1, own: [0, 5, 50], wi: 5, up: { mm: 1, dm: 0, hp: 2 }, sk: 4, ah: 2, t: 99 };
    st.saveProgress('Mia', S);
    const T = { m: 0, own: [0], up: { mm: 0, dm: 0, hp: 0 } };
    expect(st.loadProgress('Mia', T)).toBe(true);
    expect(T).toMatchObject({ m: 321, wl: 2, fu: [0, 3], gate: 1, own: [0, 5, 50], wi: 5, up: { mm: 1, dm: 0, hp: 2 }, sk: 4, ah: 2 });
    expect(T.t).toBeUndefined();
  });
  it('kein Stand: nichts ändert sich', () => {
    const T = { m: 20 };
    expect(st.loadProgress('Niemand', T)).toBe(false);
    expect(T.m).toBe(20);
  });
  it('alte Spielstände ohne neue Felder werden ergänzt', () => {
    ls.setItem('ns_prog', JSON.stringify({ Alt: { m: 50, wl: 1, fu: [], it: {}, gate: 0 } }));
    const T = {};
    st.loadProgress('Alt', T);
    expect(T).toMatchObject({ m: 50, own: [0], wi: 0, up: { mm: 0, dm: 0, hp: 0 }, sk: 0, ah: 0 });
  });
  it('kaputter localStorage-Inhalt stürzt nicht ab', () => {
    ls.setItem('ns_shifts', '{kaputt');
    expect(st.shifts('Mia')).toBe(0);
  });
});
