// Titelbildschirm, Hauptmenü und alle Menü-Bereiche.
import * as THREE from 'three';
import titleImg from './assets/title.jpg';
import { S } from './state.js';
import { call, setToken, online } from './net.js';
import { SKINS, SKIN, RARITY, RANKS, RANK, displayName, shopSkins, shopEndsAt, freeLeft, monthKey, skinAllowed, skinPrice } from './content.js';
import { skinModel } from './skins3d.js';
import { EVENT_TITLES, STORY, eventReward } from './events.js';
import { EVENT_JOIN_MS, EVENT_LIVE_MS } from './shared/core.js';
import { WORLDS, WEAPONS } from './config.js';
import * as L from './logic.js';
import { G } from './game.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hex = n => '#' + (n >>> 0).toString(16).padStart(6, '0');
let lastEvKey = '', tab = 'play', ST = null, srvOff = 0, admin = null, lobby = null, msg = '', busy = false, lastStateJson = '';
const now = () => Date.now() + srvOff;
export const lobbyState = () => lobby;

// ---------------------------------------------------------------- Titelbildschirm
export function showTitle(note) {
  $('#menu').classList.add('hide');
  $('#title').classList.remove('hide');
  $('#tnote').textContent = note || '';
}
function buildTitle() {
  const t = $('#title');
  t.style.backgroundImage = `url(${titleImg})`;
  t.innerHTML = `<div class=tani><div class="run c1">${fig('#c03030')}</div><div class="run c2">${fig('#2b5a8a')}</div><div class="run pl">${fig('#3a7a4a', true)}</div></div>
    <div class=tbox><p id=tnote class=red></p><button class="big red" data-m=anfangen>▶ ANFANGEN</button><p class=tsmall>SVE STUDIOS</p></div>`;
  // nach 10 Sekunden startet die kleine Animation im Hintergrund
  setTimeout(() => t.classList.add('anim'), 10000);
}
/** einfache Figur als SVG, optional mit Pistole */
const fig = (shirt, gun) => `<svg viewBox="0 0 40 80" width="46" height="92"><circle cx="20" cy="12" r="9" fill="#f1c9a5"/><rect x="11" y="22" width="18" height="26" rx="3" fill="${shirt}"/>
  <g class=legs><rect class=l1 x="12" y="47" width="7" height="26" fill="#2b3a55"/><rect class=l2 x="21" y="47" width="7" height="26" fill="#2b3a55"/></g>
  <rect x="${gun ? 27 : 5}" y="24" width="${gun ? 14 : 7}" height="6" fill="${gun ? '#222' : shirt}"/>${gun ? '<rect x="34" y="20" width="3" height="5" fill="#ffd040" class=muzzle />' : ''}</svg>`;

// ---------------------------------------------------------------- Login
function loginView() {
  return `<div class=card><h2>⛽ Einloggen</h2>
    <p class=mu>${online ? '🌐 Online: Rangliste, Events und Lobbys mit allen Spielern.' : '📴 Offline-Modus: Der Server ist noch nicht eingerichtet, alles läuft nur auf diesem Gerät.'}</p>
    <div class=btns><input id=un placeholder=Name autocomplete=off maxlength=16><input id=pw type=password placeholder=Passwort maxlength=24></div>
    <p class=red>${esc(msg)}</p><button class="big red" data-m=login>Einloggen / Registrieren</button></div>`;
}
async function doLogin() {
  if (busy) return; busy = true;
  const name = $('#un').value.trim(), pw = $('#pw').value;
  const r = await call('login', { name, pw });
  busy = false;
  if (!r.ok) { msg = r.error; render(); return; }
  setToken(r.token); msg = '';
  await G.newSession(r.name, r.role);
  const ld = await call('load');
  if (ld.ok && ld.data && (ld.data.savedAt || 0) > G.store.localSavedAt(r.name)) { G.store.importAll(r.name, ld.data); G.reload(); }
  const gift = G.store.takeGift(r.name), bonus = G.store.takeBonus(r.name);
  if (gift || bonus) { S.m += gift + bonus; G.save(); msg = (gift ? `🎁 Geschenk: +${gift}€ ` : '') + (bonus ? `Bonus: +${bonus}€` : ''); }
  tab = 'play';
  await poll(true);
  render();
}

// ---------------------------------------------------------------- Hauptmenü
export function showMenu(m) {
  if (m) msg = m;
  $('#title').classList.add('hide');
  $('#menu').classList.remove('hide');
  render();
  poll(true);
}
const TABS = [['play', '▶️ Spielen'], ['rang', '🏆 Rangliste'], ['skins', '👕 Skins'], ['shop', '🛒 Shop'], ['ranks', '🎖️ Ränge'], ['events', '🎉 Events'], ['lotto', '🎟️ Verlosung'], ['lobby', '👥 Lobby']];

function render() {
  const m = $('#mcontent');
  if (!S || !S.name) { $('#mhead').innerHTML = '<h2 class=mtitle>⛽ Tankstellen Simulator</h2>'; $('#mtabs').innerHTML = ''; m.innerHTML = loginView(); $('#prev').style.display = 'none'; return; }
  const role = S.role;
  $('#mhead').innerHTML = `<h2 class=mtitle>⛽ Tankstellen Simulator</h2><div class=who><b>${esc(displayName(S.name, S.rank, role))}</b> · 💶 ${S.m}€ · ${role === 'admin' ? 'Admin' : role === 'op' ? 'OP' : 'Spieler'} ${online ? '🌐' : '📴'}</div>` + eventBanner(false);
  $('#mtabs').innerHTML = TABS.concat(role === 'admin' ? [['admin', '🛡️ Admin']] : []).map(([k, n]) => `<button class="${tab === k ? 'hl' : ''}" data-m=tab data-v=${k}>${n}</button>`).join('') + '<button data-m=logout>🚪 Abmelden</button>';
  const views = { play: playView, rang: rangView, skins: skinsView, shop: shopView, ranks: ranksView, events: eventsView, lotto: lottoView, lobby: lobbyView, admin: adminView };
  m.innerHTML = (msg ? `<p class=lk>${esc(msg)}</p>` : '') + (views[tab] || playView)();
  $('#prev').style.display = ['skins', 'shop', 'play'].includes(tab) ? '' : 'none';
  setPreview(S.skin || 'standard');
  tickCountdowns();
}

function playView() {
  const total = G.store.shifts(S.name);
  return `<div class=card><h3>Welt wählen</h3><p class=mu>Geschaffte Schichten: ${total}</p><div class=btns>` + WORLDS.map(w => {
    const ok = L.worldUnlocked(w.id, total, S.adm);
    return `<button class="${ok ? 'big2' : ''}" data-m=play data-v=${w.id} ${ok ? '' : 'disabled'}>${w.label}${ok ? '' : ' 🔒 ab ' + L.unlockShifts(w.id)}</button>`;
  }).join('') + `</div></div>`;
}

function rangView() {
  const lb = (ST && ST.leaderboard) || [];
  return `<div class=card><h3>🏆 Rangliste</h3><p class=mu>Sortiert nach geschafften Schichten.${online ? '' : ' (Offline: nur Spieler auf diesem Gerät)'}</p><table class=lb><tr><th>#</th><th>Spieler</th><th>Skin</th><th>Schichten</th><th>Geld</th></tr>`
    + lb.map((p, i) => `<tr class="${p.name === S.name ? 'me' : ''}"><td>${i + 1}</td><td>${esc(displayName(p.name, p.rank, p.role))}</td><td>${(SKIN[p.skin] || SKIN.standard).emoji}</td><td>${p.shifts}</td><td>${p.money}€</td></tr>`).join('')
    + '</table></div>';
}

const skinCard = (id, btn) => { const k = SKIN[id], r = RARITY[k.rarity]; return `<div class=skin style="border-color:${r.color}"><div class=se>${k.emoji}</div><b>${esc(k.name)}</b><small style="color:${r.color}">${r.emoji} ${r.name}</small>${btn}</div>`; };
function skinsView() {
  const own = SKINS.filter(k => S.skins.includes(k.id) || (k.only && skinAllowed(k.id, S.role)));
  const cur = SKIN[S.skin] || SKIN.standard;
  return `<div class=card><h3>👕 Meine Skins</h3>${cur.look.tie ? `<p>Krawattenfarbe: <input type=color id=tiecol value="${hex(S.tie ?? cur.look.tieColor ?? 0xc02020)}" data-m=tie></p>` : ''}<div class=grid>`
    + own.map(k => skinCard(k.id, S.skin === k.id ? '<button class=hl disabled>✓ Aktiv</button>' : `<button data-m=wear data-v=${k.id}>Anziehen</button>`)).join('')
    + `</div><p class=mu>Du hast ${own.length} von ${SKINS.length} Skins. Neue gibt es im Shop.</p></div>`;
}
function shopView() {
  const ids = shopSkins(now()), free = freeLeft(S.free, now());
  return `<div class=card><h3>🛒 Skin-Shop</h3><p>Neue Skins in <b data-cd=${shopEndsAt(now())}></b> · 🎁 Gratis-Skins diesen Monat: <b>${free}</b></p><div class=grid>`
    + ids.map(id => {
      const owned = S.skins.includes(id), price = skinPrice(id);
      return skinCard(id, owned ? '<button disabled>✓ Gekauft</button>' : `<button data-m=buyskin data-v=${id} ${S.m < price ? 'disabled' : ''}>${price}€</button>${free ? `<button class=hl data-m=freeskin data-v=${id}>🎁 Gratis</button>` : ''}`);
    }).join('') + `</div><p class=mu>Seltenheiten: ${Object.values(RARITY).map(r => `${r.emoji} ${r.name} ${r.price}€`).join(' · ')}</p></div>`;
}
function ranksView() {
  return `<div class=card><h3>🎖️ Ränge</h3><p class=mu>Der aktive Rang steht als Emoji neben deinem Namen in der Rangliste.</p><div class=grid>`
    + RANKS.map(r => {
      const owned = S.ranks.includes(r.id);
      return `<div class=skin><div class=se>${r.emoji}</div><b>${r.name}</b>${owned ? (S.rank === r.id ? '<button class=hl data-m=rank data-v="">✓ Aktiv (ablegen)</button>' : `<button data-m=rank data-v=${r.id}>Anzeigen</button>`) : `<button data-m=buyrank data-v=${r.id} ${S.m < r.price ? 'disabled' : ''}>${r.price}€</button>`}</div>`;
    }).join('') + '</div></div>';
}
/** großes Banner mit dem nächsten Event (oben im Menü, klein auch im Spiel) */
const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
function when(t) {
  const d = new Date(t - srvOff), today = new Date(), tm = new Date(today.getTime() + 86400000);
  const same = (a, b) => a.toDateString() === b.toDateString();
  const day = same(d, today) ? 'Heute' : same(d, tm) ? 'Morgen' : `${DAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
  return `${day} um ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr`;
}
export function eventBanner(small) {
  const evs = ((ST && ST.events) || []).filter(e => e.phase !== 'done');
  if (!evs.length) return '';
  const e = evs[0], name = esc(EVENT_TITLES[e.type - 1]) + (e.title ? ' – ' + esc(e.title) : '');
  let line;
  if (e.phase === 'countdown') line = `📅 ${when(e.startAt)} · Beitritt in <b data-cd=${e.startAt}></b>`;
  else if (e.phase === 'join') line = e.iJoined ? `✅ Du bist dabei! Live in <b data-cd=${e.startAt + EVENT_JOIN_MS}></b>` : `🚪 JETZT BEITRETEN! Noch <b data-cd=${e.startAt + EVENT_JOIN_MS}></b>`;
  else line = '🔴 DAS EVENT LÄUFT GERADE LIVE!';
  if (small) return `<span class=evsmall>🎉 ${name}: ${line}</span>`;
  const btn = e.phase === 'join' && !e.iJoined ? `<button class=red data-m=evjoin data-v=${e.id}>Beitreten</button>` : `<button data-m=tab data-v=events>Zu den Events</button>`;
  return `<div class="evbanner ${e.phase}"><div class=evbt>🎉 EVENT: ${name}</div><div class=evbw>${line}</div>${btn}${evs.length > 1 ? `<div class=evbm>+ ${evs.length - 1} weitere${evs.length > 2 ? '' : 's'} Event${evs.length > 2 ? 's' : ''} geplant</div>` : ''}</div>`;
}
const phaseText = e => ({ countdown: '⏳ Startet in', join: '🚪 Beitritt offen, Live-Event in', live: '🔴 LIVE', done: '✔️ Vorbei' }[e.phase]);
function eventsView() {
  const evs = (ST && ST.events) || [];
  let h = `<div class=card><h3>🎉 Events</h3><p class=mu>Wenn der Countdown abgelaufen ist, kannst du 10 Minuten lang beitreten. Danach startet das Live-Event für alle, die beigetreten sind.</p>`;
  if (!evs.length) h += '<p class=mu>Gerade ist kein Event geplant.</p>';
  for (const e of evs) {
    const cd = e.phase === 'countdown' ? e.startAt : e.phase === 'join' ? e.startAt + EVENT_JOIN_MS : 0;
    h += `<div class=ev><b>${esc(EVENT_TITLES[e.type - 1])}</b>${e.title ? ' – ' + esc(e.title) : ''}<br>📅 ${when(e.startAt)}<br>${phaseText(e)} ${cd ? `<b data-cd=${cd}></b>` : ''} · 👥 ${e.joined}<br>`
      + (e.phase === 'join' ? (e.iJoined ? '<span class=ok>✅ Du bist dabei!</span>' : `<button class=red data-m=evjoin data-v=${e.id}>Beitreten</button>`) : '')
      + (e.phase === 'live' && e.iJoined && !S.evDone.includes(e.id) ? `<button class=red data-m=evplay data-v=${e.id}>▶ Live-Event ansehen</button>` : '')
      + (S.role === 'admin' ? ` <button data-m=evdel data-v=${e.id}>🗑️</button>` : '') + '</div>';
  }
  h += '</div>';
  if (S.role === 'admin') {
    const d = new Date(now() + 3600000), loc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    h += `<div class=card><h3>🛡️ Event erstellen</h3><div class=btns><select id=evtype>${EVENT_TITLES.map((t, i) => `<option value=${i + 1}>${esc(t)}</option>`).join('')}</select><input id=evtitle placeholder="Zusatztext (optional)" maxlength=60></div>
      <p><label><input type=radio name=evm value=timer checked> Timer: in <input id=evmin type=number min=1 value=5 style="width:90px;min-width:0"> Minuten</label></p>
      <p><label><input type=radio name=evm value=date> Am Datum um Uhrzeit: <input id=evdate type=datetime-local value="${loc}"></label></p>
      <button class=red data-m=evcreate>Event erstellen</button></div>`;
  }
  return h;
}
function lottoView() {
  const L = ST && ST.lottery;
  let h = `<div class=card><h3>🎟️ Verlosung</h3>`;
  if (L) h += `<p>Gewinn: <b>${L.amount}€</b> · Endet in <b data-cd=${L.endAt}></b> · 👥 ${L.count} Teilnehmer</p>` + (L.iJoined ? '<p class=ok>✅ Du machst mit. Viel Glück!</p>' : '<button class="big red" data-m=lotjoin>Mitmachen</button>');
  else h += '<p class=mu>Gerade läuft keine Verlosung.</p>';
  const last = (ST && ST.lastLottery) || [];
  if (last.length) h += '<h4>Letzte Gewinner</h4>' + last.map(x => `<p>🏆 ${x.winner ? esc(x.winner) : 'niemand'} – ${x.amount}€ (${x.count} Teilnehmer)</p>`).join('');
  h += '</div>';
  if (S.role === 'admin') h += `<div class=card><h3>🛡️ Verlosung starten</h3><div class=btns><input id=lotamt type=number min=1 value=1000 placeholder="Gewinn €"><input id=lotmin type=number min=1 value=10 placeholder="Dauer in Minuten"></div><button class=red data-m=lotstart ${L ? 'disabled' : ''}>Starten</button>${L ? '<button data-m=lotstop>Abbrechen</button>' : ''}<p class=mu>Gewinn in €, Dauer in Minuten.</p></div>`;
  return h;
}
function lobbyView() {
  if (!online) return `<div class=card><h3>👥 Lobby</h3><p class=mu>Lobbys gehen nur, wenn der Server eingerichtet ist (Online-Modus).</p></div>`;
  if (lobby) return `<div class=card><h3>👥 Lobby <span class=code>${lobby.code}</span></h3><p>Gib deinen Freunden den Code <b>${lobby.code}</b>. Welt: ${(WORLDS.find(w => w.id === lobby.world) || {}).label}</p><button class="big red" data-m=lobplay>▶ Zusammen spielen</button><button data-m=lobleave>Lobby verlassen</button></div>`;
  return `<div class=card><h3>👥 Lobby erstellen</h3><div class=btns><select id=lobworld>${WORLDS.filter(w => L.worldUnlocked(w.id, G.store.shifts(S.name), S.adm)).map(w => `<option value=${w.id}>${w.label}</option>`).join('')}</select><button data-m=lobcreate>Erstellen</button></div></div>
    <div class=card><h3>Lobby beitreten</h3><div class=btns><input id=lobcode placeholder="Code (4 Buchstaben)" maxlength=4 autocomplete=off><button data-m=lobjoin>Beitreten</button></div></div>`;
}
function adminView() {
  if (!admin) { loadAdmin(); return '<div class=card><p>Lade Spieler …</p></div>'; }
  const roleName = r => (r === 'admin' ? '🛡️ Admin' : r === 'op' ? '⭐ OP' : 'Spieler');
  return evTestView() + `<div class=card><h3>🌍 Alle Spieler auf einmal</h3><p class=mu>Gilt für alle ${admin.filter(p => !p.banned).length} nicht gebannten Spieler (auch dich).</p>
    <div class=btns><input id=allamt type=number value=500 min=1 style="max-width:160px"> €<button class=red data-m=adall data-x=give>🎁 Allen Geld geben</button><button data-m=adall data-x=take>➖ Allen Geld abziehen</button></div></div>
    <div class=card><h3>🛡️ Alle Spieler (${admin.length})</h3>
    <div class=btns><input id=adsearch placeholder="🔍 Spieler suchen" autocomplete=off><button data-m=adrefresh>🔄 Neu laden</button></div>
    <table class=lb id=adtable><tr><th>Spieler</th><th>Rolle</th><th>Schichten</th><th>Geld</th><th>Aktionen</th></tr>`
    + admin.map(p => `<tr data-n="${esc(p.name.toLowerCase())}" class="${p.banned ? 'ban' : ''}"><td>${esc(displayName(p.name, p.rank, p.role))}${p.banned ? ' ⛔ gebannt' : ''}</td><td>${roleName(p.role)}</td><td>${p.shifts}</td><td>${p.money}€</td><td class=acts>`
      + (p.name === S.name ? '<span class=mu>(du)</span>' : `<button data-m=ad data-v="${esc(p.name)}" data-x=${p.banned ? 'unban' : 'ban'}>${p.banned ? '✅ Entbannen' : '⛔ Bannen'}</button>
        <div class=btns><input class=pamt data-p="${esc(p.name)}" type=number min=0 value=500 style="max-width:120px;min-width:0" aria-label="Betrag für ${esc(p.name)}"> €
        <button data-m=ad data-v="${esc(p.name)}" data-x=give>➕ Geben</button><button data-m=ad data-v="${esc(p.name)}" data-x=take>➖ Abziehen</button><button data-m=ad data-v="${esc(p.name)}" data-x=set>🟰 Setzen</button></div>
        ${p.role === 'admin' ? `<button data-m=adr data-v="${esc(p.name)}" data-x=player>Admin wegnehmen</button>` : `<button class=hl data-m=adr data-v="${esc(p.name)}" data-x=admin>🛡️ Admin geben</button>`}
        ${p.role === 'op' ? `<button data-m=adr data-v="${esc(p.name)}" data-x=player>OP wegnehmen</button>` : p.role === 'player' ? `<button data-m=adr data-v="${esc(p.name)}" data-x=op>⭐ OP geben</button>` : ''}`) + '</td></tr>').join('')
    + '</table></div>';
}
/** Admin: jedes Event sofort ansehen, ohne Belohnung und ohne andere Spieler */
function evTestView() {
  return `<div class=card><h3>🧪 Events testen</h3><p class=mu>Spielt das Event sofort nur für dich ab. Keine Belohnung, nichts wird gespeichert, andere Spieler merken nichts. Mit ⏹ kannst du jederzeit abbrechen.</p><div class=grid>`
    + STORY.map((e, i) => `<div class=skin><div class=se>${['☄️', '🛸', '📻', '👤', '🌀', '💭', '🏚️', '🌗', '🎭', '🌌', '🔋', '👁️', '🔑', '⚔️', '❓'][i]}</div><b>${i + 1}. ${esc(e.t)}</b><small class=mu>${e.task ? '🎮 mit Aufgabe' : '🎬 nur Cutscene'}${e.reward ? ' · 🔫 Waffe' : ''}</small><button class=red data-m=evtest data-v=${i + 1}>▶ Testen</button></div>`).join('')
    + `</div><p class=mu>Den ganzen Ablauf (Countdown → 10 Min. Beitritt → Live) testest du unter 🎉 Events mit einem Event „in 1 Minute“.</p></div>`;
}
async function loadAdmin() {
  const r = await call('admin_players');
  admin = r.ok ? r.players : [];
  if (!r.ok) msg = r.error;
  if (tab === 'admin') render();
}

// ---------------------------------------------------------------- 3D-Vorschau
let prev = null;
function setPreview(id) {
  const cv = $('#prev');
  if (!prev) {
    const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    sc.add(new THREE.AmbientLight(0xffffff, 0.75)); const dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(2, 3, 4); sc.add(dl);
    cam.position.set(0, 1.2, 4.2); cam.lookAt(0, 1, 0);
    prev = { r, sc, cam, m: null, id: null, tie: null };
    const loop = () => {
      requestAnimationFrame(loop);
      if (cv.style.display === 'none' || $('#menu').classList.contains('hide') || !prev.m) return;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w || cv.height !== h) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      prev.m.rotation.y += 0.012;
      r.render(sc, cam);
    };
    loop();
  }
  if (prev.id === id && prev.tie === S.tie) return;
  if (prev.m) prev.sc.remove(prev.m);
  prev.m = skinModel(THREE, id, { tieColor: S.tie }); prev.id = id; prev.tie = S.tie;
  prev.sc.add(prev.m);
}

// ---------------------------------------------------------------- Countdown & Abfrage
function fmt(ms) {
  if (ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (d ? d + 'd ' : '') + (d || h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
}
function tickCountdowns() { document.querySelectorAll('[data-cd]').forEach(e => { e.textContent = fmt(+e.dataset.cd - now()); }); }

/** Server abfragen: Geld von Admins, Bann, Events, Verlosung */
export async function poll(force) {
  if (!S || !S.name) return;
  const r = await call('state');
  if (!r.ok) {
    if (r.error && /gebannt/.test(r.error)) return kick('⛔ Du wurdest gebannt.');
    if (r.error && /einloggen/.test(r.error)) return kick('Bitte neu einloggen.');
    return;
  }
  srvOff = r.now - Date.now();
  ST = r;
  if (r.me && r.me.role && r.me.role !== S.role) { S.role = r.me.role; S.adm = r.me.role === 'admin'; }
  if (r.me && r.me.setMoney != null) {
    const v = r.me.setMoney;
    S.m = v;
    msg = `💶 Ein Admin hat dein Geld auf ${v}€ gesetzt.`; G.say(msg);
    G.save(); await sync({ ackSet: v, ackPending: r.me.pending || 0 });
    r.me.pending = 0;
  }
  if (r.me && r.me.pending) {
    const p = r.me.pending;
    S.m = Math.max(0, S.m + p);
    G.say(p > 0 ? `💶 Du hast ${p}€ bekommen!` : `💸 Dir wurden ${-p}€ abgezogen.`);
    msg = p > 0 ? `💶 Du hast ${p}€ bekommen!` : `💸 Dir wurden ${-p}€ abgezogen.`;
    G.save(); await sync({ ackPending: p });
  }
  // Live-Event starten, wenn man beigetreten ist
  const live = r.events.find(e => e.phase === 'live' && e.iJoined && !S.evDone.includes(e.id));
  if (live && S.ph !== 'event' && !G.busy()) return startLive(live);
  const evKey = JSON.stringify(r.events.map(e => [e.id, e.phase, e.iJoined]));
  if (evKey !== lastEvKey && (S.ph === 'play' || S.ph === 'bus')) G.redraw();
  lastEvKey = evKey;
  const j = JSON.stringify([r.leaderboard, r.events, r.lottery, r.lastLottery, S.m]);
  const typing = document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName) && $('#menu').contains(document.activeElement);
  if ((force || j !== lastStateJson) && !$('#menu').classList.contains('hide') && !typing) render();
  lastStateJson = j;
}
function kick(m) { setToken(''); G.logout(); lobby = null; admin = null; showTitle(m); }

/** Fortschritt zum Server schicken */
let lastSync = 0;
export async function sync(extra = {}) {
  if (!S || !S.name) return;
  lastSync = Date.now();
  S.savedAt = Date.now(); G.save();
  await call('save', { money: S.m, shifts: G.store.shifts(S.name), rank: S.rank || '', skin: S.skin || 'standard', data: G.store.exportAll(S.name), ...extra });
}

// ---------------------------------------------------------------- Live-Event
function startLive(e) {
  G.playEvent(e.type, () => {
    const rw = eventReward(e.type, e.id, S.name);
    S.m += rw.money;
    let t = `Event geschafft! +${rw.money}€`;
    if (rw.weapon != null && !S.own.includes(rw.weapon)) { S.own.push(rw.weapon); S.wi = rw.weapon; t += ` · Du wurdest ausgewählt: ${WEAPONS[rw.weapon].name}!`; }
    S.evDone.push(e.id); S.evDone = S.evDone.slice(-50);
    sync();
    showMenu('🎉 ' + t);
  });
}

// ---------------------------------------------------------------- Klicks
async function act(a, v, el) {
  switch (a) {
    case 'anfangen': $('#title').classList.add('hide'); showMenu(); return;
    case 'login': return doLogin();
    case 'logout': await sync(); kick(''); return;
    case 'tab': tab = v; msg = ''; if (v === 'admin') admin = null; break;
    case 'play': G.startGame(v, null); return;
    case 'wear': if (!S.skins.includes(v) && !skinAllowed(v, S.role)) return; if (SKIN[v].only && !skinAllowed(v, S.role)) return; S.skin = v; G.save(); sync(); break;
    case 'buyskin': {
      const p = skinPrice(v);
      if (S.skins.includes(v) || S.m < p || !shopSkins(now()).includes(v)) return;
      S.m -= p; S.skins.push(v); S.skin = v; msg = `${SKIN[v].name} gekauft!`; G.save(); sync(); break;
    }
    case 'freeskin': {
      if (S.skins.includes(v) || !freeLeft(S.free, now()) || !shopSkins(now()).includes(v)) return;
      const mk = monthKey(now());
      S.free = S.free && S.free.month === mk ? { month: mk, used: S.free.used + 1 } : { month: mk, used: 1 };
      S.skins.push(v); S.skin = v; msg = `🎁 ${SKIN[v].name} gratis bekommen!`; G.save(); sync(); break;
    }
    case 'buyrank': { const r = RANK[v]; if (!r || S.ranks.includes(v) || S.m < r.price) return; S.m -= r.price; S.ranks.push(v); S.rank = v; msg = `Rang ${r.emoji} ${r.name} gekauft!`; G.save(); sync(); break; }
    case 'rank': if (v && !S.ranks.includes(v)) return; S.rank = v; G.save(); sync(); break;
    case 'evjoin': { const r = await call('event_join', { id: v }); msg = r.ok ? '✅ Beigetreten! Das Live-Event startet nach dem Beitritts-Timer.' : r.error; await poll(true); break; }
    case 'evtest': {
      if (S.role !== 'admin') return;
      const type = +v;
      G.playEvent(type, aborted => showMenu(aborted ? `🧪 Test von Event ${type} abgebrochen.` : `🧪 Test von Event ${type} fertig. (Keine Belohnung im Testmodus.)`), { test: true });
      return;
    }
    case 'evplay': { const e = ST && ST.events.find(x => x.id === v); if (e) startLive(e); return; }
    case 'evdel': await call('admin_event_delete', { id: v }); await poll(true); break;
    case 'evcreate': {
      const mode = (document.querySelector('input[name=evm]:checked') || {}).value;
      const startAt = mode === 'date' ? new Date($('#evdate').value).getTime() + srvOff : now() + Math.max(0, +$('#evmin').value) * 60000;
      const r = await call('admin_event_create', { type: +$('#evtype').value, title: $('#evtitle').value, startAt });
      msg = r.ok ? '✅ Event erstellt.' : r.error; await poll(true); break;
    }
    case 'lotjoin': { const r = await call('lottery_join'); msg = r.ok ? '✅ Du machst mit!' : r.error; await poll(true); break; }
    case 'lotstart': { const r = await call('admin_lottery_start', { amount: +$('#lotamt').value, minutes: +$('#lotmin').value }); msg = r.ok ? '✅ Verlosung gestartet.' : r.error; await poll(true); break; }
    case 'lotstop': await call('admin_lottery_stop'); await poll(true); break;
    case 'lobcreate': { const w = $('#lobworld').value, r = await call('lobby_create', { world: w }); if (r.ok) lobby = { code: r.code, world: w }; else msg = r.error; break; }
    case 'lobjoin': { const r = await call('lobby_join', { code: $('#lobcode').value }); if (r.ok) lobby = { code: r.code, world: r.world }; else msg = r.error; break; }
    case 'lobleave': if (lobby) await call('lobby_leave', { code: lobby.code }); lobby = null; break;
    case 'lobplay': if (lobby) G.startGame(lobby.world, lobby.code); return;
    case 'adrefresh': admin = null; break;
    case 'adr': {
      const r = await call('admin_act', { target: v, act: 'role', role: el.dataset.x });
      msg = r.ok ? `✅ ${v} ist jetzt ${el.dataset.x === 'admin' ? 'Admin' : el.dataset.x === 'op' ? 'OP' : 'Spieler'}.` : r.error;
      admin = null; break;
    }
    case 'adall': {
      const amt = Math.abs(+$('#allamt').value || 0);
      if (!amt) { msg = 'Betrag eingeben.'; break; }
      const give = el.dataset.x === 'give';
      if (!confirm(`${give ? 'Allen Spielern ' + amt + '€ geben' : 'Allen Spielern ' + amt + '€ abziehen'}?`)) return;
      const r = await call('admin_all', { act: 'money', amount: give ? amt : -amt });
      msg = r.ok ? `✅ ${r.count} Spieler: ${give ? '+' : '−'}${amt}€` : r.error;
      await poll(true); admin = null; break;
    }
    case 'ad': {
      const inp = [...document.querySelectorAll('.pamt')].find(i => i.dataset.p === v);
      const amt = Math.abs(Math.trunc(+(inp && inp.value) || 0)), x = el.dataset.x;
      if ((x === 'give' || x === 'take') && !amt) { msg = 'Betrag eingeben.'; break; }
      const body = x === 'give' || x === 'take' ? { target: v, act: 'money', amount: x === 'give' ? amt : -amt } : x === 'set' ? { target: v, act: 'setmoney', amount: amt } : { target: v, act: x };
      const r = await call('admin_act', body);
      msg = r.ok ? `✅ ${v}: ${x === 'give' ? '+' + amt + '€' : x === 'take' ? '−' + amt + '€' : x === 'set' ? 'Geld auf ' + amt + '€ gesetzt' : x === 'ban' ? 'gebannt' : 'entbannt'}` : r.error;
      admin = null; break;
    }
  }
  render();
}

export function initMenu() {
  buildTitle();
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-m]');
    if (!b || b.disabled || b.tagName === 'SELECT' || b.type === 'color') return;
    act(b.dataset.m, b.dataset.v, b);
  });
  document.addEventListener('change', async e => {
    const t = e.target;
    if (t.dataset.m === 'adrole') { const r = await call('admin_act', { target: t.dataset.v, act: 'role', role: t.value }); msg = r.ok ? `✅ ${t.dataset.v} ist jetzt ${t.value}.` : r.error; admin = null; render(); }
    if (t.dataset.m === 'tie') { S.tie = parseInt(t.value.slice(1), 16); G.save(); setPreview(S.skin); sync(); }
  });
  document.addEventListener('input', e => {
    if (e.target.id !== 'adsearch') return;
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('#adtable tr[data-n]').forEach(tr => { tr.style.display = !q || tr.dataset.n.includes(q) ? '' : 'none'; });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.target.id === 'pw' || e.target.id === 'un')) doLogin(); });
  setInterval(tickCountdowns, 1000);
  // im Menü alle 3 s, im Spiel alle 10 s abfragen
  let n = 0;
  setInterval(() => {
    n++;
    const inMenu = !$('#menu').classList.contains('hide');
    if (inMenu || n % 4 === 0) poll();
    if (S && S.name && Date.now() - lastSync > 20000 && S.ph === 'play') sync();
  }, 2500);
  showTitle();
}
