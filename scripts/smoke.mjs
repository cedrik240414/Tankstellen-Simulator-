// Startet das gebaute Spiel headless, spielt jede Welt kurz an und macht Screenshots.
// Aufruf: npm run build && node scripts/smoke.mjs [dist/index.html] [screenshots]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright')); }

const target = process.argv[2] || 'dist/index.html';
const out = process.argv[3] || 'screenshots';
mkdirSync(out, { recursive: true });
const url = /^https?:/.test(target) ? target : 'file://' + resolve(target);

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
const page = await ctx.newPage();
const errors = [], checks = [];
const check = (ok, msg) => { checks.push((ok ? 'OK   ' : 'FAIL ') + msg); if (!ok) errors.push(msg); };
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const shot = name => page.screenshot({ path: `${out}/${name}.png` });
const ev = (fn, arg) => page.evaluate(fn, arg);
const wait = ms => page.waitForTimeout(ms);
// Spielerposition in Weltkoordinaten setzen (x,z), Blick yaw
const tp = (x, z, yaw, pit = 0) => ev(([x, z, yaw, pit]) => { const n = window.__ns; n.S.px = x / 0.2 + 50; n.S.py = z / 0.14 + 50; n.V.yaw = yaw; n.V.pit = pit; }, [x, z, yaw, pit]);

await page.goto(url);
await shot('00-menu');

// Titel -> Anfangen -> Login
await page.click('[data-m=anfangen]');
await page.fill('#un', 'crim'); await page.fill('#pw', 'falsch');
await page.click('[data-m=login]');
await wait(300);
check((await page.textContent('#mcontent')).includes('Falsches Passwort'), 'Admin mit falschem Passwort abgelehnt');
await page.fill('#un', 'crim'); await page.fill('#pw', 'Hotdog24');
await page.click('[data-m=login]');
await wait(600);
await shot('01-hauptmenue');
await page.click('[data-m=play][data-v=tank]');
await wait(800);
check(await ev(() => window.__ns.S.adm === true), 'Admin-Login');
await shot('01-tank-start');

// Kunde abwarten, bis er an der Theke steht
for (let i = 0; i < 40 && !(await ev(() => window.__ns.S.c && window.__ns.S.c.arr)); i++) await wait(500);
check(await ev(() => !!(window.__ns.S.c && window.__ns.S.c.arr)), 'Kunde kommt an der Theke an');
await tp(6.8, 2.9, Math.PI / 2 + 0.3, -0.15);
await wait(600);
const status = await ev(() => document.querySelector('#ib .id')?.textContent || '');
check(/Status: (lebendig|TOT|HONK)/.test(status), 'Ausweis zeigt echten Status: ' + status.replace(/\s+/g, ' ').slice(0, 80));
await shot('02-tank-theke-ausweis');
await page.click('#ib [data-a=idc]');
await wait(200);
check(!!(await ev(() => window.__ns.S.ds)), 'Antippen des Ausweises: Kunde antwortet');
await shot('03-tank-ausweis-antwort');

// Monitor + Register-Suche
await page.click('#mb');
await wait(200);
const nm = await ev(() => window.__ns.S.c.name);
await page.fill('#nm', nm); await page.click('[data-a=srch]');
await wait(200);
check((await page.textContent('#view')).includes('REGISTER'), 'Register findet ' + nm);
await shot('04-monitor-register');
await page.click('[data-a=cam][data-v="2"]');
await wait(500);
await shot('05-kamera-laden');
await page.click('[data-a=mon]'); await wait(200);
await page.click('[data-a=mon]').catch(() => {}); // Monitor schließen falls noch offen
await ev(() => { const n = window.__ns; if (n.S.mon) n.act('mon'); });

// Verkaufen
const m0 = await ev(() => window.__ns.S.m);
await ev(() => window.__ns.act('sell'));
await wait(200);
const after = await ev(() => ({ m: window.__ns.S.m, sc: window.__ns.S.sc, bw: window.__ns.S.bw }));
checks.push('INFO verkauft: Geld ' + m0 + ' -> ' + after.m + ', Fehler ' + after.sc + ', Beschwerden ' + after.bw);

// Waffen-Modelle
await ev(() => { const n = window.__ns; n.act('gm', 1000); });
for (const i of [0, 12, 24, 33, 47, 50, 51, 54, 55, 56]) {
  await ev(i => { const n = window.__ns; if (!n.S.own.includes(i)) n.S.own.push(i); n.act('eq', i); n.V.yaw = 0; n.V.pit = 0; }, i);
  await tp(0, 1, Math.PI);
  await wait(250);
  await shot('06-waffe-' + String(i).padStart(2, '0'));
}
await ev(() => window.__ns.act('eq', 33));
await ev(() => window.__ns.act('zap'));
await wait(40);
await shot('07-schuss');

// Waldweg + Altar
await tp(-4.7, -40, 0, -0.1); await wait(400); await shot('08-altar');

// alle Welten
const worlds = ['back', 'winter', 'pirate', 'alien', 'hallo', 'pizza'];
for (const w of worlds) {
  await ev(w => window.__ns.act('world', w), w);
  await wait(800);
  check(await ev(w => window.__ns.S.map === w, w), 'Welt gewechselt: ' + w);
  await shot('10-' + w);
  if (w !== 'pizza') { await tp(-12, -2, -0.6); await wait(400); await shot('11-' + w + '-aussen'); }
}
// Pizzeria: Hunde auf der Bühne ansehen, Tür schließen
await tp(60, 2, 0, -0.05); await wait(600); await shot('12-pizza-buehne');
await ev(() => { const n = window.__ns; n.S.pz.a.forEach(a => { a.pos = 3; }); });
await tp(60, 5.5, Math.PI / 2, -0.1); await wait(1500); await shot('13-pizza-tuer-links');
await ev(() => window.__ns.act('pdoor', 0)); await wait(400); await shot('14-pizza-tuer-zu');

// Touch: Joystick links wischen
await ev(() => window.__ns.act('world', 'tank'));
await wait(300);
const p0 = await ev(() => [window.__ns.S.px, window.__ns.S.py]);
const box = await page.locator('#fp').boundingBox();
const cdp = await ctx.newCDPSession(page);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
await touch('touchStart', box.x + 120, box.y + box.height - 80);
for (let k = 1; k <= 6; k++) { await touch('touchMove', box.x + 120, box.y + box.height - 80 - k * 10); await wait(60); }
await wait(700);
await touch('touchEnd');
const p1 = await ev(() => [window.__ns.S.px, window.__ns.S.py]);
check(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 1, 'Touch-Joystick bewegt den Spieler');
const yaw0 = await ev(() => window.__ns.V.yaw);
await touch('touchStart', box.x + box.width - 200, box.y + 200);
for (let k = 1; k <= 6; k++) { await touch('touchMove', box.x + box.width - 200 - k * 15, box.y + 200); await wait(30); }
await touch('touchEnd');
check(Math.abs((await ev(() => window.__ns.V.yaw)) - yaw0) > 0.2, 'Touch rechts dreht die Kamera');

// iPad-Hochformat
await page.setViewportSize({ width: 820, height: 1180 });
await wait(400);
await shot('20-ipad-hochformat');
const small = await ev(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).map(b => b.textContent.trim()).slice(0, 10));
check(small.length === 0, 'Alle sichtbaren Knöpfe >= 44px hoch' + (small.length ? ': ' + small.join(' | ') : ''));

console.log(checks.join('\n'));
console.log(errors.length ? '\nFEHLER:\n' + errors.join('\n') : '\nKeine JS-Fehler');
await browser.close();
process.exit(errors.length ? 1 : 0);
