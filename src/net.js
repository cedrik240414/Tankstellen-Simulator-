// Verbindung zum Spiel-Server. Ohne Server (VITE_API_URL leer) läuft dieselbe Logik lokal.
import { handle } from './shared/core.js';

const API = (import.meta.env && import.meta.env.VITE_API_URL) || '';
export const online = !!API;

const localDb = {
  get: k => { try { return localStorage.getItem('ns_srv:' + k); } catch { return null; } },
  put: (k, v) => { try { localStorage.setItem('ns_srv:' + k, v); } catch { /* voll */ } },
};
const localMem = {};
let token = '';
try { token = sessionStorage.getItem('ns_token') || ''; } catch { /* privat */ }

export function setToken(t) { token = t || ''; try { sessionStorage.setItem('ns_token', token); } catch { /* privat */ } }
export const hasToken = () => !!token;

/** ruft eine Server-Funktion auf, gibt immer { ok, ... } zurück */
export async function call(path, body = {}) {
  if (!API) {
    const r = handle(localDb, localMem, { path, body, token });
    return r.body;
  }
  try {
    const res = await fetch(API.replace(/\/$/, '') + '/api', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, body, token }),
    });
    return await res.json();
  } catch {
    return { ok: false, error: 'Server nicht erreichbar.', offline: true };
  }
}
