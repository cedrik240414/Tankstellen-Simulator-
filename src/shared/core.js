// Server-Logik für Accounts, Rollen, Rangliste, Admin, Events, Verlosung und Lobbys.
// Läuft identisch im Cloudflare Worker (online) und im Browser (offline, nur dieses Gerät).
// db: { get(key) -> string|null, put(key, string) }  (synchron)
// mem: Arbeitsspeicher-Objekt für Lobbys (wird nicht gespeichert)
import { sha256 } from './sha256.js';

export const ADMIN_NAME = 'crim';
const ADMIN_PW = '90791bc89348548810f6a3aba14e94164114ee0f9cff613aa3d03378efc479f3';
/** feste Rollen beim ersten Login (Name in Kleinbuchstaben) */
export const SEED_ROLES = { crim: 'admin', dinnerboneagg: 'op', dinnerbonegg: 'op' };
export const OP_BONUS = 1000;
export const EVENT_JOIN_MS = 10 * 60 * 1000; // 10 Minuten Beitritt
export const EVENT_LIVE_MS = 4 * 60 * 1000;  // so lange läuft das Live-Event
export const EVENT_TYPES = 15;
const LOBBY_TIMEOUT = 15000;

export const hashPw = (name, pw) => sha256('nachtschicht|' + name + '|' + pw);
const err = (msg, status = 400) => ({ status, body: { ok: false, error: msg } });
const ok = body => ({ status: 200, body: { ok: true, ...body } });
const J = (db, k, d) => { try { const v = db.get(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const P = (db, k, v) => db.put(k, JSON.stringify(v));

const defaultRole = name => SEED_ROLES[String(name).toLowerCase()] || 'player';
const isStaff = r => r === 'admin';

export function eventPhase(ev, now) {
  if (now < ev.startAt) return 'countdown';
  if (now < ev.startAt + EVENT_JOIN_MS) return 'join';
  if (now < ev.startAt + EVENT_JOIN_MS + EVENT_LIVE_MS) return 'live';
  return 'done';
}

function token(rand) {
  let t = '';
  for (let i = 0; i < 32; i++) t += '0123456789abcdefghijklmnopqrstuvwxyz'[(rand() * 36) | 0];
  return t;
}

/** Verlosung und alte Events aufräumen */
function tick(db, now, rand) {
  const meta = J(db, 'meta', { events: [], lottery: null, last: [], seq: 1 });
  let changed = false;
  const L = meta.lottery;
  if (L && now >= L.endAt) {
    const names = L.players;
    const winner = names.length ? names[(rand() * names.length) | 0] : null;
    if (winner) {
      const p = J(db, 'p:' + winner, null);
      if (p) { p.pending = (p.pending || 0) + L.amount; P(db, 'p:' + winner, p); }
    }
    meta.last = [{ amount: L.amount, winner, at: now, count: names.length }, ...(meta.last || [])].slice(0, 5);
    meta.lottery = null; changed = true;
  }
  const keep = meta.events.filter(e => now < e.startAt + EVENT_JOIN_MS + EVENT_LIVE_MS + 60 * 60 * 1000);
  if (keep.length !== meta.events.length) { meta.events = keep; changed = true; }
  if (changed) P(db, 'meta', meta);
  return meta;
}

function me(db, tok) {
  if (!tok) return null;
  const name = J(db, 's:' + tok, null);
  if (!name) return null;
  const p = J(db, 'p:' + name, null);
  return p ? { name, p } : null;
}

function updateIndex(db, name, p) {
  const idx = J(db, 'idx', {});
  idx[name] = { role: p.role, banned: !!p.banned, rank: p.rank || '', skin: p.skin || 'standard', shifts: p.shifts || 0, money: p.money || 0, seen: p.seen || 0 };
  P(db, 'idx', idx);
}

const publicEvent = (e, now, name) => ({ id: e.id, type: e.type, title: e.title, startAt: e.startAt, phase: eventPhase(e, now), joined: e.players.length, iJoined: !!(name && e.players.includes(name)) });

/**
 * Bearbeitet eine Anfrage. req = { path, body, token }
 * gibt { status, body } zurück
 */
export function handle(db, mem, req, now = Date.now(), rand = Math.random) {
  const b = req.body || {};
  const meta = tick(db, now, rand);
  const u = me(db, req.token);
  if (u && u.p.banned && req.path !== 'login') return err('Du wurdest gebannt.', 403);
  const needUser = () => (u ? null : err('Bitte neu einloggen.', 401));
  const needAdmin = () => needUser() || (isStaff(u.p.role) ? null : err('Nur für Admins.', 403));

  switch (req.path) {
    case 'login': {
      const name = String(b.name || '').trim(), pw = String(b.pw || '');
      if (name.length < 2 || name.length > 16 || !/^[\wäöüÄÖÜß .-]+$/.test(name)) return err('Name: 2–16 Zeichen, nur Buchstaben, Zahlen, Punkt, Strich.');
      if (pw.length < 3) return err('Passwort: mindestens 3 Zeichen.');
      let p = J(db, 'p:' + name, null);
      const h = hashPw(name, pw);
      if (name === ADMIN_NAME && h !== ADMIN_PW) return err('Falsches Passwort für ' + name + '.');
      if (p && p.pw !== h && name !== ADMIN_NAME) return err('Falsches Passwort für ' + name + '.');
      if (p && p.banned) return err('Dieser Account ist gebannt.', 403);
      if (!p) {
        p = { pw: h, role: defaultRole(name), created: now, pending: 0, money: 0, shifts: 0, rank: '', skin: 'standard' };
        if (p.role === 'op' || p.role === 'admin') { p.pending += OP_BONUS; p.opBonus = 1; }
      }
      p.seen = now;
      P(db, 'p:' + name, p); updateIndex(db, name, p);
      const t = token(rand);
      P(db, 's:' + t, name);
      return ok({ token: t, name, role: p.role });
    }

    case 'state': {
      const idx = J(db, 'idx', {});
      const leaderboard = Object.entries(idx).filter(([, v]) => !v.banned)
        .map(([name, v]) => ({ name, role: v.role, rank: v.rank, skin: v.skin, shifts: v.shifts, money: v.money }))
        .sort((a, c) => c.shifts - a.shifts || c.money - a.money).slice(0, 200);
      const name = u && u.name;
      const L = meta.lottery;
      return ok({
        now,
        leaderboard,
        events: meta.events.map(e => publicEvent(e, now, name)),
        lottery: L ? { amount: L.amount, endAt: L.endAt, count: L.players.length, iJoined: !!(name && L.players.includes(name)) } : null,
        lastLottery: meta.last || [],
        me: u ? { name, role: u.p.role, pending: u.p.pending || 0, banned: !!u.p.banned } : null,
      });
    }

    case 'save': {
      const e = needUser(); if (e) return e;
      const p = u.p;
      for (const k of ['money', 'shifts']) if (Number.isFinite(b[k])) p[k] = Math.max(0, Math.floor(b[k]));
      if (typeof b.rank === 'string') p.rank = b.rank.slice(0, 24);
      if (typeof b.skin === 'string') p.skin = b.skin.slice(0, 24);
      if (Number.isFinite(b.ackPending) && b.ackPending > 0) p.pending = Math.max(0, (p.pending || 0) - b.ackPending);
      p.seen = now;
      P(db, 'p:' + u.name, p); updateIndex(db, u.name, p);
      if (b.data && typeof b.data === 'object') {
        const s = JSON.stringify(b.data);
        if (s.length > 200000) return err('Spielstand zu groß.');
        db.put('d:' + u.name, s);
      }
      return ok({ pending: p.pending || 0 });
    }

    case 'load': {
      const e = needUser(); if (e) return e;
      return ok({ data: J(db, 'd:' + u.name, null), role: u.p.role, pending: u.p.pending || 0 });
    }

    // ------------------------------------------------ Admin
    case 'admin_players': {
      const e = needAdmin(); if (e) return e;
      const idx = J(db, 'idx', {});
      return ok({ players: Object.entries(idx).map(([name, v]) => ({ name, ...v })).sort((a, c) => (c.seen || 0) - (a.seen || 0)) });
    }
    case 'admin_act': {
      const e = needAdmin(); if (e) return e;
      const target = String(b.target || '');
      const p = J(db, 'p:' + target, null);
      if (!p) return err('Spieler nicht gefunden.');
      if (target === ADMIN_NAME && target !== u.name) return err('Der Haupt-Admin kann nicht geändert werden.');
      switch (b.act) {
        case 'ban': if (target === u.name) return err('Du kannst dich nicht selbst bannen.'); p.banned = true; break;
        case 'unban': p.banned = false; break;
        case 'money': {
          const a = Math.trunc(Number(b.amount));
          if (!Number.isFinite(a) || a === 0) return err('Betrag fehlt.');
          p.pending = (p.pending || 0) + a; break;
        }
        case 'role': {
          if (!['player', 'op', 'admin'].includes(b.role)) return err('Unbekannte Rolle.');
          if (target === u.name) return err('Eigene Rolle nicht änderbar.');
          p.role = b.role;
          if (b.role !== 'player' && !p.opBonus) { p.pending = (p.pending || 0) + OP_BONUS; p.opBonus = 1; }
          break;
        }
        default: return err('Unbekannte Aktion.');
      }
      P(db, 'p:' + target, p); updateIndex(db, target, p);
      return ok({});
    }
    case 'admin_event_create': {
      const e = needAdmin(); if (e) return e;
      const type = Math.trunc(Number(b.type));
      const startAt = Math.trunc(Number(b.startAt));
      if (!(type >= 1 && type <= EVENT_TYPES)) return err('Event 1–15 wählen.');
      if (!Number.isFinite(startAt) || startAt < now - 60000) return err('Startzeit liegt in der Vergangenheit.');
      if (startAt > now + 366 * 24 * 3600 * 1000) return err('Startzeit zu weit in der Zukunft.');
      const ev = { id: 'e' + meta.seq++, type, title: String(b.title || '').slice(0, 60), startAt, players: [], by: u.name };
      meta.events.push(ev); meta.events.sort((a, c) => a.startAt - c.startAt);
      P(db, 'meta', meta);
      return ok({ event: publicEvent(ev, now, u.name) });
    }
    case 'admin_event_delete': {
      const e = needAdmin(); if (e) return e;
      meta.events = meta.events.filter(x => x.id !== b.id);
      P(db, 'meta', meta);
      return ok({});
    }
    case 'admin_lottery_start': {
      const e = needAdmin(); if (e) return e;
      if (meta.lottery) return err('Es läuft schon eine Verlosung.');
      const amount = Math.trunc(Number(b.amount)), minutes = Number(b.minutes);
      if (!(amount > 0)) return err('Gewinn muss größer als 0 sein.');
      if (!(minutes > 0 && minutes <= 7 * 24 * 60)) return err('Dauer: 1 Minute bis 7 Tage.');
      meta.lottery = { amount, endAt: now + Math.round(minutes * 60000), players: [], by: u.name };
      P(db, 'meta', meta);
      return ok({});
    }
    case 'admin_lottery_stop': {
      const e = needAdmin(); if (e) return e;
      meta.lottery = null; P(db, 'meta', meta);
      return ok({});
    }

    // ------------------------------------------------ Spieler: Events & Verlosung
    case 'event_join': {
      const e = needUser(); if (e) return e;
      const ev = meta.events.find(x => x.id === b.id);
      if (!ev) return err('Event nicht gefunden.');
      const ph = eventPhase(ev, now);
      if (ph === 'countdown') return err('Beitritt ist erst nach dem Countdown möglich.');
      if (ph !== 'join') return err('Beitritt ist vorbei.');
      if (!ev.players.includes(u.name)) ev.players.push(u.name);
      P(db, 'meta', meta);
      return ok({});
    }
    case 'lottery_join': {
      const e = needUser(); if (e) return e;
      if (!meta.lottery) return err('Gerade keine Verlosung.');
      if (!meta.lottery.players.includes(u.name)) meta.lottery.players.push(u.name);
      P(db, 'meta', meta);
      return ok({});
    }

    // ------------------------------------------------ Lobbys (nur Arbeitsspeicher)
    case 'lobby_create': {
      const e = needUser(); if (e) return e;
      mem.lobbies = mem.lobbies || {};
      let code;
      do code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[(rand() * 24) | 0]).join(''); while (mem.lobbies[code]);
      mem.lobbies[code] = { host: u.name, world: String(b.world || 'tank'), players: {} };
      mem.lobbies[code].players[u.name] = { t: now };
      return ok({ code });
    }
    case 'lobby_join': {
      const e = needUser(); if (e) return e;
      const code = String(b.code || '').toUpperCase().trim(), L = mem.lobbies && mem.lobbies[code];
      if (!L) return err('Lobby nicht gefunden.');
      if (Object.keys(L.players).length >= 8 && !L.players[u.name]) return err('Lobby ist voll (8).');
      L.players[u.name] = { t: now };
      return ok({ code, world: L.world, host: L.host });
    }
    case 'lobby_sync': {
      const e = needUser(); if (e) return e;
      const L = mem.lobbies && mem.lobbies[String(b.code || '')];
      if (!L) return err('Lobby nicht gefunden.', 404);
      const s = b.me || {};
      L.players[u.name] = { t: now, x: +s.x || 0, z: +s.z || 0, yaw: +s.yaw || 0, world: String(s.world || ''), skin: String(s.skin || 'standard'), tie: String(s.tie || ''), rank: String(s.rank || '') };
      for (const [n, q] of Object.entries(L.players)) if (now - q.t > LOBBY_TIMEOUT) delete L.players[n];
      if (L.players[L.host] === undefined) L.host = Object.keys(L.players)[0];
      return ok({ host: L.host, world: L.world, players: Object.entries(L.players).filter(([n]) => n !== u.name).map(([name, q]) => ({ name, ...q })) });
    }
    case 'lobby_leave': {
      const e = needUser(); if (e) return e;
      const code = String(b.code || ''), L = mem.lobbies && mem.lobbies[code];
      if (L) { delete L.players[u.name]; if (!Object.keys(L.players).length) delete mem.lobbies[code]; }
      return ok({});
    }
    default:
      return err('Unbekannter Aufruf.', 404);
  }
}
