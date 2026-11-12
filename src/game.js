// Spielablauf, Oberfläche (HTML-Overlays) und Eingaben. Die 3D-Szene steht in scene.js.
import { S, setState, V, K, $, pick, rnd, W, dst } from './state.js';
import {
  SH, FU, ITEM_PRICE, WHISPERS, SKULL_SPOTS, UPGRADE_COST, WEAPONS, WORLDS, W_IDX, START_STOCK, RESTOCK_AMOUNT,
  ORDER_PRICE, ORDER_DELAY, INVENTORY_SLOTS, GATE_PRICE, POWER_PRICE, MAX_MISTAKES, MAX_COMPLAINTS, SKULLS_TOTAL,
  HEADS_TOTAL, SECRET_MONEY, SHIFT_END, TICK_SECONDS,
} from './config.js';
import * as L from './logic.js';
import { createStore } from './storage.js';

export const store = createStore();

/** Positionen im 2D-Spielraster (siehe W() in state.js) */
export const SP = { snack: [16, 26], drink: [36, 26], tab: [56, 26] };
const THK = [80, 76], MN = [83, 68.6];
const PIZZA_OFFICE = [350, 89.3];

export const hpMax = () => L.hpMax(S.up, S.fu.length);
export const dmg = () => L.weaponDamage(S.wi, S.wl, S.up.dm);
const shifts = () => store.shifts(S.name);
const worldShifts = w => store.worldShifts(S.name, w);

export function init() {
  setState({
    t: 0, m: 20, sc: 0, bw: 0, loc: 'laden', inv: [], st: { ...START_STOCK }, bl: [], wp: 0, c: null, cid: 0,
    px: 60, py: 62, nk: '', rr: '', q: '', nt: 30, th: null, gate: 0, ah: 0, hgot: 0, map: 'tank', skg: 0,
    skp: pick(SKULL_SPOTS), own: [0], wi: 0, up: { mm: 0, dm: 0, hp: 0 }, sk: 0, mt: 0, nc: 4, ord: [], cr: [], fu: [],
    wl: 1, it: { wood: 0, trap: 0, bomb: 0, elek: 0 }, boss: null, ph: 'start', mon: false, hp: 3, lf: 0, flags: {},
  });
  R();
}

export function say(m) { $('#log').textContent = m; }

// ---------------------------------------------------------------- HTML-Bausteine
const card = c => `<div class="id"><b>PERSONALAUSWEIS</b><div>Name: ${c.name}</div><div>Alter: ${c.age} · Geb.: ${c.born}</div><div>Status: <span class="${c.st == 'TOT' ? 'dead' : ''}">${c.st}</span></div><div class="sig">${c.sig}</div></div>`;
const rrec = r => `<div class=id style='background:#bccabc'><b>REGISTER</b><div>Name: ${r.name}</div><div>Alter: ${r.age} · Geb.: ${r.born}</div><div>Status: <span class=${r.st == 'TOT' ? 'dead' : 'x'}>${r.st}</span></div><div class=sig>${r.sig}</div></div>`;
function find(q) { q = q.trim().toLowerCase(); const c = S.c; return [c && c.rec, c && c.wrec].find(r => r && r.name.toLowerCase() == q); }

const CAM_NAMES = { tank: ['Lager', 'Laden', 'Eingang', 'Zapfsäulen', 'Hintertür'], pizza: ['Bühne', 'Halle', 'Linker Gang', 'Rechter Gang', 'Draußen'] };

function monitorMain() {
  const total = shifts();
  const worlds = WORLDS.filter(w => w.id != S.map).map(w => {
    const ok = L.worldUnlocked(w.id, total, S.adm);
    return `<button data-a=world data-v=${w.id} ${ok ? '' : 'disabled'}>${w.label} ${ok ? '' : '🔒' + L.unlockShifts(w.id)}</button>`;
  }).join('');
  const cams = (CAM_NAMES[S.map] || CAM_NAMES.tank).map((n, i) => `<button data-a=cam data-v=${i + 1}>📹 Cam ${i + 1} ${n}</button>`).join('');
  const safeQ = (S.q || '').replace(/[^a-zäöüßA-ZÄÖÜ -]/g, '');
  return `<h3>🖥️ Monitor</h3><button data-a="mon">← Zurück</button>`
    + `<div class=btns>${worlds}<button data-a=tab data-v=1>🔫 Waffen-Shop</button><button data-a=tab data-v=2>⬆️ Upgrades</button>${cams}${S.cam ? '<button data-a=cam data-v=0>❌ Kamera aus</button>' : ''}</div>`
    + `<p>Personenregister: Name eingeben und mit dem Ausweis vergleichen.</p><div class=btns><input id=nm value='${safeQ}' placeholder='Vor- und Nachname' autocomplete=off><button data-a=srch>🔍 Suchen</button></div>${S.rr || ''}`
    + (S.c ? '<p class=mu>Ausweis in deiner Hand:</p>' + card(S.c) : '')
    + `<hr><button data-a=gate ${S.gate ? 'disabled' : ''}>🚨 Diebstahl-Gerät für den Eingang ${GATE_PRICE}€</button>`
    + '<div class="btns">'
    + [['wood', '🪵 Holz'], ['trap', '🪤 Bärenfalle'], ['bomb', '💣 Bombe'], ['elek', '⚡ Elektrogranate']].map(([k, n]) => `<button data-a="buy" data-v="${k}">${n} ${ITEM_PRICE[k]}€ (${S.it[k]})</button>`).join('')
    + Object.keys(SH).map(k => `<button data-a="ord" data-v="${k}">📦 ${SH[k][0]} bestellen ${ORDER_PRICE}€ (2 Min.)</button>`).join('')
    + FU.map((f, i) => `<button data-a="fur" data-v="${i}" ${S.fu.includes(i) ? 'disabled' : ''}>${f[0]} ${f[1]} ${f[2]}€</button>`).join('')
    + '</div>';
}
function monitorShop() {
  let h = '<h3>🖥️ Monitor</h3><button data-a=tab data-v=0>← Zurück</button><p>💶 ' + S.m + '€</p><div class=btns>';
  if (S.mt == 1) {
    WEAPONS.forEach((w, i) => {
      const o = S.own.includes(i);
      const label = o ? (S.wi == i ? '✓' : 'ausrüsten') : w.lock || w.price + '€';
      h += `<button ${S.wi == i ? 'class=hl' : ''} data-a=${o ? 'eq' : 'bw'} data-v=${i} ${w.lock && !o ? 'disabled' : ''}>${w.name} (${w.dmg}) ${label}</button>`;
    });
  } else {
    [['mm', '💶 Geld-Multiplikator'], ['dm', '💥 Schadens-Multiplikator'], ['hp', '❤️ Max-Leben']].forEach(([k, n]) => {
      const c = UPGRADE_COST[k], l = S.up[k];
      h += `<button data-a=upg2 data-v=${k} ${l >= c.length ? 'disabled' : ''}>${n} ${l}/${c.length} ${l < c.length ? c[l] + '€' : 'MAX'}</button>`;
    });
  }
  return h + '</div>';
}
const monitor = () => (S.mt ? monitorShop() : monitorMain());

// ---------------------------------------------------------------- Nähe-Erkennung (was steht neben mir?)
function near() {
  const o = [];
  for (const k in SP) if (dst(S.px, S.py, ...SP[k]) < 19) o.push('s' + k);
  if (dst(S.px, S.py, ...THK) < 20) o.push('t');
  if (dst(S.px, S.py, ...MN) < 14) o.push('m');
  if (dst(S.px, S.py, 92, -28.6) < 16) o.push('c');      // Lieferkisten
  if (dst(S.px, S.py, 62.5, -41.4) < 16) o.push('u');    // Werkbank
  if (dst(S.px, S.py, 45, -27.9) < 14) o.push('x');      // Mülleimer
  if (S.ph == 'bus' && dst(S.px, S.py, -35, 50) < 16) o.push('q');
  if (S.skp && !S.skg && dst(S.px, S.py, S.skp[0] / 0.2 + 50, S.skp[1] / 0.14 + 50) < 10) o.push('k');
  if (dst(S.px, S.py, 25, -307) < 14) o.push('a');       // Altar
  if (S.map == 'back' && dst(S.px, S.py, 25, -328) < 18) o.push('r');
  if (S.gd && dst(S.px, S.py, 675, -378.6) < 16) o.push('w');
  S.bl.forEach(b => { if (dst(S.px, S.py, b.x, b.y) < 12) o.push('b'); });
  return o;
}
export const nkey = () => near().join() + '|' + (S.c ? S.cid + '' + (S.c.arr || 0) : 0) + '|' + S.wp + S.bl.length + S.inv.length + 'c' + S.cr.length + (S.ds ? 'd' : '');

const counterButtons = `<div class=btns><button data-a=sell>✅ Verkaufen</button><button data-a=ref>✋ Ablehnen</button><button data-a=ign>🙈 Ignorieren</button><button class=red data-a=shoot>🔫 Erschießen</button></div>`;
const bossButtons = () => `<div class=btns><button class=red data-a=fire>🔫 Feuern</button><button data-a=plank>🪵 Brett (${S.it.wood})</button><button data-a=trap>🪤 Falle (${S.it.trap})</button><button data-a=bomb>💣 (${S.it.bomb})</button><button data-a=elek>⚡ (${S.it.elek})</button></div>`;

/** Inhalt der Info-Box rechts oben im 3D-Bild */
export function ib() {
  S.nk = nkey();
  const n = near();
  let h = '';
  if (S.map == 'pizza' && !S.out) return pizzaPanel();
  if (S.map == 'pizza' && S.out) h += '<button data-a=pin>🏢 Zurück ins Büro</button>';
  if (S.ph == 'bus') return n.includes('q') ? '<button class=red data-a=board>🚌 Einsteigen</button>' : '<p class=mu>Schichtende! Geh nach draußen zur Haltestelle zum Bus.</p>';
  if (S.boss && S.boss.f == 1) return '<div class=bar><i id=bb></i></div><p id=fs class=mu></p>' + bossButtons();
  if (n.includes('t')) {
    h += S.c && S.c.arr
      ? '<div data-a=idc>' + card(S.c) + '</div>' + (S.ds ? `<p class=lk>🗣️ „${S.ds}“</p>` : '<p class=mu>👆 Tipp auf den Ausweis zum Nachfragen. Tipp auf die Ware auf der Theke zum Verkaufen.</p>') + `<p>„${S.c.say}“</p>` + counterButtons
      : '<p class=mu>Theke: niemand da.</p>';
  } else if (S.c && S.c.arr) h += '<p class=mu>Ein Kunde wartet an der Theke…</p>';
  n.forEach(k => {
    if (k[0] == 's') { const s = k.slice(1); h += `<button class='shelf ${S.inv.includes(s) ? 'hl' : ''}' data-a=shelf data-v=${s}>${SH[s][0]} ${S.st[s]}×${S.inv.includes(s) ? ' 📦 einräumen' : ''}</button>`; }
  });
  if (n.includes('c')) {
    if (S.cr.length) S.cr.forEach((k, i) => { h += `<button class=hl data-a=take data-v=${i}>📦 ${SH[k][0]} nehmen</button>`; });
    else h += '<p class=mu>Lager: Keine Lieferung da. Unterwegs: ' + S.ord.length + '</p>';
  }
  if (n.includes('u')) h += `<button data-a=upg>🔫 Waffe Lv${S.wl} ${S.wl < 3 ? '→ Lv' + (S.wl + 1) + ' (' + S.wl * 60 + '€)' : '(MAX)'}</button>`;
  if (n.includes('k')) h += '<button data-a=skull>💀 Schädel nehmen</button>';
  if (S.gd) h += '<button data-a=gback>🧱 Zurück in die Backrooms</button>';
  if (n.includes('w') && !S.own.includes(W_IDX.garden)) h += '<button class=hl data-a=fweap>🔫 Gratis-Waffe nehmen</button>';
  if (n.includes('r') && S.rt) h += '<button class=red data-a=react>⚡ Reaktor aktivieren</button>';
  if (n.includes('a')) {
    if (S.map == 'pizza' && !S.hgot) h += '<button data-a=head>🐶 Animatronic-Kopf nehmen</button>';
    h += '<button data-a=altar>🕯️ Altar (' + L.altarProgress(S.map, altarCtx()).text + ')</button>';
  }
  if (n.includes('x')) h += '<button data-a=trash>🗑️ Müll durchsuchen</button>';
  if (n.includes('b')) h += `<button data-a=wipe>🧹 Blut wischen (${3 - S.wp}×)</button>`;
  return h || '<p class=mu>Links wischen: laufen. Rechts wischen: umschauen. Geh zur Theke, zu den Regalen, zum Monitor oder zur Tür.</p>';
}
const altarCtx = () => ({ skulls: S.sk || 0, heads: S.ah || 0, worldShifts: worldShifts(S.map), own: S.own });

function idsay(c) {
  const A = c.age, lines = {
    1: ['Tot? Das ist ein Tippfehler. Ich atme doch.', 'Ich fühle mich eigentlich ganz... lebendig.'],
    2: ['Ich unterschreibe heute anders. Meine Hände sind so kalt.', 'Die Unterschrift? Ist mir doch egal.'],
    3: ['Ich bin ' + A + '. Warum fragen das alle?', 'Das Alter stimmt. Glaube ich.'],
    4: ['Alles echt. Die Person, für die ich kaufe, wartet schon so lange...', 'Ja, der Ausweis stimmt. Fragen Sie nicht nach dem anderen.'],
  };
  if (c.bg) return 'Hey! Ich bin einer von den Guten. Versprochen.';
  if (c.rk) return 'Meine Unterschrift sagt alles: Legends Never dies.';
  if (c.af) return 'Ja, das bin ich. Keine Sorge, ich bin heute nur Kunde.';
  if (c.goose) return 'HONK! HONK! (Das bin ich. Gans toll.)';
  if (c.k) return pick(lines[c.k]);
  if (A < c.it[2]) return pick(['Ich bin schon alt genug, ehrlich!', 'Mein großer Bruder darf das auch kaufen...']);
  return pick(['Ja, das bin ich. Alles echt.', 'Ich bin ' + A + ', geboren ' + c.born + '. Reicht das?', 'Das Foto ist von früher, ich weiß.']);
}

// ---------------------------------------------------------------- Rendern
export function R() {
  if (!S) return;
  const hpPct = Math.max(0, (S.hp / hpMax()) * 100);
  $('#hud').innerHTML = `<span id="clk"></span><span>👤 ${S.name || '?'}${S.adm ? ' 👑' : ''}</span>`
    + (S.adm ? '<button data-a=gm data-v=100>+100€</button><button data-a=gm data-v=1000>+1000€</button><button data-a=gh data-v=s>💀+1</button><button data-a=gh data-v=a>🐶+1</button>' : '')
    + `<span>💶 ${S.m}€</span><span class=hb><i style='width:${hpPct}%'></i></span>`
    + `<span>${S.map == 'pizza' ? '🐶 ' + S.ah + '/' + HEADS_TOTAL : '💀 ' + (S.sk || 0) + '/' + SKULLS_TOTAL}</span><span>☠️ ${S.sc}/${MAX_MISTAKES}</span><span>😠 ${S.bw}/${MAX_COMPLAINTS}</span><span>🎒 ${[0, 1].map(i => (S.inv[i] ? '📦' : '▫️')).join('')}</span>`;
  const playing = S.ph == 'play' || S.ph == 'bus';
  $('#fp').className = playing && (!S.mon || S.cam) ? (S.mon ? 'cc' : '') : 'hide';
  if (document.activeElement && document.activeElement.id == 'nm') return;
  const view = S.mon ? monitor() : bossWarning();
  $('#view').innerHTML = view;
  $('#view').style.display = view ? '' : 'none';
  $('#ib').innerHTML = playing && !S.mon ? ib() : '';
  clk();
}
const bossWarning = () => (S.boss && !S.boss.f ? '<p class=red>⚠️ Es kommt gleich! Ab ins Lager, Holz und Fallen am Monitor kaufen.</p>' : '');
function clk() { const e = $('#clk'); if (e) e.textContent = '🕛 ' + L.clock(S.t, S.map); }

function saveP() { if (S && S.name) store.saveProgress(S.name, S); }
function loadP() { store.loadProgress(S.name, S); }
addEventListener('pagehide', saveP);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveP(); });

// ---------------------------------------------------------------- Bus-Quicktime-Event
function startQT() {
  S.qt = { arr: [], n: 0, sp: 0.6, tot: 16, on: 1 };
  $('#qt').className = '';
  $('#qt').innerHTML = '<div class=qtw><h2 class=red>Das ist NICHT der Bus!</h2><div class=bar><i id=qh></i></div><div id=trk><div id=cir></div></div><div id=dp>'
    + [['u', 'U', '↑'], ['l', 'L', '←'], ['r', 'R', '→'], ['d', 'D', '↓']].map(a => `<button style='grid-area:${a[0]}' data-a=qa data-v=${a[1]}>${a[2]}</button>`).join('') + '</div></div>';
  $('#qh').style.width = (S.hp / hpMax()) * 100 + '%';
  window.JUMP('🚌');
  requestAnimationFrame(qtl);
}
function qmiss() {
  S.hp--; window.JUMP('👹');
  const h = $('#qh'); if (h) h.style.width = Math.max(0, (S.hp / hpMax()) * 100) + '%';
  if (S.hp <= 0) { S.qt.on = 0; $('#qt').className = 'hide'; over('Tot', 'Der falsche Bus hat dich geholt.'); }
}
function qtl(t) {
  const q = S.qt; if (!q || !q.on) return;
  const dt = Math.min(0.05, (t - (q.l || t)) / 1000); q.l = t;
  const tr = $('#trk');
  q.sp -= dt;
  if (q.sp <= 0 && q.n < q.tot) {
    q.sp = 0.95; q.n++;
    const d = pick(['U', 'D', 'L', 'R']), e = document.createElement('span');
    e.className = 'ar'; e.textContent = { U: '↑', D: '↓', L: '←', R: '→' }[d];
    tr.appendChild(e); q.arr.push({ d, x: tr.clientWidth + 30, e });
  }
  for (const a of q.arr) { a.x -= 230 * dt; a.e.style.left = a.x - 23 + 'px'; if (a.x < 20 && !a.gone) { a.gone = 1; qmiss(); } }
  q.arr = q.arr.filter(a => { if (a.gone) { a.e.remove(); return false; } return true; });
  if (q.on && q.n >= q.tot && !q.arr.length) { q.on = 0; $('#qt').className = 'hide'; over('🚌 Geschafft!', 'Du bist dem falschen Bus entkommen und hast den echten erwischt.'); return; }
  requestAnimationFrame(qtl);
}

// ---------------------------------------------------------------- Pizzeria
const dogSVG = (k, s) => `<svg width=${s} height=${s} viewBox='0 0 100 100'>` + (k
  ? `<ellipse cx=18 cy=42 rx=11 ry=24 fill=#2b2b30 /><ellipse cx=82 cy=42 rx=11 ry=24 fill=#2b2b30 /><circle cx=50 cy=54 r=32 fill=#6b6b72 /><ellipse cx=50 cy=70 rx=19 ry=14 fill=#d8d8dc />`
  : `<ellipse cx=16 cy=50 rx=13 ry=28 fill=#7a431d /><ellipse cx=84 cy=50 rx=13 ry=28 fill=#7a431d /><circle cx=50 cy=52 r=36 fill=#b8692c /><circle cx=34 cy=30 r=11 fill=#c97a3a /><circle cx=66 cy=30 r=11 fill=#c97a3a />`)
  + `<circle cx=37 cy=50 r=6 fill=#fff600 /><circle cx=63 cy=50 r=6 fill=#fff600 /><circle cx=37 cy=50 r=2.5 fill=#000 /><circle cx=63 cy=50 r=2.5 fill=#000 /><ellipse cx=50 cy=66 rx=8 ry=6 fill=#111 /><path d='M28 22 Q50 -6 74 22 L68 28 Q50 14 34 28Z' fill=#c0392b /><circle cx=76 cy=16 r=6 fill=#fff /></svg>`;
const ROOMS = ['Bühne', 'Halle', 'Gang', 'Tür'];
const hall = o => [0, 1, 2, 3].filter(i => o == null || o == i).map(i => `<div class=sl><small>${ROOMS[i]}</small>${S.pz.a.filter(a => a.pos == i).map(a => dogSVG(a.k, 44 + i * 22) + (i == 3 ? '<small>' + (a.s ? 'rechts' : 'links') + '</small>' : '')).join('')}</div>`).join('');
function pizzaPanel() {
  const p = S.pz, c = S.c;
  let h = `<p>🔋 Strom: <b id=pw>${Math.ceil(p.pw)}%</b> <button data-a=pbuy>+25% (${POWER_PRICE}€)</button></p><div class=btns>`
    + [0, 1].map(i => `<button class='${p.d[i] ? 'hl' : ''}' data-a=pdoor data-v=${i}>🚪 ${i ? 'Rechts' : 'Links'}: ${p.d[i] ? 'zu' : 'offen'}</button>`).join('')
    + `<button data-a=pcam>📹 Kameras</button><button data-a=pout>🚪 Ausgang</button></div>`;
  if (S.pzv == 'c') h += '<div class=btns>' + [0, 1, 2, 3].map(i => `<button data-a=pc data-v=${i}>📹 ${ROOMS[i]}</button>`).join('') + '</div><div class=wv>' + hall(S.pcam || 0) + '</div>';
  if (c) h += '<div data-a=idc>' + card(c) + '</div>' + (S.ds ? `<p class=lk>„${S.ds}“</p>` : '') + `<p>„${c.say}“</p>` + counterButtons;
  else h += '<p class=mu>Am Verkaufsfenster ist niemand.</p>';
  return h;
}
function initPz() {
  S.pz = { pw: 100, d: [0, 0], a: [{ n: 'Benni', k: 0, s: 0, pos: 0, t: 0, iv: 8, w: 0 }, { n: 'Cookie', k: 1, s: 1, pos: 0, t: 0, iv: 11, w: 0 }] };
  S.pzv = 0; S.out = 0; S.skg = 1; S.hgot = 0; [S.px, S.py] = PIZZA_OFFICE; V.yaw = 0; V.pit = 0;
}
function pzTick(d) {
  const p = S.pz;
  p.pw = Math.max(0, p.pw - d * (0.12 + 0.3 * (p.d[0] + p.d[1])));
  if (p.pw <= 0) p.d = [0, 0];
  let ch = 0;
  for (const a of p.a) {
    a.t += d;
    if (a.pos < 3 && a.t >= a.iv) { a.t = 0; a.iv = Math.max(3, 6 + Math.random() * 7 - S.t / 90); a.pos++; ch = 1; }
    else if (a.pos == 3) {
      a.w += d;
      if (p.d[a.s]) { if (a.w > 5) { a.pos = 1; a.w = 0; a.t = 0; ch = 1; say('Die Tür hat gehalten. ' + a.n + ' zieht ab.'); } }
      else if (a.w > (p.pw <= 0 ? 1.5 : 3)) {
        S.hp--; window.JUMP('🐶'); say(a.n + ' hat dich erwischt!'); a.pos = 0; a.w = 0; a.t = 0; ch = 1;
        if (S.hp <= 0) { over('Tot', a.n + ' hat dich geholt.'); return; }
      }
    }
  }
  const e = $('#pw'); if (e) e.textContent = Math.ceil(p.pw) + '%';
  if (ch && !S.out && !S.mon) R();
}

// ---------------------------------------------------------------- Backrooms
function bkTick(d) {
  if (!S.rt && S.t >= (S.nr || 40)) { S.rt = { left: 60, lf: 60 }; say('⚠️ Der Reaktor fällt aus! Renn nach hinten in die Dunkelheit! 60 Sekunden!'); window.JUMP('⚡'); R(); }
  if (S.rt) {
    S.rt.left -= d;
    if (S.rt.left <= 0) { over('Tot', 'Der Reaktor ist explodiert.'); return; }
    const s = Math.ceil(S.rt.left);
    if (s != S.rt.lf) { S.rt.lf = s; say('⏱️ Reaktor: ' + s + ' s'); }
  }
}

// ---------------------------------------------------------------- Schichtende, Fehler, Boss
function shiftDone() {
  const total = store.recordShift(S.name, S.map);
  let r = ' Geschaffte Schichten: ' + total + '.';
  const rw = L.shiftRewards(S.name, total, S.own);
  if (rw.knife) { S.own.push(W_IDX.knife); r += ' Belohnung: Messer!'; }
  if (rw.bonus) { store.addBonus(S.name, rw.bonus); r += ' Belohnung: ' + rw.bonus + '€ für die nächste Schicht!'; }
  return r;
}
export function over(t, m) {
  if (S.ph == 'over') return;
  if (t.includes('Geschafft')) m += shiftDone();
  S.ph = 'over'; saveP(); S.mg = null;
  $('#ov').innerHTML = `<div><h2>${t}</h2><p>${m}</p><button class="big red" data-a="restart">Nochmal</button></div>`;
  $('#ov').className = '';
}
function chk() {
  if (S.bw >= MAX_COMPLAINTS) return over('Gefeuert', 'Zu viele Beschwerden.');
  if (S.sc >= MAX_MISTAKES && !S.boss && S.map != 'pizza' && S.map != 'back') {
    S.boss = { hp: 150, max: 150, pl: 0, st: 0, f: 0, at: S.t + 25, trp: [] };
    S.c = null; S.hp = hpMax();
    say('Etwas Großes kommt. Verbarrikadiere dich im Lagerraum!');
  }
}
function leave() { S.c = null; S.rr = ''; S.q = ''; S.ds = ''; S.nc = S.t + 8 + rnd(10); }
/** wendet ein Ergebnis aus logic.js an */
function apply(o) {
  if (o.money) S.m = Math.max(0, S.m + o.money);
  if (o.mistake) S.sc += o.mistake;
  if (o.complaint) S.bw += o.complaint;
  say(o.msg);
}
export function hit(d) {
  const b = S.boss; if (!b) return;
  b.hp -= d;
  if (b.hp <= 0) {
    if (b.alt != null) { S.own.push(b.alt); S.wi = b.alt; }
    S.boss = null; S.sc = 0; S.m += 60; S.loc = 'lager';
    say('Das Monster fällt. Stille. +60€' + (b.alt != null ? ' ' + WEAPONS[b.alt].name + ' erhalten!' : ''));
    R();
  }
}

// ---------------------------------------------------------------- Regal-Minigame
function mini(k) {
  S.mg = { k, a: 0, sp: 2, ta: Math.random() * 6.28 };
  const t = S.mg.ta;
  $('#ov').innerHTML = `<div><h3>Regal einräumen</h3><p>Stopp, wenn der Punkt im kleinen Kreis ist.</p><svg viewBox="-60 -60 120 120" width="260"><circle r="45" fill="none" stroke="#888" stroke-width="2"/><circle cx="${45 * Math.cos(t)}" cy="${45 * Math.sin(t)}" r="10" fill="none" stroke="#d9b44a" stroke-width="2"/><circle id="dt" cx="45" cy="0" r="6" fill="#b8322a"/></svg><br><button class="big" data-a="stop">STOPP</button></div>`;
  $('#ov').className = '';
  requestAnimationFrame(mgl);
}
function mgl(t) {
  const g = S.mg; if (!g) return;
  g.a += (g.sp * (t - (g.l || t))) / 1000; g.l = t;
  const e = $('#dt'); e.setAttribute('cx', 45 * Math.cos(g.a)); e.setAttribute('cy', 45 * Math.sin(g.a));
  requestAnimationFrame(mgl);
}

const goToWorldStart = () => { S.px = 60; S.py = 62; V.yaw = 1.4; V.pit = 0; };

// ---------------------------------------------------------------- Aktionen (alle Knöpfe)
export function act(a, v) {
  const c = S.c, B = S.boss, pl = S.ph == 'play';
  switch (a) {
    case 'start': {
      const n = $('#un').value.trim(), res = store.login(n, $('#pw').value);
      if (!res.ok) { $('#lm').textContent = res.msg; return; }
      const total = store.shifts(n);
      if (v == 'pizza' && !L.worldUnlocked('pizza', total, res.admin)) { $('#lm').textContent = `Benni Fazbear's ab Schicht ${L.unlockShifts('pizza')} (${total}/${L.unlockShifts('pizza')}).`; return; }
      S.name = n; S.adm = res.admin; loadP(); S.hp = hpMax();
      S.map = v == 'pizza' ? 'pizza' : 'tank';
      if (S.map == 'pizza') initPz();
      const gift = store.takeGift(n), bonus = store.takeBonus(n);
      S.m += gift + bonus;
      S.ph = 'play'; $('#ov').className = 'hide';
      say('Willkommen, ' + n + (S.adm ? ' (Admin)' : '') + '. Die Nachtschicht beginnt.' + (bonus ? ' Bonus: +' + bonus + '€' : '') + (gift ? ' Geschenk: +' + gift + '€' : ''));
      break;
    }
    case 'restart': {
      const nm = S.name, ad = S.adm, mp = S.map;
      init(); S.name = nm; S.adm = ad; S.map = mp; loadP(); S.hp = hpMax();
      if (mp == 'pizza') initPz(); else if (mp != 'tank') goToWorldStart();
      S.ph = 'play'; $('#ov').className = 'hide';
      break;
    }
    case 'gate': if (S.m < GATE_PRICE) { say('Zu wenig Geld.'); return; } S.m -= GATE_PRICE; S.gate = 1; say('Gerät am Eingang installiert. Es piept bei Diebstahl.'); break;
    case 'idc': if (!c || !c.arr || V.drg > 10) return; S.ds = idsay(c); break;
    case 'zap': { if (!pl) return; const n = performance.now(); if (n - S.lf < 900 - 100 * S.wl) return; S.lf = n; V.fl = 9; window.FIRE2(); return; }
    case 'tab': S.mt = +v; break;
    case 'bw': {
      const r = L.canBuyWeapon(+v, S.own, S.m);
      if (!r.ok) { say(r.msg); return; }
      S.m -= r.price; S.own.push(+v); S.wi = +v; say(WEAPONS[v].name + ' gekauft und ausgerüstet!');
      break;
    }
    case 'eq': if (!S.own.includes(+v)) return; S.wi = +v; say(WEAPONS[v].name + ' ausgerüstet.'); break;
    case 'upg2': {
      const cost = UPGRADE_COST[v], l = S.up[v];
      if (l >= cost.length || S.m < cost[l]) { say('Nicht möglich oder zu wenig Geld.'); return; }
      S.m -= cost[l]; S.up[v]++; if (v == 'hp') S.hp = hpMax(); say('Upgrade gekauft!');
      break;
    }
    case 'skull': if (S.skg) return; S.skg = 1; S.sk = Math.min(SKULLS_TOTAL, S.sk + 1); say('💀 Schädel ' + S.sk + '/' + SKULLS_TOTAL + ' gefunden!'); break;
    case 'altar': {
      const r = L.useAltar(S.map, altarCtx());
      if (!r.ok) { say(r.msg); return; }
      if (r.boss) {
        if (S.boss) return;
        S.boss = { hp: 400, max: 400, pl: 0, st: 0, f: 1, at: 0, trp: [], x: -5, z: -62, ph: 2, d1: 1, t: 0, h: 0, alt: r.weapon };
        S.hp = hpMax(); window.JUMP('🎃'); say('Der Kürbiskönig erwacht!');
        break;
      }
      S.own.push(r.weapon); S.wi = r.weapon; window.JUMP('🕯️'); say(r.msg);
      break;
    }
    case 'qa': {
      const q = S.qt; if (!q || !q.on) return;
      let b = null;
      for (const ar of q.arr) if (!ar.gone && Math.abs(ar.x - 65) < 45 && (!b || Math.abs(ar.x - 65) < Math.abs(b.x - 65))) b = ar;
      if (b && b.d == v) b.gone = 1; else qmiss();
      return;
    }
    case 'pdoor': if (S.pz.pw <= 0) { say('Kein Strom!'); return; } S.pz.d[+v] ^= 1; break;
    case 'pbuy': if (S.m < POWER_PRICE) { say('Zu wenig Geld.'); return; } S.m -= POWER_PRICE; S.pz.pw = Math.min(100, S.pz.pw + 25); break;
    case 'pcam': S.pzv = S.pzv == 'c' ? 0 : 'c'; S.pcam = S.pcam || 0; break;
    case 'pc': S.pcam = +v; break;
    case 'pout': S.out = 1; S.px = 25; S.py = -36; V.yaw = 0; say('Du gehst durch den Mitarbeiterausgang. Der Strom läuft weiter!'); break;
    case 'pin': S.out = 0; [S.px, S.py] = PIZZA_OFFICE; V.yaw = 0; break;
    case 'head': if (S.hgot) return; S.hgot = 1; S.ah = Math.min(HEADS_TOTAL, S.ah + 1); say('🐶 Animatronic-Kopf ' + S.ah + '/' + HEADS_TOTAL + ' gefunden!'); break;
    case 'world': {
      if (S.boss) { say('Nicht während des Boss-Kampfs!'); return; }
      const total = shifts();
      if (!L.worldUnlocked(v, total, S.adm)) { say('Noch gesperrt: ab Schicht ' + L.unlockShifts(v) + ' (' + total + '/' + L.unlockShifts(v) + ').'); return; }
      if (S.c) { S.c.dd = 1; leave(); }
      S.mon = false; S.cam = 0; S.mt = 0; S.out = 0; S.rt = null; S.gd = 0; S.nr = S.t + 40;
      if (v == 'pizza') {
        S.skgT = S.skg; S.map = 'pizza';
        if (S.pz) { [S.px, S.py] = PIZZA_OFFICE; V.yaw = 0; V.pit = 0; S.skg = 1; } else initPz();
      } else { if (S.map == 'pizza') S.skg = S.skgT || 0; S.map = v; goToWorldStart(); }
      say('Welt: ' + (WORLDS.find(w => w.id == v) || { label: v }).label);
      break;
    }
    case 'react': if (!S.rt) return; S.rt = null; S.nr = S.t + 60; S.m += 20; say('⚡ Reaktor aktiviert! +20€. Lauf zurück, in einer Minute geht es weiter.'); break;
    case 'sec': {
      S.sf = S.sf || {};
      if (S.sf[v]) { say('Hier ist nichts mehr.'); return; }
      S.sf[v] = 1; const g = SECRET_MONEY[+v] || 30; S.m += g; say('🕵️ Geheimnis! Hinter der Wand lag Geld: +' + g + '€');
      break;
    }
    case 'gh': if (!S.adm) return; if (v == 's') S.sk = Math.min(SKULLS_TOTAL, (S.sk || 0) + 1); else S.ah = Math.min(HEADS_TOTAL, (S.ah || 0) + 1); say(v == 's' ? 'Admin: Schädel ' + S.sk + '/' + SKULLS_TOTAL : 'Admin: Kopf ' + S.ah + '/' + HEADS_TOTAL); break;
    case 'fweap': if (S.own.includes(W_IDX.garden)) { say('Die Waffe hast du schon.'); return; } S.own.push(W_IDX.garden); S.wi = W_IDX.garden; say('🌿 Gratis-Waffe: ' + WEAPONS[W_IDX.garden].name + '!'); break;
    case 'gback': S.gd = 0; S.px = 95; S.py = -27.1; V.yaw = 1.5708; say('Zurück in den Backrooms.'); break;
    case 'gm': if (!S.adm) return; S.m += +v; say('Admin: +' + v + '€'); break;
    case 'cam': S.cam = +v; break;
    case 'trash':
      if (!S.own.includes(W_IDX.trash) && Math.random() < 0.12) { S.own.push(W_IDX.trash); say('GEHEIMNIS! Im Müll liegt eine Waffe: ' + WEAPONS[W_IDX.trash].name + '!'); break; }
      if (Math.random() < 0.3) { S.m += 5; say('Du findest 5€ im Müll.'); } else say('Nur Müll. Im Gebüsch raschelt etwas...');
      break;
    case 'mon': S.mon = !S.mon; S.cam = 0; S.mt = 0; break;
    case 'sell': {
      if (!c || !pl) return;
      if (S.st[c.sk] < 1) { say('Ausverkauft! Bestell Nachschub am Monitor.'); return; }
      apply(L.sellOutcome(c, S.up.mm)); S.st[c.sk]--; leave(); chk();
      break;
    }
    case 'ign': if (!c || !pl) return; apply(L.ignoreOutcome(c)); leave(); chk(); break;
    case 'ref': if (!c || !pl) return; apply(L.refuseOutcome(c)); leave(); chk(); break;
    case 'shoot': {
      if (!c || !pl) return;
      V.fl = 9; c.dd = 1;
      S.bl.push({ x: (c.x ?? -5) / 0.2 + 50, y: (c.z ?? 0) / 0.14 + 50 });
      apply(L.shootOutcome(c)); leave(); chk();
      break;
    }
    case 'srch': { const r = find($('#nm').value); S.rr = r ? rrec(r) : '<p class=red>Keine Person mit diesem Namen im Register.</p>'; S.q = $('#nm').value; $('#nm').blur(); break; }
    case 'wipe': { const i = S.bl.findIndex(b => dst(S.px, S.py, b.x, b.y) < 12); if (i < 0) return; if (++S.wp >= 3) { S.wp = 0; S.bl.splice(i, 1); say('Sauber.'); } break; }
    case 'shelf': if (S.inv.includes(v)) { mini(v); return; } say(SH[v][0] + ': ' + S.st[v] + ' im Regal'); break;
    case 'stop': {
      const g = S.mg; if (!g) return;
      const d = Math.abs((((g.a - g.ta) % 6.2832) + 9.4248) % 6.2832 - 3.1416);
      if (d < 0.3) { S.inv.splice(S.inv.indexOf(g.k), 1); S.st[g.k] += RESTOCK_AMOUNT; S.mg = null; $('#ov').className = 'hide'; say('Eingeräumt! +' + RESTOCK_AMOUNT); }
      else { g.sp *= 1.15; say('Daneben!'); return; }
      break;
    }
    case 'take': if (S.inv.length >= INVENTORY_SLOTS) { say('Nur ' + INVENTORY_SLOTS + ' Items im Inventar!'); return; } S.inv.push(S.cr.splice(+v, 1)[0]); break;
    case 'upg': { const p = S.wl * 60; if (S.wl >= 3 || S.m < p) { say(S.wl >= 3 ? 'Maximal.' : 'Zu wenig Geld.'); return; } S.m -= p; S.wl++; say('Waffe verbessert.'); break; }
    case 'buy': if (S.m < ITEM_PRICE[v]) { say('Zu wenig Geld.'); return; } S.m -= ITEM_PRICE[v]; S.it[v]++; break;
    case 'ord': if (S.m < ORDER_PRICE) { say('Zu wenig Geld.'); return; } S.m -= ORDER_PRICE; S.ord.push({ k: v, t: S.t + ORDER_DELAY }); say('Bestellt. Lieferung in 2 Minuten im Lager.'); break;
    case 'fur': if (S.fu.includes(+v)) return; if (S.m < FU[v][2]) { say('Zu wenig Geld.'); return; } S.m -= FU[v][2]; S.fu.push(+v); say('Gemütlicher.'); break;
    case 'fire': { if (!B) return; const n = performance.now(); if (n - S.lf < 900 - 100 * S.wl) return; S.lf = n; V.fl = 9; window.FIRE2(); break; }
    case 'plank': if (B && S.it.wood > 0 && B.pl < 5) { S.it.wood--; B.pl++; } break;
    case 'trap': if (B && S.it.trap > 0) { S.it.trap--; B.trp.push(W(S.px, S.py)); say('Falle gelegt.'); } break;
    case 'bomb': if (B && S.it.bomb > 0) { S.it.bomb--; hit(40); } break;
    case 'elek': if (B && S.it.elek > 0) { S.it.elek--; B.st = 6; hit(15); } break;
    case 'board': if (S.bus.fake) startQT(); else return over('🚌 Geschafft!', 'Du hast die Nacht überlebt. Der Bus fährt los.'); break;
  }
  R();
}

// ---------------------------------------------------------------- Spieltakt (4× pro Sekunde)
function tick() {
  if (!S || S.ph != 'play') return;
  const d = TICK_SECONDS;
  S.t += d; clk();
  if (S.t % 5 < d) saveP();
  if (S.map == 'pizza') pzTick(d);
  if (S.map == 'back') bkTick(d);
  if (S.ph != 'play') return;
  if (S.map == 'back' && S.t >= SHIFT_END.back) { over('🟨 Geschafft!', 'Es ist 8 Uhr. Du hast die Backrooms-Nacht überlebt.'); return; }
  if (S.map == 'pizza' && S.t >= SHIFT_END.default) { over('🍕 Geschafft!', 'Die Pizzeria macht auf. Du hast die Nacht überlebt.'); return; }
  if (S.map != 'back' && S.t >= SHIFT_END.default) {
    S.ph = 'bus'; S.c = null; S.th = null; S.boss = null; S.mon = false; S.bus = { fake: Math.random() < 0.5 };
    say('Der Morgen graut. Geh nach draußen zum Bus.'); R(); return;
  }
  S.ord = S.ord.filter(o => { if (S.t >= o.t) { S.cr.push(o.k); say('🚚 Lieferung ist im Lagerraum!'); R(); return false; } return true; });
  const B = S.boss;
  if (!B && !S.th && S.map != 'pizza' && S.t >= S.nt) {
    S.th = { x: -15, z: 4.5, ws: 0, w: 0, sk: pick(Object.keys(SH)), name: pick(['Klaus', 'Anna', 'Jonas', 'Mira']) + ' ' + pick(['Weber', 'Roth', 'Falk']) };
    S.nt = S.t + 45 + rnd(45);
  }
  if (!B) {
    if (!S.c && S.t >= S.nc) {
      S.c = L.makeCustomer(S.t / 60, S.flags);
      S.c.x = -15; S.c.z = 4.5; S.c.ws = 0; S.c.w = 0;
      S.cid++; S.rr = ''; S.q = ''; S.ds = '';
      if (S.map == 'pizza') { S.c.arr = 1; S.c.x = 60; S.c.z = 1.6; S.c.ry = 0; S.bl = []; }
      if (S.bl.length) { S.bw++; S.m = Math.max(0, S.m - 5); say('Kunde: „Da ist Blut auf dem Boden!“ (−5€)'); chk(); }
      if (S.ph == 'play') R();
    }
  } else if (!B.f) {
    if (S.t >= B.at) { B.f = 1; S.loc = 'lager'; S.mon = false; say('Die Tür wird aufgerissen. Es ist im Lager!'); R(); }
  } else {
    if (B.st > 0) B.st -= d;
    const bb = $('#bb');
    if (bb && S.boss) {
      bb.style.width = (B.hp / B.max) * 100 + '%';
      $('#fs').textContent = 'Boss ' + Math.max(0, B.hp) + '/' + B.max + ' | Bretter: ' + (B.pl ? '🪵'.repeat(B.pl) : 'keine') + ' | Leben: ' + '❤️'.repeat(Math.max(0, S.hp)) + (B.st > 0 ? ' | ⚡ betäubt' : '');
    }
  }
  if (Math.random() < 0.008) say(pick(WHISPERS));
}

export function startGameLoop() {
  setInterval(tick, TICK_SECONDS * 1000);
  document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) act(b.dataset.a, b.dataset.v); });
  addEventListener('keydown', e => {
    if (e.target.tagName == 'INPUT') {
      if (e.key == 'Enter' && e.target.id == 'nm') act('srch');
      if (e.key == 'Enter' && (e.target.id == 'pw' || e.target.id == 'un')) act('start', 'tank');
      return;
    }
    const qte = { arrowup: 'U', arrowdown: 'D', arrowleft: 'L', arrowright: 'R' }[e.key.toLowerCase()];
    if (qte && S && S.qt && S.qt.on) { e.preventDefault(); if (!e.repeat) act('qa', qte); return; }
    if (e.key == ' ' && S && S.ph == 'play') { e.preventDefault(); act(S.boss && S.boss.f ? 'fire' : 'zap'); return; }
    if (e.key.toLowerCase() == 'm' && S && S.ph == 'play') { act('mon'); return; }
    K[e.key.toLowerCase()] = 1;
  });
  addEventListener('keyup', e => { K[e.key.toLowerCase()] = 0; });
  addEventListener('blur', () => { for (const k in K) K[k] = 0; });
}
