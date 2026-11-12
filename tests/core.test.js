import { describe, it, expect, beforeEach } from 'vitest';
import { handle, EVENT_JOIN_MS, EVENT_LIVE_MS, OP_BONUS, eventPhase } from '../src/shared/core.js';
import { sha256 } from '../src/shared/sha256.js';

let db, mem, now, seed;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const call = (path, body = {}, token) => handle(db, mem, { path, body, token }, now, rand);
const login = (name, pw = 'abc') => call('login', { name, pw }).body;

beforeEach(() => {
  const m = new Map();
  db = { get: k => (m.has(k) ? m.get(k) : null), put: (k, v) => m.set(k, v) };
  mem = {}; now = 1_800_000_000_000; seed = 12345;
});

it('sha256 stimmt', () => expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));

describe('Login und Rollen', () => {
  it('neuer Spieler, falsches Passwort', () => {
    expect(login('Mia').ok).toBe(true);
    expect(login('Mia', 'falsch').ok).toBe(false);
    expect(login('Mia').ok).toBe(true);
  });
  it('Admin nur mit Hotdog24', () => {
    expect(login('crim', 'x').ok).toBe(false);
    expect(login('crim', 'Hotdog24')).toMatchObject({ ok: true, role: 'admin' });
  });
  it('Dinnerboneagg ist OP und bekommt 1000', () => {
    const r = login('Dinnerboneagg');
    expect(r.role).toBe('op');
    expect(call('state', {}, r.token).body.me.pending).toBe(OP_BONUS);
  });
  it('Passwort wird nicht im Klartext gespeichert', () => {
    login('Mia', 'geheim123');
    expect(db.get('p:Mia')).not.toContain('geheim123');
  });
});

describe('Rangliste und Speichern', () => {
  it('sortiert nach Schichten, zeigt Rang und Skin', () => {
    const a = login('Anna').token, b = login('Ben').token;
    call('save', { shifts: 3, money: 10, rank: 'gold', skin: 'frosch' }, a);
    call('save', { shifts: 7, money: 5 }, b);
    const lb = call('state').body.leaderboard;
    expect(lb.map(x => x.name)).toEqual(['Ben', 'Anna']);
    expect(lb[1]).toMatchObject({ rank: 'gold', skin: 'frosch' });
  });
  it('Spielstand geräteübergreifend laden', () => {
    const t = login('Anna').token;
    call('save', { data: { m: 99, skins: ['frosch'] } }, t);
    const t2 = login('Anna').token;
    expect(call('load', {}, t2).body.data).toEqual({ m: 99, skins: ['frosch'] });
  });
});

describe('Admin', () => {
  let adm, mia;
  beforeEach(() => { adm = login('crim', 'Hotdog24').token; mia = login('Mia').token; });
  it('Spieler können keine Admin-Aktionen', () => {
    expect(call('admin_players', {}, mia).status).toBe(403);
    expect(call('admin_act', { target: 'crim', act: 'ban' }, mia).status).toBe(403);
  });
  it('Liste aller Spieler', () => {
    expect(call('admin_players', {}, adm).body.players.map(p => p.name).sort()).toEqual(['Mia', 'crim']);
  });
  it('Geld geben und abziehen kommt als pending an und wird quittiert', () => {
    call('admin_act', { target: 'Mia', act: 'money', amount: 500 }, adm);
    call('admin_act', { target: 'Mia', act: 'money', amount: -200 }, adm);
    expect(call('state', {}, mia).body.me.pending).toBe(300);
    call('save', { ackPending: 300 }, mia);
    expect(call('state', {}, mia).body.me.pending).toBe(0);
  });
  it('bannen sperrt Login und Anfragen, entbannen hebt es auf', () => {
    call('admin_act', { target: 'Mia', act: 'ban' }, adm);
    expect(call('state', {}, mia).status).toBe(403);
    expect(login('Mia').ok).toBe(false);
    expect(call('state').body.leaderboard.map(x => x.name)).not.toContain('Mia');
    call('admin_act', { target: 'Mia', act: 'unban' }, adm);
    expect(login('Mia').ok).toBe(true);
  });
  it('Admin geben: neuer Admin darf Admin-Sachen und bekommt einmal 1000', () => {
    call('admin_act', { target: 'Mia', act: 'role', role: 'admin' }, adm);
    expect(call('admin_players', {}, mia).body.ok).toBe(true);
    expect(call('state', {}, mia).body.me.pending).toBe(OP_BONUS);
    call('admin_act', { target: 'Mia', act: 'role', role: 'player' }, adm);
    call('admin_act', { target: 'Mia', act: 'role', role: 'op' }, adm);
    expect(call('state', {}, mia).body.me.pending).toBe(OP_BONUS);
  });
  it('allen Spielern Geld geben (gebannte nicht), nur Admins dürfen das', () => {
    const ben = login('Ben').token;
    call('admin_act', { target: 'Ben', act: 'ban' }, adm);
    expect(call('admin_all', { act: 'money', amount: 250 }, mia).status).toBe(403);
    expect(call('admin_all', { act: 'money', amount: 250 }, adm).body.count).toBe(2);
    expect(call('state', {}, mia).body.me.pending).toBe(250);
    call('admin_act', { target: 'Ben', act: 'unban' }, adm);
    expect(call('state', {}, ben).body.me.pending).toBe(0);
    call('admin_all', { act: 'money', amount: -100 }, adm);
    expect(call('state', {}, mia).body.me.pending).toBe(150);
  });
  it('Haupt-Admin ist geschützt', () => {
    call('admin_act', { target: 'Mia', act: 'role', role: 'admin' }, adm);
    expect(call('admin_act', { target: 'crim', act: 'ban' }, mia).body.ok).toBe(false);
  });
});

describe('Events', () => {
  it('Countdown -> 10 Min Beitritt -> Live -> vorbei', () => {
    const adm = login('crim', 'Hotdog24').token, mia = login('Mia').token;
    const r = call('admin_event_create', { type: 10, startAt: now + 60000 }, adm);
    const id = r.body.event.id;
    expect(call('event_join', { id }, mia).body.ok).toBe(false); // Countdown
    now += 60000;
    expect(call('state', {}, mia).body.events[0].phase).toBe('join');
    expect(call('event_join', { id }, mia).body.ok).toBe(true);
    expect(call('state', {}, mia).body.events[0]).toMatchObject({ iJoined: true, joined: 1 });
    now += EVENT_JOIN_MS;
    expect(call('state', {}, mia).body.events[0].phase).toBe('live');
    expect(call('event_join', { id }, mia).body.ok).toBe(false);
    now += EVENT_LIVE_MS;
    expect(call('state', {}, mia).body.events[0].phase).toBe('done');
  });
  it('nur Event 1–15, keine Vergangenheit', () => {
    const adm = login('crim', 'Hotdog24').token;
    expect(call('admin_event_create', { type: 16, startAt: now + 1000 }, adm).body.ok).toBe(false);
    expect(call('admin_event_create', { type: 3, startAt: now - 3600000 }, adm).body.ok).toBe(false);
  });
  it('eventPhase', () => {
    const e = { startAt: 1000 };
    expect(eventPhase(e, 0)).toBe('countdown');
    expect(eventPhase(e, 1000)).toBe('join');
  });
});

describe('Verlosung', () => {
  it('Gewinner bekommt den eingestellten Betrag', () => {
    const adm = login('crim', 'Hotdog24').token, a = login('Anna').token, b = login('Ben').token;
    call('admin_lottery_start', { amount: 2500, minutes: 5 }, adm);
    call('lottery_join', {}, a); call('lottery_join', {}, b); call('lottery_join', {}, b);
    expect(call('state', {}, a).body.lottery).toMatchObject({ amount: 2500, count: 2, iJoined: true });
    now += 5 * 60000;
    const s = call('state', {}, a).body;
    expect(s.lottery).toBeNull();
    const w = s.lastLottery[0].winner;
    expect(['Anna', 'Ben']).toContain(w);
    const wt = w === 'Anna' ? a : b;
    expect(call('state', {}, wt).body.me.pending).toBe(2500);
  });
});

describe('Lobby', () => {
  it('erstellen, beitreten, Positionen sehen, verlassen', () => {
    const a = login('Anna').token, b = login('Ben').token;
    const code = call('lobby_create', { world: 'tank' }, a).body.code;
    expect(code).toMatch(/^[A-Z]{4}$/);
    expect(call('lobby_join', { code: code.toLowerCase() }, b).body.ok).toBe(true);
    call('lobby_sync', { code, me: { x: 1, z: 2, skin: 'frosch' } }, a);
    const r = call('lobby_sync', { code, me: { x: 5, z: 6 } }, b).body;
    expect(r.players).toEqual([expect.objectContaining({ name: 'Anna', x: 1, z: 2, skin: 'frosch' })]);
    now += 20000;
    expect(call('lobby_sync', { code, me: {} }, b).body.players).toEqual([]);
    call('lobby_leave', { code }, b);
    expect(call('lobby_join', { code }, a).body.ok).toBe(false);
  });
});
