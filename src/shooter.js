// Schießabschnitte in den Live-Events: Ego-Sicht, der Spieler hält den Dark Point
// und schießt lila Energiestrahlen auf Aliens, Schattenkreaturen, Energiekerne oder den Boss.
import { skinModel } from './skins3d.js';
import { V, K, S } from './state.js';

/** Spielerposition vor der Tankstelle, Blick auf den Vorplatz (nach -x) */
const POS = { x: -16, y: 1.6, z: 10 };
const START_YAW = Math.PI / 2;

/**
 * cfg: { shoot: 'aliens'|'flyers'|'cores'|'boss', text, n, time, fast }
 * api: { THREE, sc, cam, ui }
 */
export function createShooter(api, cfg, onDone) {
  const { THREE, sc, cam, ui } = api;
  const root = new THREE.Group(); sc.add(root);
  const enemies = [], beams = [], bursts = [];
  const bas = (c, o) => { const m = new THREE.MeshBasicMaterial({ color: c }); if (o != null) { m.transparent = true; m.opacity = o; } return m; };
  const lam = (c, e) => new THREE.MeshLambertMaterial({ color: c, emissive: e || 0 });
  const rc = new THREE.Raycaster(), center = new THREE.Vector2(0, 0), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  let t = 0, kills = 0, hp = 8, spawnT = 0.5, hurtT = 0, lastShot = 0, ended = false, bossHp = cfg.n, deadMsg = false;

  // Dark Point in der Hand
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), bas(0xb050ff));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), bas(0x7a20ff, 0.3));
  orb.add(halo);
  // die eigene Spielfigur (mit Skin) hält den Dark Point in der rechten Hand hoch – Kamera hinter der Figur
  const me = skinModel(THREE, (S && S.skin) || 'standard', { tieColor: S && S.tie });
  root.add(me);
  me.userData.ra.children[0].add(orb); orb.position.set(0, -0.42, 0.04);
  const handLight = new THREE.PointLight(0xa040ff, 1.6, 8); orb.add(handLight);

  // Kulisse je nach Aufgabe
  if (cfg.shoot === 'aliens' || cfg.shoot === 'swarm') {
    const ship = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 12), lam(0x8a90a0, 0x101418)); body.scale.y = 0.25; ship.add(body);
    ship.add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 12), lam(0xaaf0ff, 0x2090a0)));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 5, 13, 20, 1, true), bas(0x9fffe0, 0.16)); beam.material.side = THREE.DoubleSide; beam.position.y = -6.5; ship.add(beam);
    for (let i = 0; i < 12; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), bas(i % 2 ? 0xffe060 : 0x60ffd0)); l.position.set(Math.cos(i / 12 * 6.28) * 5.4, -0.3, Math.sin(i / 12 * 6.28) * 5.4); ship.add(l); }
    ship.position.set(-26, 13, 8); root.add(ship); root.userData.ship = ship;
  }
  if (cfg.shoot === 'cores' || cfg.shoot === 'flyers') {
    const p = new THREE.Group();
    p.add(new THREE.Mesh(new THREE.TorusGeometry(5, 0.45, 10, 40), bas(0x9a40ff)));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(4.7, 40), bas(0x3a1060, 0.45)); disc.material.side = THREE.DoubleSide; p.add(disc);
    p.position.set(-34, 9, 8.5); p.lookAt(POS.x, 8, POS.z); root.add(p); root.userData.portal = p;
  }
  if (cfg.shoot === 'cores') {
    for (let i = 0; i < cfg.n; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.6), bas(0xd080ff)));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), bas(0x7a20ff, 0.3)));
      g.userData = { kind: 'core', a: (i / cfg.n) * Math.PI * 2, hp: 3 };
      root.add(g); enemies.push(g);
    }
  }
  if (cfg.shoot === 'boss') {
    const d = lam(0x050505), g = new THREE.Group();
    const part = (geo, x, y, z, m) => { const o = new THREE.Mesh(geo, m || d); o.position.set(x, y, z); g.add(o); };
    part(new THREE.BoxGeometry(3, 6, 2), 0, 6, 0); part(new THREE.SphereGeometry(1.8, 12, 10), 0, 10.5, 0);
    part(new THREE.BoxGeometry(1, 7, 1), -2.4, 6, 0); part(new THREE.BoxGeometry(1, 7, 1), 2.4, 6, 0);
    part(new THREE.BoxGeometry(1.2, 4, 1.2), -0.8, 2, 0); part(new THREE.BoxGeometry(1.2, 4, 1.2), 0.8, 2, 0);
    part(new THREE.SphereGeometry(0.35, 8, 6), -0.6, 10.8, 1.6, bas(0xff1010)); part(new THREE.SphereGeometry(0.35, 8, 6), 0.6, 10.8, 1.6, bas(0xff1010));
    g.position.set(-40, 0, 8.5); g.scale.setScalar(0.9);
    g.userData = { kind: 'boss' };
    root.add(g); enemies.push(g);
  }

  if (cfg.shoot === 'masked') {
    // Bosskampf gegen die schwarz maskierte Gestalt
    const g = skinModel(THREE, 'maskiert');
    g.scale.setScalar(1.15);
    g.position.set(-26, 0, 10);
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), bas(0x9a40ff, 0.22)); aura.scale.set(0.8, 1.6, 0.6); aura.position.y = 1.0; g.add(aura);
    const gl = new THREE.PointLight(0xb060ff, 2.2, 9); gl.position.set(0, 2.2, 0.8); g.add(gl);
    g.userData.kind = 'masked'; g.userData.tp = 3.5; g.userData.at = 2.2; g.userData.hit = 0; g.userData.goal = null;
    root.add(g); enemies.push(g);
  }
  const isBoss = cfg.shoot === 'boss' || cfg.shoot === 'masked';

  V.yaw = START_YAW; V.pit = cfg.shoot === 'masked' ? 0 : cfg.horde ? -0.05 : cfg.shoot === 'swarm' ? 0.5 : cfg.shoot === 'boss' ? 0.25 : cfg.shoot === 'flyers' || cfg.shoot === 'cores' ? 0.2 : 0.02;
  ui.shooting(true);
  hud();

  function hud() {
    const left = Math.max(0, Math.ceil(cfg.time - t));
    const goal = isBoss
      ? `${cfg.shoot === 'masked' ? 'Maskierte Gestalt' : 'Boss'} <span class=bossbar><i style="width:${Math.max(0, bossHp / cfg.n * 100)}%"></i></span>`
      : `🎯 ${kills}/${cfg.n}`;
    ui.shootHud(`<b>${cfg.text}</b><br>${goal} · ⏱️ ${left}s · ${'❤️'.repeat(Math.max(0, hp))}${hp <= 0 ? ' 💀' : ''}`);
  }

  function spawn() {
    if (cfg.shoot === 'swarm') {
      // fliegende grüne Aliens kommen aus dem Raumschiff herunter
      const a = skinModel(THREE, 'alien');
      a.scale.setScalar(0.85);
      a.position.set(-24 + (Math.random() - 0.5) * 10, 10 + Math.random() * 4, 6 + (Math.random() - 0.5) * 16);
      a.userData.kind = 'swarm'; a.userData.hp = 1; a.userData.sp = 2 + Math.random() * 1.2; a.userData.wob = Math.random() * 6; a.userData.hit = 0;
      root.add(a); enemies.push(a);
    } else if (cfg.shoot === 'aliens') {
      const a = skinModel(THREE, 'alien');
      a.position.set(-26 + (Math.random() - 0.5) * 6, 0, 8 + (Math.random() - 0.5) * 14);
      a.userData.kind = 'alien'; a.userData.hp = cfg.fast ? 2 : 1; a.userData.sp = (cfg.fast ? 1.8 : 1.2) + Math.random() * 0.6; a.userData.hit = 0;
      root.add(a); enemies.push(a);
    } else if (cfg.shoot === 'flyers') {
      const c = new THREE.Group();
      c.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), lam(0x2a0a3a, 0x3a0a5a)));
      c.add(new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), bas(0x9a40ff, 0.25)));
      c.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 4), bas(0xff2020)).translateX(-0.25).translateY(0.12).translateZ(0.62));
      c.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 4), bas(0xff2020)).translateX(0.25).translateY(0.12).translateZ(0.62));
      const p = root.userData.portal.position;
      c.position.set(p.x + (Math.random() - 0.5) * 6, p.y + (Math.random() - 0.5) * 6, p.z + (Math.random() - 0.5) * 6);
      c.userData = { kind: 'flyer', hp: 1, sp: 2 + Math.random() * 1.2, wob: Math.random() * 6 };
      root.add(c); enemies.push(c);
    }
  }

  function enemyOf(o) { while (o && !o.userData.kind) o = o.parent; return o; }

  function burst(p, c) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), bas(c || 0xd080ff, 0.9));
    b.position.copy(p); b.userData.t = 0; root.add(b); bursts.push(b);
  }

  function fire() {
    if (ended || hp <= 0) return;
    const now = performance.now();
    if (now - lastShot < 220) return;
    lastShot = now;
    rc.setFromCamera(center, cam);
    let hits = rc.intersectObjects(enemies, true);
    if (!hits.length) {
      // Zielhilfe (Touch): nächster Gegner in einem kleinen Kegel um das Fadenkreuz
      let best = null, bestA = 0.09;
      for (const e of enemies) {
        const c = e.getWorldPosition(new THREE.Vector3());
        if (e.userData.kind === 'alien' || e.userData.kind === 'swarm') c.y += 1.0;
        const dir = c.clone().sub(rc.ray.origin), d = dir.length();
        let a;
        if (e.userData.kind === 'alien' || e.userData.kind === 'masked') {
          // Gegner am Boden: nur die Richtung links/rechts zählt, die Höhe zielt automatisch
          const rd = rc.ray.direction;
          a = Math.abs(Math.atan2(dir.x, dir.z) - Math.atan2(rd.x, rd.z));
          if (a > Math.PI) a = 2 * Math.PI - a;
          a *= 0.6;
        } else a = dir.normalize().angleTo(rc.ray.direction);
        if (a < bestA && d < 45) { bestA = a; best = { object: e.children[0] || e, point: c }; }
      }
      if (best) hits = [best];
    }
    const from = orb.getWorldPosition(tmp.clone());
    let to;
    if (hits.length) {
      to = hits[0].point;
      const e = enemyOf(hits[0].object);
      if (e) {
        if (e.userData.kind === 'boss' || e.userData.kind === 'masked') {
          bossHp--; e.userData.hit = 0.15; burst(to, e.userData.kind === 'masked' ? 0xa040ff : 0xff4040);
          if (bossHp <= 0) { kills = cfg.n; e.userData.flee = true; win(); }
        }
        else {
          e.userData.hp--; e.userData.hit = 0.15;
          if (e.userData.hp <= 0) { kills++; burst(e.getWorldPosition(tmp2.clone()).setY(to.y), 0xb050ff); root.remove(e); enemies.splice(enemies.indexOf(e), 1); if (kills >= cfg.n) win(); }
        }
      }
    } else to = rc.ray.at(60, new THREE.Vector3());
    const len = from.distanceTo(to);
    for (const [r, c, o] of [[0.06, 0x05000a, 0.95], [0.18, 0xa040ff, 0.45]]) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), bas(c, o));
      beam.position.copy(from).lerp(to, 0.5); beam.lookAt(to); beam.rotateX(Math.PI / 2);
      beam.userData.t = 0; root.add(beam); beams.push(beam);
    }
    halo.scale.setScalar(1.8);
    hud();
  }

  function win() {
    if (ended) return;
    ended = true;
    ui.shootHud(`<b>✅ Geschafft! ${cfg.shoot === 'masked' ? 'Die maskierte Gestalt ist verletzt und flieht!' : cfg.shoot === 'boss' ? 'Die Kreatur ist besiegt!' : kills + ' Gegner erledigt!'}</b>`);
    setTimeout(stop, 1600);
  }
  function timeUp() {
    if (ended) return;
    ended = true;
    ui.shootHud(`<b>${kills >= cfg.n * 0.5 || hp > 0 ? '⏱️ Zeit um – ihr habt durchgehalten!' : '💀 Die anderen Spieler haben es zum Glück geschafft!'}</b> (${kills} Treffer)`);
    setTimeout(stop, 1800);
  }
  function stop() {
    sc.remove(root); cam.remove(orb);
    ui.shooting(false); ui.shootHud('');
    onDone({ kills, survived: hp > 0 });
  }

  function update(dt) {
    t += dt;
    // Blicksteuerung: Wischen (V.yaw/V.pit aus der Szene), Joystick und Pfeiltasten
    V.yaw -= V.jx * dt * 2.4;
    V.pit = Math.max(-0.6, Math.min(1.1, V.pit - V.jy * dt * 1.6));
    V.yaw += ((K.arrowleft || K.a ? 1 : 0) - (K.arrowright || K.d ? 1 : 0)) * dt * 2.2;
    V.pit += ((K.arrowup || K.w ? 1 : 0) - (K.arrowdown || K.s ? 1 : 0)) * dt * 1.4;
    const sy = Math.sin(V.yaw), cy = Math.cos(V.yaw);
    const back = 3.6 + Math.max(0, V.pit) * 1.4;
    cam.position.set(POS.x + sy * back + cy * 1.1, Math.max(0.5, POS.y + 0.5 - Math.sin(V.pit) * 1.4), POS.z + cy * back - sy * 1.1);
    cam.rotation.set(V.pit, V.yaw, 0);
    me.position.set(POS.x, 0, POS.z); me.rotation.y = V.yaw + Math.PI;
    me.userData.ra.rotation.x = -(Math.PI / 2 + V.pit * 0.9);
    halo.scale.setScalar(Math.max(1, halo.scale.x - dt * 4));

    if (!ended) {
      if (t >= cfg.time) timeUp();
      spawnT -= dt;
      const maxAlive = cfg.shoot === 'swarm' || cfg.horde ? 18 : cfg.fast ? 14 : 10;
      if (spawnT <= 0 && ['aliens', 'flyers', 'swarm'].includes(cfg.shoot) && enemies.length < maxAlive) {
        spawn(); spawnT = (cfg.shoot === 'swarm' || cfg.horde ? 0.45 : cfg.fast ? 0.7 : 1.1) + Math.random() * 0.6;
      }
    }
    const ship = root.userData.ship; if (ship) ship.rotation.y += dt * 0.6;
    const portal = root.userData.portal; if (portal) portal.children[0].rotation.z += dt;

    hurtT -= dt;
    const gone = [];
    for (const e of enemies) {
      const u = e.userData;
      if (u.kind === 'core') {
        u.a += dt * 0.5;
        e.position.set(-34 + Math.cos(u.a) * 0.2, 9 + Math.sin(u.a) * 4.2, 8.5 + Math.cos(u.a) * 4.2);
        e.rotation.y += dt * 2;
        continue;
      }
      if (u.kind === 'masked') {
        if (u.flee) { e.position.y += dt * 5; e.rotation.y += dt * 6; continue; }
        if (ended) continue;
        u.tp -= dt; u.at -= dt;
        if (u.tp <= 0) { // Teleport
          burst(e.position.clone().setY(1.2), 0x30103a);
          e.position.set(-29 + Math.random() * 7, 0, 3 + Math.random() * 14);
          burst(e.position.clone().setY(1.2), 0x6020a0);
          u.tp = 3 + Math.random() * 1.5; u.goal = null;
        }
        if (!u.goal || e.position.distanceTo(u.goal) < 0.3) u.goal = new THREE.Vector3(-29 + Math.random() * 7, 0, 3 + Math.random() * 14);
        tmp.copy(u.goal).sub(e.position);
        const l = tmp.length();
        if (l > 0.01) e.position.add(tmp.normalize().multiplyScalar(Math.min(l, 4.5 * dt)));
        e.lookAt(POS.x, 0, POS.z);
        const a = Math.sin(t * 10) * 0.6; u.lg.rotation.x = a; u.rg.rotation.x = -a; u.la.rotation.x = -a;
        u.ra.rotation.x = u.at < 0.4 ? -2.6 : a;
        if (u.at <= 0) { // dunkle Energiekugel werfen
          u.at = 2 + Math.random() * 1.2;
          const pr = new THREE.Group();
          pr.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), bas(0x0a0010)));
          pr.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), bas(0xa040ff, 0.35)));
          pr.position.copy(e.position).add(new THREE.Vector3(0, 1.9, 0));
          pr.userData = { kind: 'proj', hp: 1, sp: 4.2, wob: 0, hit: 0 };
          root.add(pr); enemies.push(pr);
        }
        if (u.hit > 0) { u.hit -= dt; e.visible = Math.floor(u.hit * 40) % 2 === 0; } else e.visible = true;
        continue;
      }
      if (u.kind === 'boss') {
        const d = POS.x - e.position.x; // Abstand zum Spieler
        if (!ended && d > 9) e.position.x += dt * 1.1;
        e.rotation.y = Math.PI / 2;
        if (!ended && d <= 9.5 && hurtT <= 0) { hurt(); }
        continue;
      }
      const fly = u.kind === 'flyer' || u.kind === 'swarm' || u.kind === 'proj';
      tmp.set(POS.x - e.position.x, (fly ? POS.y + (u.kind === 'swarm' ? 0.4 : 0) : 0) - e.position.y, POS.z - e.position.z);
      const dist = tmp.length();
      if (dist > 1.3 && !ended) {
        tmp.normalize().multiplyScalar(u.sp * dt);
        e.position.add(tmp);
        if (fly && u.kind !== 'proj') { e.position.y += Math.sin(t * 4 + u.wob) * dt; e.position.x += Math.cos(t * 3 + u.wob) * dt * 0.8; }
        e.lookAt(POS.x, e.position.y, POS.z);
        if (e.userData.lg) { const a = Math.sin(t * 9 + u.sp) * 0.6; e.userData.lg.rotation.x = a; e.userData.rg.rotation.x = -a; e.userData.la.rotation.x = -a; e.userData.ra.rotation.x = a; }
      } else if (!ended) { hurt(); gone.push(e); burst(e.position.clone().setY(1.2), 0x40ff60); }
      if (u.hit > 0) { u.hit -= dt; e.visible = Math.floor(u.hit * 40) % 2 === 0; } else e.visible = true;
    }
    for (const e of gone) { root.remove(e); enemies.splice(enemies.indexOf(e), 1); }
    for (const b of beams) { b.userData.t += dt; b.material.opacity = Math.max(0, 0.9 - b.userData.t * 7); }
    for (const b of bursts) { b.userData.t += dt; b.scale.setScalar(1 + b.userData.t * 6); b.material.opacity = Math.max(0, 0.9 - b.userData.t * 3); }
    for (const list of [beams, bursts]) for (let i = list.length - 1; i >= 0; i--) if (list[i].material.opacity <= 0) { root.remove(list[i]); list.splice(i, 1); }
    if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) hud();
  }

  function hurt() {
    hurtT = 1.4;
    if (hp <= 0 || ended) return;
    hp--;
    ui.hurt();
    if (hp <= 0 && !deadMsg) { deadMsg = true; hud(); setTimeout(timeUp, 1200); }
    hud();
  }

  /** sofort abbrechen (Admin-Test beendet) */
  function abort() { ended = true; sc.remove(root); cam.remove(orb); ui.shooting(false); ui.shootHud(''); }
  return { update, fire, abort };
}
