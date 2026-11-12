// Cloudflare Worker: Spiel-Server. Ein Durable Object (SQLite) hält alle Daten.
import { handle } from '../src/shared/core.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;

export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.mem = {};
    const sql = ctx.storage.sql;
    sql.exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');
    this.db = {
      get: k => { const r = sql.exec('SELECT v FROM kv WHERE k = ?', k).toArray(); return r.length ? r[0].v : null; },
      put: (k, v) => { sql.exec('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', k, v); },
    };
  }
  async fetch(req) {
    let msg;
    try { msg = await req.json(); } catch { return json({ ok: false, error: 'Ungültige Anfrage.' }, 400); }
    try {
      const r = handle(this.db, this.mem, { path: String(msg.path || ''), body: msg.body || {}, token: msg.token || '' }, Date.now(), rand);
      return json(r.body, r.status);
    } catch (e) {
      return json({ ok: false, error: 'Serverfehler.' }, 500);
    }
  }
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (req.method === 'GET') return json({ ok: true, game: 'Nachtschicht', path: url.pathname });
    if (url.pathname !== '/api') return json({ ok: false, error: 'Nicht gefunden.' }, 404);
    const stub = env.GAME.get(env.GAME.idFromName('main'));
    return stub.fetch(req);
  },
};
