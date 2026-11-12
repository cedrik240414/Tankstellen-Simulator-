// Reine Spiellogik ohne DOM und ohne three.js – wird von den Tests geprüft.
import {
  YEAR, FN, LN, SH, WEAPONS, ALTARS, WORLD_UNLOCK, ADMIN_NAME, GIFT_NAMES, GIFT_SHIFT, KNIFE_AT_SHIFT, W_IDX,
} from './config.js';

export const pickR = (a, rand = Math.random) => a[(rand() * a.length) | 0];
export const rndR = (n, rand = Math.random) => (rand() * n) | 0;

/** Schwacher Spiel-Hash für lokale Passwörter (keine echte Sicherheit!). */
export const hashPw = s => [...s].reduce((x, c) => ((x * 33) ^ c.charCodeAt(0)) >>> 0, 5381);
export const isAdmin = name => name === ADMIN_NAME;

/**
 * Erzeugt einen Kunden. `flags` merkt sich, welche Geheimfiguren in dieser Schicht schon da waren.
 * Anomalie-Arten (k): 1 = Status TOT, 2 = falsche Unterschrift, 3 = falsches Alter,
 * 4 = kauft für eine tote Person.
 */
export function makeCustomer(hour, flags = {}, rand = Math.random) {
  const pick = a => pickR(a, rand), rnd = n => rndR(n, rand);
  const goose = rand() < 0.07;
  const an = !goose && rand() < 0.12 + hour * 0.05;
  const sk = goose ? 'snack' : pick(Object.keys(SH));
  const it = pick(SH[sk][1]);
  const c = {
    sk, it, name: pick(FN) + ' ' + pick(LN), age: 18 + rnd(50), st: 'lebendig', who: null, an, goose,
    em: pick(['🧑', '👩', '👨', '🧔', '👵', '👴']),
  };
  if (!an && !goose && rand() < 0.2) c.age = 12 + rnd(7);
  c.born = YEAR - c.age;
  c.sig = c.name;
  if (!goose && rand() < 0.3) c.who = pick(FN) + ' ' + pick(LN);
  if (goose) { c.name = 'Gans toll'; c.sig = '🪿'; c.st = 'HONK'; c.age = '?'; c.born = '?'; }
  c.rec = { name: c.name, age: c.age, born: c.born, sig: c.sig, st: goose ? 'HONK (harmlos)' : 'lebendig' };
  if (an) {
    const r = rnd(4);
    c.k = r + 1;
    if (r === 0) { c.st = 'TOT'; c.rec.st = 'TOT'; }
    else if (r === 1) c.sig = c.name.slice(0, -1) + (c.name.slice(-1) === 's' ? 't' : 's');
    else if (r === 2) { const k = 3 + rnd(9); c.age += k; c.born -= k; }
    else { c.who = c.who || pick(FN) + ' ' + pick(LN); c.dead = 1; }
  }
  if (c.who) { const a = 20 + rnd(40); c.wrec = { name: c.who, age: a, born: YEAR - a, sig: c.who, st: c.dead ? 'TOT' : 'lebendig' }; }
  const secret = (key, name, age, sig) => {
    flags[key] = 1; c[key] = 1; c.name = name; c.age = age; c.born = YEAR - age; c.sig = sig || name; c.who = null; delete c.wrec;
    c.rec = { name, age, born: c.born, sig: c.sig, st: 'lebendig' };
  };
  if (!goose && !an) {
    if (!flags.af && rand() < 0.06) secret('af', 'William Afton', 45);
    else if (!flags.bg && rand() < 0.07) secret('bg', 'Basti', 28);
    else if (!flags.rk && rand() < 0.07) secret('rk', 'König Oink', 33, 'Legends Never dies');
  }
  c.say = goose ? 'HONK! Die Gans möchte ' + it[0] + '.' : `Ich hätte gern ${it[0]}.` + (c.who ? ` Das ist für ${c.who}.` : '');
  return c;
}

/** Was der Spieler mit Ausweis + Register herausfinden kann. Liste der gefundenen Abweichungen. */
export function findDiscrepancies(c) {
  const d = [];
  if (c.st === 'TOT') d.push('status');
  if (c.sig !== c.rec.sig) d.push('signature');
  if (c.age !== c.rec.age || c.born !== c.rec.born) d.push('age');
  if (c.wrec && c.wrec.st === 'TOT') d.push('buysForDead');
  return d;
}

export const isSecret = c => !!(c.af || c.bg || c.rk);

/** Ergebnis-Objekte: money (Delta), mistake, complaint, blood, msg */
export function sellOutcome(c, mmLevel = 0) {
  const [, price, minAge] = c.it;
  if (c.an) return { mistake: 1, msg: 'Du hast etwas Unmenschliches bedient. Es grinst im Gehen...' };
  if (typeof c.age === 'number' && c.age < minAge) return { money: -10, complaint: 1, msg: 'Minderjährig! 10€ Strafe und eine Beschwerde.' };
  const gain = Math.round((price + (isSecret(c) ? 30 : 0)) * (1 + 0.5 * mmLevel));
  const msg = c.goose ? 'HONK! Die Gans watschelt zufrieden davon. +' + gain + '€'
    : isSecret(c) ? c.name + ' lächelt freundlich. Geheimnis entdeckt! +' + gain + '€' : '+' + gain + '€';
  return { money: gain, sold: 1, msg };
}
export function shootOutcome(c) {
  if (c.an) return { money: 10, blood: 1, msg: 'Es zerfällt. +10€. Da ist Blut auf dem Boden.' };
  return {
    mistake: 1, blood: 1,
    msg: c.goose ? 'Du hast die Gans erschossen. Sie war harmlos!' : isSecret(c) ? c.name + ' war gar nicht böse...' : 'Das war ein Mensch...',
  };
}
export function refuseOutcome(c) {
  return c.an ? { mistake: 1, msg: 'Es sieht dich lange an und geht. Es lebt noch.' } : { msg: 'Kunde geht.' };
}
export function ignoreOutcome(c) {
  return c.an ? { mistake: 1, msg: 'Du ignorierst es. Es verschwindet in der Nacht...' } : { complaint: 1, msg: 'Kunde ignoriert und genervt gegangen.' };
}

// ---------------------------------------------------------------- Welten
export function unlockShifts(id) {
  if (id === 'hallo') return Math.max(...Object.values(WORLD_UNLOCK));
  return WORLD_UNLOCK[id] ?? Infinity;
}
/** Halloween öffnet erst, wenn alle anderen Welten offen sind. */
export function worldUnlocked(id, shifts, admin = false) {
  if (admin) return true;
  if (id === 'hallo') return Object.keys(WORLD_UNLOCK).every(w => worldUnlocked(w, shifts)) && shifts >= unlockShifts('hallo');
  return shifts >= unlockShifts(id);
}

// ---------------------------------------------------------------- Waffen & Leben
export const weaponDamage = (i, wl = 1, dmLvl = 0) => Math.round(WEAPONS[i].dmg * wl * (1 + 0.25 * dmLvl));
export const hpMax = (up, furnitureCount) => 5 + up.hp + ((furnitureCount / 3) | 0);
/** dichte Rangliste nach Schaden (1 = stärkste) */
export function weaponRank(i) {
  const levels = [...new Set(WEAPONS.map(w => w.dmg))].sort((a, b) => b - a);
  return levels.indexOf(WEAPONS[i].dmg) + 1;
}
export function canBuyWeapon(i, own, money) {
  const w = WEAPONS[i];
  if (own.includes(i)) return { ok: false, msg: 'Die Waffe hast du schon.' };
  if (w.lock) return { ok: false, msg: 'Diese Waffe gibt es nicht im Shop.' };
  if (money < w.price) return { ok: false, msg: 'Zu wenig Geld.' };
  return { ok: true, price: w.price };
}

// ---------------------------------------------------------------- Altäre
/** Altar für eine Welt. Welten ohne eigenen Altar nutzen den Schädel-Altar. */
export const altarFor = world => ALTARS[world] || ALTARS.tank;
export function altarProgress(world, ctx) {
  const a = altarFor(world);
  const have = a.need === 'skulls' ? ctx.skulls : a.need === 'heads' ? ctx.heads : ctx.worldShifts;
  const unit = a.need === 'skulls' ? 'Schädel' : a.need === 'heads' ? 'Köpfe' : 'Schichten';
  return { have, need: a.count, unit, text: `${have}/${a.count} ${unit}` };
}
/** ctx: { skulls, heads, worldShifts, own } → { ok, msg, weapon, boss } */
export function useAltar(world, ctx) {
  const a = altarFor(world), p = altarProgress(world, ctx);
  if (p.have < p.need) {
    const where = a.need === 'shifts' ? ' in dieser Welt' : '';
    return { ok: false, msg: `Der Altar verlangt ${p.need} ${p.unit}${where} (${p.have}/${p.need}).` };
  }
  if (ctx.own.includes(a.weapon)) return { ok: false, msg: 'Du hast die Waffe schon.' };
  return { ok: true, weapon: a.weapon, boss: !!a.boss, msg: 'Der Altar schenkt dir ' + WEAPONS[a.weapon].name + '!' };
}

// ---------------------------------------------------------------- Schichten
/** Belohnungen nach einer geschafften Schicht (totalShifts = neuer Gesamtstand). */
export function shiftRewards(name, totalShifts, own) {
  const r = { knife: false, bonus: 0 };
  if (totalShifts >= KNIFE_AT_SHIFT && !own.includes(W_IDX.knife)) r.knife = true;
  if (GIFT_NAMES.includes(String(name).toLowerCase()) && totalShifts === GIFT_SHIFT.at) r.bonus = GIFT_SHIFT.amount;
  return r;
}

/** Uhrzeit als "HH:MM" */
export function clock(t, world) {
  const h = (((t / 60) | 0) + (world === 'back' ? 22 : 0)) % 24;
  return String(h).padStart(2, '0') + ':' + String(t % 60 | 0).padStart(2, '0');
}
