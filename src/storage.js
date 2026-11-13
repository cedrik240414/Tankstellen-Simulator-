// Speicherstand in localStorage. Die Schlüssel sind dieselben wie in der alten Einzeldatei.
import { ADMIN_NAME, ADMIN_PW_HASH, GIFT_NAMES, GIFT_FIRST_LOGIN } from './config.js';
import { hashPw } from './logic.js';

const KEYS = { users: 'ns_users', prog: 'ns_prog', shifts: 'ns_shifts', ws: 'ns_ws', bonus: 'ns_bonus', gift: 'ns_gift' };
const PROGRESS_FIELDS = ['m', 'wl', 'fu', 'it', 'gate', 'own', 'wi', 'up', 'sk', 'ah', 'skin', 'tie', 'skins', 'rank', 'ranks', 'free', 'evDone', 'savedAt', 'set'];

/** Einfacher Speicher im Arbeitsspeicher (für Tests oder wenn localStorage gesperrt ist). */
export function memoryStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

export function createStore(ls) {
  if (!ls) { try { ls = globalThis.localStorage; ls.getItem('x'); } catch { ls = memoryStorage(); } }
  const get = k => { try { return JSON.parse(ls.getItem(KEYS[k]) || '{}') || {}; } catch { return {}; } };
  const set = (k, v) => { try { ls.setItem(KEYS[k], JSON.stringify(v)); } catch { /* voll oder gesperrt */ } };

  return {
    /** alles eines Spielers als ein Objekt (für den Server-Abgleich) */
    exportAll(name) {
      return { prog: get('prog')[name] || null, shifts: get('shifts')[name] || 0, ws: get('ws')[name] || {}, savedAt: (get('prog')[name] || {}).savedAt || 0 };
    },
    importAll(name, d) {
      if (!d) return;
      const P = get('prog'), s = get('shifts'), ws = get('ws');
      if (d.prog) P[name] = d.prog;
      s[name] = Math.max(s[name] || 0, d.shifts || 0);
      ws[name] = { ...(ws[name] || {}) };
      for (const [w, n] of Object.entries(d.ws || {})) ws[name][w] = Math.max(ws[name][w] || 0, n);
      set('prog', P); set('shifts', s); set('ws', ws);
    },
    localSavedAt: name => (get('prog')[name] || {}).savedAt || 0,
    login(name, pw) {
      if (!name || name.length < 2 || !pw || pw.length < 3) return { ok: false, msg: 'Name (mind. 2 Zeichen) und Passwort (mind. 3) eingeben.' };
      const h = hashPw(pw);
      if (name === ADMIN_NAME) {
        if (h !== ADMIN_PW_HASH) return { ok: false, msg: 'Falsches Passwort für ' + name + '.' };
        return { ok: true, admin: true };
      }
      const U = get('users');
      if (U[name] !== undefined && U[name] !== h) return { ok: false, msg: 'Falsches Passwort für ' + name + '.' };
      U[name] = h; set('users', U);
      return { ok: true, admin: false };
    },
    shifts: name => get('shifts')[name] || 0,
    worldShifts: (name, world) => (get('ws')[name] || {})[world] || 0,
    /** zählt eine geschaffte Schicht (gesamt + pro Welt) und gibt den neuen Gesamtstand zurück */
    recordShift(name, world) {
      const s = get('shifts'), ws = get('ws');
      s[name] = (s[name] || 0) + 1;
      ws[name] = ws[name] || {};
      ws[name][world] = (ws[name][world] || 0) + 1;
      set('shifts', s); set('ws', ws);
      return s[name];
    },
    addBonus(name, n) { const b = get('bonus'); b[name] = (b[name] || 0) + n; set('bonus', b); },
    /** holt den gutgeschriebenen Bonus ab (einmalig) */
    takeBonus(name) { const b = get('bonus'), n = b[name] || 0; if (n) { delete b[name]; set('bonus', b); } return n; },
    /** einmaliges Geschenk beim ersten Login für bestimmte Namen */
    takeGift(name) {
      const nl = String(name).toLowerCase(), g = get('gift');
      if (!GIFT_NAMES.includes(nl) || g[nl]) return 0;
      g[nl] = 1; set('gift', g);
      return GIFT_FIRST_LOGIN;
    },
    saveProgress(name, S) {
      const P = get('prog'); P[name] = {};
      for (const f of PROGRESS_FIELDS) P[name][f] = S[f];
      set('prog', P);
    },
    /** schreibt gespeicherte Felder in S, gibt true zurück, wenn es einen Stand gab */
    loadProgress(name, S) {
      const q = get('prog')[name];
      if (!q) return false;
      for (const f of PROGRESS_FIELDS) if (q[f] !== undefined) S[f] = q[f];
      S.skins = S.skins || ['standard']; S.ranks = S.ranks || []; S.evDone = S.evDone || [];
      S.own = S.own || [0]; S.wi = S.wi || 0; S.up = { mm: 0, dm: 0, hp: 0, ...(S.up || {}) }; S.sk = S.sk || 0; S.ah = S.ah || 0;
      return true;
    },
  };
}
