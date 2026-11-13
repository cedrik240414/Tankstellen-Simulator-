// Live-Events: „The Dark Point Saga“ in 15 Teilen.
// Jedes Event ist eine Folge von Kameraeinstellungen (shots) mit Story-Text,
// Bühnenteilen (props) und manchmal einer kleinen Aufgabe (task).
import { skinModel } from './skins3d.js';

/** Event-Waffen (Indizes in config.js WEAPONS) */
export const EV_WEAPON = { blade: 57, blaster: 58, rifle: 59, laser: 60 };

// Kamera-Kurzformen: [x,y,z] Position, Blickziel
const OUT = [-26, 4, 18], SHOP = [-6, 2, 0], SKY = [0, 14, 0];
const sh = (text, from, to, look, dur = 6, props, fx) => ({ text, from, to: to || from, look, dur, props: props || [], fx });

export const STORY = [
  { t: 'The Dark Point', shots: [
    sh('Mitten in der Nacht verlassen plötzlich alle Kunden die Tankstelle …', [-30, 3, 22], [-24, 3, 16], SHOP, 5),
    sh('Ein Meteor rast vom Himmel und schlägt direkt vor der Tankstelle ein!', [-30, 3, 22], [-28, 5, 20], [-12, 2, 10], 5, ['meteor']),
    sh('Aus dem Krater steigt eine leuchtende Kugel: der DARK POINT.', [-20, 2, 16], [-17, 1.8, 14], [-12, 1.2, 10], 5, ['orb']),
    sh('Eine mysteriöse maskierte Gestalt taucht auf und greift nach dem Dark Point …', [-18, 2, 15], [-16, 2, 13], [-10, 1.2, 10], 6, ['orb', 'figure']),
    sh('Du stellst dich ihr in den Weg. Die Gestalt verletzt sich und fliegt davon.', [-16, 2, 13], [-15, 3, 12], [-9, 3, 10], 5, ['orb', 'figureFly']),
    sh('Du nimmst den Dark Point an dich.', [-14, 1.8, 11.5], [-13, 1.6, 10.8], [-12, 1.2, 10], 4, ['orb']),
  ], reward: 'blade' },
  { t: 'The New Visitors', abduct: true, shots: [
    sh('Am nächsten Abend wollen alle Kunden plötzlich nach draußen.', OUT, [-24, 4, 16], SHOP, 4),
    sh('Ein riesiges Raumschiff erscheint über der Tankstelle!', OUT, [-28, 2, 20], [0, 12, 0], 6, ['ship']),
    sh('Eine Gruppe Aliens kommt aus dem Raumschiff.', [-20, 2, 14], [-18, 2, 12], [-10, 1, 9], 5, ['ship', 'aliens']),
  ], task: { text: 'Verteidige die Tankstelle mit dem Dark Point!', btn: '⚡ Dark Point', n: 15 }, after: [
    sh('Das Raumschiff explodiert, die Kapitänin flieht in den Trümmern.', OUT, [-30, 3, 22], [0, 12, 0], 5, ['explode']),
    sh('Sie schreit: „ICH KRIEGE DICH NOCH!“', OUT, OUT, [0, 14, 0], 4),
  ] },
  { t: 'The Strange Signal', shots: [
    sh('Das dritte Event beginnt ganz normal …', [-6, 1.7, 4], [-3, 1.7, 2], [0, 1.5, -6], 4),
    sh('Plötzlich flackern alle Lichter. Die Zapfsäulen funktionieren nicht mehr.', [-20, 2, 8], [-19, 2, 6], [-14, 1, 0], 5, ['flicker']),
    sh('Aus dem Radio: „Der Dark Point gehört nicht euch. Ihr wisst nicht, was ihr getan habt.“', [-6, 1.7, 4], [-6, 1.7, 4], [6, 1.2, 3], 6, ['flicker']),
    sh('Eine Cutscene zeigt ein riesiges schwarzes Objekt im All …', [0, 30, 60], [0, 30, 40], [0, 30, -40], 5, ['eyeShadow']),
    sh('Die Kamera zoomt heran: die Silhouette einer riesigen Kreatur.', [0, 30, 20], [0, 30, -10], [0, 30, -40], 5, ['eyeShadow', 'dark']),
  ] },
  { t: 'The Warning', shots: [
    sh('Plötzlich erscheint eine Hologramm-Nachricht auf dem Gelände.', [-22, 2, 14], [-18, 2, 12], [-12, 1.5, 8], 5, ['holo']),
    sh('Die maskierte Gestalt sieht verletzt aus: „Ihr habt keine Ahnung, was ihr freigelassen habt.“', [-15, 1.8, 10], [-14, 1.8, 9.5], [-12, 1.6, 8], 6, ['holo']),
    sh('„Der Dark Point ist kein normaler Gegenstand. Er ist der Schlüssel zu etwas viel Größerem.“', [-15, 1.8, 10], [-15.5, 2, 10.5], [-12, 1.6, 8], 6, ['holo']),
    sh('Hinter ihr öffnet sich ein riesiges Portal. Dunkle Energie und Blitze.', OUT, [-28, 3, 20], [0, 8, -20], 5, ['holo', 'portal']),
    sh('„Wenn es kommt, wird euch nichts mehr retten.“ Das Hologramm verschwindet.', [-15, 1.8, 10], [-15, 1.8, 10], [-12, 1.6, 8], 5, ['portal']),
  ] },
  { t: 'The Dark Invasion', shots: [
    sh('Der Himmel wird dunkel. Über der Tankstelle erscheinen mehrere Portale.', OUT, [-28, 2, 22], SKY, 5, ['portals', 'dark']),
    sh('Aus den Portalen kommen dunkle Kreaturen und fliegen auf die Tankstelle zu!', [-20, 3, 15], [-16, 3, 12], [0, 6, 0], 6, ['portals', 'creatures', 'dark']),
  ], task: { text: 'Lauf zum Dark Point und aktiviere ihn!', btn: '🟣 Aktivieren', n: 12 }, after: [
    sh('Der Dark Point erzeugt eine riesige Schutzkuppel. Die Kreaturen prallen ab.', OUT, [-32, 6, 26], SHOP, 6, ['dome', 'creatures', 'portals']),
    sh('Die maskierte Gestalt erscheint: „Ihr habt gerade erst angefangen.“', [-14, 1.8, 11], [-13, 1.8, 10.5], [-10, 1.6, 10], 5, ['figure', 'dome']),
  ], reward: 'blaster' },
  { t: 'The Lost Memory', shots: [
    sh('Der Dark Point beginnt plötzlich zu leuchten …', [-14, 1.6, 11], [-13, 1.5, 10.6], [-12, 1.2, 10], 4, ['orb']),
    sh('Erinnerungen der maskierten Gestalt: Sie hat den Dark Point früher beschützt.', [-16, 2, 13], [-14, 2, 12], [-12, 1.2, 10], 6, ['orb', 'figure', 'memory']),
    sh('Sie war früher kein Feind, sondern eine Wächterin.', [-14, 1.7, 12], [-13, 1.7, 11.5], [-10, 1.5, 10], 5, ['orb', 'figure', 'memory']),
    sh('Dann: eine dunkle Kreatur, die sie kontrolliert.', [0, 6, 10], [0, 8, 4], [0, 8, -25], 5, ['creature', 'memory', 'dark']),
    sh('„Die Wahrheit ist näher, als ihr denkt.“', [-14, 1.7, 12], [-14, 1.7, 12], [-10, 1.5, 10], 4, ['figure', 'memory']),
  ] },
  { t: 'The Abandoned Base', shots: [
    sh('Eine alte, geheime Militärbasis. Verlassene Räume, alte Computer und Waffen.', [196, 1.8, 206], [198, 1.8, 202], [200, 1.5, 196], 6, ['base']),
    sh('Auf einem Bildschirm: „PROJEKT DARK POINT – EXPERIMENT FEHLGESCHLAGEN“', [200, 1.7, 200], [200, 1.7, 199], [200, 1.8, 195], 5, ['base']),
    sh('Ein alter Wissenschaftler in einer Videoaufnahme sagt:', [201, 1.7, 199], [200.5, 1.7, 198.5], [202, 1.6, 196], 4, ['base', 'scientist']),
    sh('„Falls jemand diese Nachricht findet, dann ist der Dark Point in die falschen Hände geraten.“', [201, 1.7, 199], [201, 1.7, 198.8], [202, 1.6, 196], 7, ['base', 'scientist']),
    sh('Ein paar von euch dürfen eine Kiste öffnen …', [198, 1.5, 199], [198.5, 1.2, 198], [199, 0.4, 196.5], 4, ['base', 'chest']),
  ], reward: 'rifle' },
  { t: 'The Dark Side', shots: [
    sh('Der Dark Point schwebt plötzlich in die Luft. Alle Lichter gehen aus.', [-15, 2, 12], [-15, 3, 12], [-12, 3, 10], 5, ['orbFloat', 'dark']),
    sh('Er bekommt eine dunkle Seite und eine helle Seite.', [-14, 3, 11.5], [-13.5, 3, 11], [-12, 3, 10], 5, ['orbFloat', 'dark']),
    sh('Zwei Stimmen gleichzeitig: „Wir sind endlich wieder vereint.“', [-14, 3, 11.5], [-14, 3, 11.5], [-12, 3, 10], 5, ['orbFloat', 'dark']),
    sh('Eine gewaltige Energiewelle! Alle werden zurück zur Tankstelle geschleudert.', OUT, [-34, 6, 28], SHOP, 5, ['explode']),
  ] },
  { t: 'The Mask', shots: [
    sh('Die maskierte Gestalt erscheint plötzlich. Sie greift diesmal nicht an.', [-15, 1.8, 13], [-14, 1.8, 12], [-10, 1.6, 10], 5, ['figure']),
    sh('Sie nimmt ihre Maske kurz ab: „Ihr müsst mir zuhören. Ich habe euch beschützt.“', [-11.5, 1.75, 11.2], [-11.2, 1.75, 11], [-10, 1.65, 10], 6, ['figure']),
    sh('Sie erklärt: Eine noch größere Macht will den Dark Point.', [-12, 1.75, 11.5], [-12.5, 2, 12], [-10, 1.65, 10], 5, ['figure']),
    sh('Plötzlich wird sie von einem dunklen Strahl weggezogen …', [-15, 2, 13], [-16, 3, 14], [-10, 4, 10], 4, ['figureFly', 'dark']),
    sh('Ihr seht nur noch ihre Maske am Boden.', [-11, 1, 11], [-10.6, 0.7, 10.6], [-10, 0.1, 10], 4, ['maskOnly']),
  ] },
  { t: 'The Portal', abduct: true, shots: [
    sh('Über der Tankstelle öffnet sich ein riesiges Portal.', OUT, [-28, 2, 20], [0, 12, -10], 5, ['portal']),
    sh('Ein gewaltiges Raumschiff kommt aus dem Portal.', OUT, [-30, 3, 22], [0, 12, 0], 6, ['portal', 'ship']),
    sh('Im Inneren: hunderte kleine Lichter. Eine Stimme: „Die Erde wurde gefunden.“', [300, 2, 308], [300, 3, 304], [300, 2, 296], 6, ['shipInside']),
    sh('Eine ganze Flotte von Raumschiffen fliegt auf die Erde zu.', [0, 20, 40], [0, 25, 30], [0, 30, -60], 6, ['fleet']),
  ], reward: 'laser' },
  { t: 'The Last Defense', abduct: true, shots: [
    sh('Die Aliens greifen erneut an – diesmal viel stärker.', OUT, [-28, 3, 20], [0, 10, 0], 5, ['ship', 'fleet', 'aliens']),
    sh('Die Tankstelle wird beschädigt, überall Explosionen!', [-20, 3, 14], [-18, 4, 12], SHOP, 5, ['explode', 'aliens', 'flicker']),
  ], task: { text: 'Aktiviert gemeinsam den Energiegenerator!', btn: '🔋 Generator', n: 20 }, after: [
    sh('Die Raumschiffe fliegen weg …', OUT, [-30, 3, 22], [0, 20, -30], 5, ['fleet']),
    sh('… doch eines bleibt zurück.', OUT, OUT, [0, 12, 0], 4, ['ship']),
  ] },
  { t: 'The True Enemy', shots: [
    sh('Ein riesiges schwarzes Wesen erscheint aus dem Raumschiff.', OUT, [-32, 2, 26], [0, 10, -25], 6, ['ship', 'creature', 'dark']),
    sh('Es ist die Kreatur, die die maskierte Gestalt kontrolliert hat.', [0, 4, 8], [0, 6, 2], [0, 14, -25], 5, ['creature', 'dark']),
    sh('„Ihr habt meinen Schlüssel benutzt. Jetzt gehört er mir.“', [0, 4, 8], [0, 4, 8], [0, 16, -25], 5, ['creature', 'dark']),
    sh('Die ganze Welt wird schwarz. Nur der Dark Point leuchtet stark.', [-14, 1.8, 12], [-13, 1.6, 11], [-12, 1.2, 10], 5, ['orb', 'dark', 'blackout']),
  ] },
  { t: 'The Final Key', shots: [
    sh('Der Dark Point reagiert auf die Gefahr.', [-14, 1.8, 12], [-13.5, 1.8, 11.5], [-12, 1.2, 10], 4, ['orb']),
    sh('Er teilt sich in viele kleine Energiekerne, die zu euch fliegen.', [-18, 3, 15], [-20, 5, 18], [-12, 2, 10], 6, ['shards']),
    sh('Ausgewählte Spieler erhalten Waffen mit eigener Fähigkeit: Dark Blade, Light Blaster, Plasma Cannon, Shadow Rifle.', [-14, 1.8, 12], [-14, 1.8, 12], [-12, 2, 10], 6, ['shards']),
  ], task: { text: 'Schließt gemeinsam das Portal!', btn: '🌀 Schließen', n: 15 }, after: [
    sh('Das Portal schließt sich.', OUT, OUT, [0, 8, -20], 4, ['portalClose']),
  ], reward: 'any' },
  { t: 'The Final Battle', shots: [
    sh('Das letzte große Gefecht beginnt. Die dunkle Kreatur landet vor der Tankstelle.', OUT, [-32, 2, 26], [0, 10, -25], 6, ['creature', 'dark']),
    sh('Sie wird immer größer und zerstört die Umgebung.', [0, 3, 12], [0, 2, 6], [0, 18, -25], 5, ['creatureGrow', 'explode', 'dark']),
  ], task: { text: 'Kämpft gemeinsam gegen die Kreatur!', btn: '🔫 Angreifen', n: 30 }, after: [
    sh('Die maskierte Gestalt taucht wieder auf und setzt ihre gesamte Energie ein.', [-14, 2, 12], [-15, 3, 13], [0, 10, -20], 6, ['figure', 'creature', 'beam']),
    sh('Zusammen schafft ihr es: Die Kreatur ist besiegt.', OUT, [-34, 8, 30], [0, 10, -25], 5, ['explode']),
    sh('Doch die maskierte Gestalt verschwindet danach spurlos.', [-14, 1.8, 12], [-14, 1.8, 12], [-10, 1.6, 10], 4),
  ] },
  { t: 'The End or the Beginning', shots: [
    sh('Ruhe. Die Tankstelle wird wieder aufgebaut.', OUT, [-28, 4, 20], SHOP, 5),
    sh('Ihr steht gemeinsam vor der Tankstelle. Der Dark Point liegt auf dem Boden.', [-16, 1.6, 13], [-14, 1.2, 11.5], [-12, 0.3, 10], 5, ['orbGround']),
    sh('Plötzlich eine Stimme: „Ihr glaubt wirklich, dass es vorbei ist?“', [-16, 1.6, 13], [-16, 1.6, 13], [-12, 0.3, 10], 5, ['orbGround']),
    sh('Die Kamera fährt langsam nach oben …', [-16, 2, 13], [-16, 20, 13], [0, 26, -40], 6, ['eye']),
    sh('… ein riesiges Auge öffnet sich im Himmel.', [-16, 20, 13], [-10, 24, 6], [0, 26, -40], 5, ['eye', 'dark']),
    sh('THE DARK POINT SAGA – TO BE CONTINUED', [-16, 20, 13], [-16, 20, 13], [0, 26, -40], 6, ['black']),
  ] },
];
export const EVENT_TITLES = STORY.map((e, i) => `${i + 1}. ${e.t}`);

/** ausgewählte Spieler bekommen eine Waffe: fest pro Spieler und Event (etwa jeder Dritte) */
export function eventReward(type, eventId, name) {
  const st = STORY[type - 1];
  let h = 0;
  for (const ch of eventId + '|' + name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const money = 250 + 50 * type;
  if (!st || !st.reward) return { money, weapon: null };
  if (h % 3 !== 0) return { money, weapon: null };
  const w = st.reward === 'any' ? Object.values(EV_WEAPON)[h % 4] : EV_WEAPON[st.reward];
  return { money, weapon: w };
}

// ---------------------------------------------------------------- Abspielen
/**
 * Spielt ein Event in der 3D-Szene ab.
 * api: { THREE, sc, cam, amb, ui: { caption(text), task(cfg, done), flash() }, rewardText }
 */
export function createPlayer(api) {
  const { THREE, sc, cam } = api;
  const props = {}, all = [];
  const lam = (c, e) => new THREE.MeshLambertMaterial({ color: c, emissive: e || 0 });
  const bas = (c, o) => { const m = new THREE.MeshBasicMaterial({ color: c }); if (o != null) { m.transparent = true; m.opacity = o; } return m; };
  const mesh = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };
  const group = (...o) => { const g = new THREE.Group(); o.forEach(x => g.add(x)); return g; };

  const build = {
    ship() {
      const g = group(
        mesh(new THREE.SphereGeometry(6, 24, 12), lam(0x8a90a0, 0x101418), 0, 0, 0),
        mesh(new THREE.SphereGeometry(2.6, 20, 12), lam(0xaaf0ff, 0x2090a0), 0, 1.5, 0),
      );
      g.children[0].scale.y = 0.25;
      for (let i = 0; i < 12; i++) g.add(mesh(new THREE.SphereGeometry(0.25, 8, 6), bas(i % 2 ? 0xffe060 : 0x60ffd0), Math.cos(i / 12 * 6.28) * 5.4, -0.3, Math.sin(i / 12 * 6.28) * 5.4));
      const beam = mesh(new THREE.CylinderGeometry(1.2, 4, 12, 20, 1, true), bas(0x9fffe0, 0.18), 0, -6, 0);
      beam.material.side = THREE.DoubleSide; g.add(beam); g.userData.beam = beam;
      g.position.set(-4, 30, 0);
      g.userData.tick = (t) => { g.position.y += (12 - g.position.y) * 0.03; g.rotation.y = t * 0.6; beam.visible = g.position.y < 14; };
      return g;
    },
    meteor() {
      const m = mesh(new THREE.SphereGeometry(0.9, 12, 10), bas(0xffa040), 40, 50, -30);
      const trail = mesh(new THREE.SphereGeometry(0.6, 8, 6), bas(0xff5010, 0.5), 0, 0, 0);
      m.add(trail); trail.position.set(1.5, 1.5, -1); trail.scale.set(3, 1, 1);
      m.userData.tick = t => { const k = Math.min(1, t / 2.2); m.position.set(40 + (-12 - 40) * k, 50 * (1 - k) + 1, -30 + (10 + 30) * k); if (k >= 1) m.visible = false; };
      return m;
    },
    orb() {
      const o = mesh(new THREE.SphereGeometry(0.45, 20, 14), bas(0xb050ff), -12, 1.2, 10);
      const halo = mesh(new THREE.SphereGeometry(0.75, 20, 14), bas(0x7a20ff, 0.3), 0, 0, 0); o.add(halo);
      const light = new THREE.PointLight(0xa040ff, 2, 12); o.add(light);
      o.userData.tick = t => { const s = 1 + Math.sin(t * 4) * 0.12; halo.scale.setScalar(s); };
      return o;
    },
    orbFloat() { const o = build.orb(); const b = o.userData.tick; o.userData.tick = t => { b(t); o.position.y = 1.2 + Math.min(2, t * 0.5); o.children[0].material.color.setHex(Math.sin(t * 3) > 0 ? 0x111111 : 0xffffff); }; return o; },
    orbGround() { const o = build.orb(); o.position.y = 0.3; return o; },
    figure() { const f = skinModel(THREE, 'maskiert'); f.position.set(-10, 0, 10); f.rotation.y = -Math.PI / 2 - 0.4; return f; },
    figureFly() { const f = build.figure(); f.userData.tick = t => { f.position.y = Math.max(0, (t - 1) * 3); f.position.x = -10 + Math.max(0, t - 1) * 2; }; return f; },
    maskOnly() { return mesh(new THREE.SphereGeometry(0.18, 12, 10), lam(0x111111), -10, 0.12, 10); },
    holo() {
      const f = skinModel(THREE, 'maskiert');
      f.traverse(o => { if (o.isMesh) o.material = bas(0x40d0ff, 0.45); });
      f.position.set(-12, 0.1, 8); f.rotation.y = -Math.PI / 2 - 0.6;
      f.userData.tick = t => { f.visible = Math.random() > 0.08; };
      return f;
    },
    portal() {
      const g = group(mesh(new THREE.TorusGeometry(7, 0.6, 10, 40), bas(0x9a40ff), 0, 0, 0), mesh(new THREE.CircleGeometry(6.6, 40), bas(0x1a0030, 0.85), 0, 0, 0));
      g.children[1].material.side = THREE.DoubleSide;
      g.position.set(0, 9, -20);
      g.userData.tick = t => { g.children[0].rotation.z = t; const s = Math.min(1, t / 1.5); g.scale.setScalar(s); };
      return g;
    },
    portalClose() { const p = build.portal(); p.userData.tick = t => { p.scale.setScalar(Math.max(0.01, 1 - t / 3)); p.children[0].rotation.z = t * 3; }; return p; },
    portals() {
      const g = new THREE.Group();
      [[-20, 14, -10], [8, 16, -14], [-6, 18, 10]].forEach(p => { const o = build.portal(); o.position.set(...p); o.scale.setScalar(0.5); g.add(o); });
      g.userData.tick = t => g.children.forEach((o, i) => { o.children[0].rotation.z = t + i; o.lookAt(-6, 2, 0); });
      return g;
    },
    creatures() {
      const g = new THREE.Group(), list = [];
      for (let i = 0; i < 14; i++) {
        const c = group(mesh(new THREE.SphereGeometry(0.5, 8, 6), lam(0x0a0a0a), 0, 0, 0), mesh(new THREE.SphereGeometry(0.1, 6, 4), bas(0xff2020), -0.18, 0.1, 0.42), mesh(new THREE.SphereGeometry(0.1, 6, 4), bas(0xff2020), 0.18, 0.1, 0.42));
        c.userData.p = [(Math.random() - 0.5) * 50, 14 + Math.random() * 8, (Math.random() - 0.5) * 40];
        g.add(c); list.push(c);
      }
      g.userData.tick = t => list.forEach((c, i) => { const [x, y, z] = c.userData.p, k = ((t * 0.25 + i * 0.07) % 1); c.position.set(x * (1 - k) - 4 * k, y * (1 - k) + 4 * k, z * (1 - k)); c.lookAt(-4, 4, 0); });
      return g;
    },
    dome() { const d = mesh(new THREE.SphereGeometry(15, 32, 16), bas(0xb070ff, 0.18), -4, 0, 0); d.material.side = THREE.DoubleSide; d.userData.tick = t => d.scale.setScalar(Math.min(1, t / 1.2)); return d; },
    creature(big = 1) {
      const d = lam(0x050505), g = group(
        mesh(new THREE.BoxGeometry(3, 6, 2), d, 0, 6, 0), mesh(new THREE.SphereGeometry(1.8, 12, 10), d, 0, 10.5, 0),
        mesh(new THREE.BoxGeometry(1, 7, 1), d, -2.4, 6, 0), mesh(new THREE.BoxGeometry(1, 7, 1), d, 2.4, 6, 0),
        mesh(new THREE.BoxGeometry(1.2, 4, 1.2), d, -0.8, 2, 0), mesh(new THREE.BoxGeometry(1.2, 4, 1.2), d, 0.8, 2, 0),
        mesh(new THREE.SphereGeometry(0.35, 8, 6), bas(0xff1010), -0.6, 10.8, 1.6), mesh(new THREE.SphereGeometry(0.35, 8, 6), bas(0xff1010), 0.6, 10.8, 1.6),
      );
      g.position.set(0, 0, -25); g.scale.setScalar(big);
      return g;
    },
    creatureGrow() { const c = build.creature(); c.userData.tick = t => c.scale.setScalar(1 + t * 0.15); return c; },
    eye() {
      const g = group(mesh(new THREE.SphereGeometry(8, 24, 16), bas(0xf0e8e0), 0, 0, 0), mesh(new THREE.SphereGeometry(3.4, 20, 12), bas(0xc01010), 0, 0, 6.2), mesh(new THREE.SphereGeometry(1.6, 16, 10), bas(0x050505), 0, 0, 8.4));
      g.children[1].scale.z = 0.3; g.children[2].scale.z = 0.3;
      g.position.set(0, 26, -40); g.lookAt(-16, 2, 13);
      g.userData.tick = t => { g.scale.y = Math.min(1, t / 2) * 0.7 + 0.05; };
      return g;
    },
    eyeShadow() { const c = build.creature(4); c.position.set(0, 0, -40); c.traverse(o => { if (o.isMesh && o.material.color && o.material.color.getHex() !== 0xff1010) o.material = bas(0x000000); }); return c; },
    fleet() {
      const g = new THREE.Group();
      for (let i = 0; i < 18; i++) { const s = build.ship(); s.userData.tick = null; s.userData.beam.visible = false; s.scale.setScalar(0.25); s.position.set(-60 + (i % 6) * 22, 22 + (i % 3) * 6, -60 - ((i / 6) | 0) * 15); g.add(s); }
      g.userData.tick = t => g.children.forEach((s, i) => { s.position.x += 0.08; s.rotation.y = t + i; });
      return g;
    },
    aliens() { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const a = skinModel(THREE, 'alien'); a.position.set(-12 + i * 1.6, 0, 11 + (i % 2)); a.rotation.y = -0.6; g.add(a); } return g; },
    explode() {
      const g = new THREE.Group();
      for (let i = 0; i < 10; i++) g.add(mesh(new THREE.SphereGeometry(1, 10, 8), bas(i % 2 ? 0xffa020 : 0xff4010, 0.8), (Math.random() - 0.5) * 30, 2 + Math.random() * 12, (Math.random() - 0.5) * 20));
      g.userData.tick = t => g.children.forEach((o, i) => { const k = (t * 1.3 + i * 0.13) % 1; o.scale.setScalar(0.3 + k * 3); o.material.opacity = 1 - k; });
      return g;
    },
    flicker() { const o = new THREE.Group(); o.userData.tick = () => { api.amb.intensity = Math.random() < 0.3 ? 0.05 : 0.9; }; o.userData.end = () => { api.amb.intensity = 0.9; }; return o; },
    dark() { const o = new THREE.Group(); o.userData.tick = () => { api.amb.intensity = 0.12; }; o.userData.end = () => { api.amb.intensity = 0.9; }; return o; },
    blackout() { const o = new THREE.Group(); o.userData.tick = () => { api.amb.intensity = 0.0; }; o.userData.end = () => { api.amb.intensity = 0.9; }; return o; },
    black() { const o = new THREE.Group(); o.userData.tick = () => api.ui.filter('brightness(0)'); o.userData.end = () => api.ui.filter(''); return o; },
    memory() { const o = new THREE.Group(); o.userData.tick = () => api.ui.filter('sepia(1) contrast(1.1)'); o.userData.end = () => api.ui.filter(''); return o; },
    beam() { const b = mesh(new THREE.CylinderGeometry(0.4, 0.4, 30, 8), bas(0xd080ff, 0.7), -5, 6, -6); b.rotation.x = 1.1; b.rotation.z = 0.5; return b; },
    shards() {
      const g = new THREE.Group();
      for (let i = 0; i < 12; i++) { const s = mesh(new THREE.SphereGeometry(0.15, 8, 6), bas(0xc080ff), -12, 1.2, 10); s.userData.d = [Math.cos(i) * 8, 1 + (i % 3), Math.sin(i * 1.7) * 8]; g.add(s); }
      g.userData.tick = t => g.children.forEach(s => { const k = Math.min(1, t / 3); s.position.set(-12 + s.userData.d[0] * k, 1.2 + s.userData.d[1] * k, 10 + s.userData.d[2] * k); });
      return g;
    },
    base() {
      const g = new THREE.Group(), wall = lam(0x2a2e30);
      g.add(mesh(new THREE.BoxGeometry(14, 0.1, 14), lam(0x1a1c1e), 200, 0, 200));
      g.add(mesh(new THREE.BoxGeometry(14, 4, 0.2), wall, 200, 2, 194), mesh(new THREE.BoxGeometry(0.2, 4, 14), wall, 193, 2, 200), mesh(new THREE.BoxGeometry(0.2, 4, 14), wall, 207, 2, 200));
      for (let i = 0; i < 4; i++) g.add(mesh(new THREE.BoxGeometry(1.2, 1, 0.6), lam(0x3a4048), 196 + i * 2.6, 0.5, 195), mesh(new THREE.BoxGeometry(0.8, 0.6, 0.05), bas(0x10ff60), 196 + i * 2.6, 1.4, 195.1));
      const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
      x.fillStyle = '#001a08'; x.fillRect(0, 0, 512, 128); x.fillStyle = '#ff3030'; x.font = 'bold 30px monospace'; x.textAlign = 'center';
      x.fillText('PROJEKT DARK POINT', 256, 52); x.fillText('EXPERIMENT FEHLGESCHLAGEN', 256, 96);
      const scr = mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }), 200, 1.9, 194.15);
      g.add(scr);
      const l = new THREE.PointLight(0xbfffd0, 1.4, 20); l.position.set(200, 3.5, 200); g.add(l);
      return g;
    },
    scientist() { const s = skinModel(THREE, 'wissenschaftler'); s.position.set(202, 0, 196); s.rotation.y = 0.4; return s; },
    chest() { return group(mesh(new THREE.BoxGeometry(1, 0.6, 0.6), lam(0x6a4426), 199, 0.3, 196.5), mesh(new THREE.BoxGeometry(1.02, 0.08, 0.62), lam(0xc8a040, 0x201400), 199, 0.62, 196.5)); },
    shipInside() {
      const g = new THREE.Group();
      const hull = mesh(new THREE.SphereGeometry(14, 24, 16), lam(0x1a2a3a), 300, 2, 300); hull.material.side = THREE.BackSide; g.add(hull);
      for (let i = 0; i < 160; i++) { const a = Math.random() * 6.28, b = Math.random() * 1.2; g.add(mesh(new THREE.SphereGeometry(0.08, 6, 4), bas([0x60ffd0, 0xffe060, 0xff60c0][i % 3]), 300 + Math.cos(a) * 12 * Math.cos(b), 2 + Math.sin(b) * 10, 300 + Math.sin(a) * 12 * Math.cos(b))); }
      const l = new THREE.PointLight(0x60ffd0, 1.5, 30); l.position.set(300, 6, 300); g.add(l);
      return g;
    },
  };

  let shots = [], i = -1, t = 0, T = 0, active = false, onEnd = null, taskOpen = false, ev = null;
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

  function setProps(names) {
    for (const k of Object.keys(props)) if (!names.includes(k)) { const o = props[k]; if (o.userData.end) o.userData.end(); sc.remove(o); delete props[k]; }
    for (const n of names) if (!props[n]) { const o = build[n](); o.userData.t0 = T; props[n] = o; sc.add(o); all.push(o); }
  }
  function next() {
    i++;
    if (i >= shots.length) {
      if (ev.task && !taskOpen && !ev._taskDone) {
        taskOpen = true;
        api.ui.task(ev.task, () => { if (ev._taskDone || !active) return; ev._taskDone = true; taskOpen = false; shots = shots.concat(ev.after || []); next(); });
        return;
      }
      return finish();
    }
    t = 0;
    const s = shots[i];
    api.ui.caption(s.text);
    setProps(s.props);
  }
  function finish() {
    active = false;
    setProps([]);
    api.ui.caption('');
    api.ui.filter('');
    if (onEnd) onEnd();
  }
  return {
    get active() { return active; },
    start(type, done) {
      ev = { ...STORY[type - 1] };
      shots = [];
      if (ev.abduct) shots.push(
        sh('Ein Raumschiff erscheint über dem Laden …', OUT, [-28, 2, 20], [-4, 12, 0], 5, ['ship']),
        sh('Ein Lichtstrahl erfasst dich – du wirst eingesogen!', [-4, 1.6, 2], [-4, 11, 0.5], [-4, 14, 0], 4, ['ship'], 'flashEnd'),
      );
      shots = shots.concat(ev.shots);
      i = -1; T = 0; active = true; onEnd = done;
      api.ui.title(`EVENT ${type}: ${ev.t.toUpperCase()}`);
      next();
    },
    stop() { if (active) finish(); },
    /** pro Frame aufrufen; steuert die Kamera */
    update(dt) {
      if (!active) return;
      T += dt;
      for (const o of Object.values(props)) if (o.userData.tick) o.userData.tick(T - o.userData.t0);
      if (taskOpen) { cam.position.set(-20, 4, 15); cam.lookAt(...SHOP); return; }
      const s = shots[i]; if (!s) return;
      t += dt;
      const k = Math.min(1, t / s.dur), e = k * k * (3 - 2 * k);
      v1.set(...s.from); v2.set(...s.to); v1.lerp(v2, e);
      // Außenaufnahmen auf dem freien Platz vor der Tankstelle halten (sonst steht die Kamera im Wald)
      if (v1.x < 100 && v1.y < 15) { v1.x = Math.max(-21, Math.min(12, v1.x)); v1.z = Math.min(16.5, v1.z); }
      cam.position.copy(v1); cam.lookAt(...s.look);
      if (s.fx === 'flashEnd' && k > 0.85) api.ui.flash();
      if (t >= s.dur) next();
    },
  };
}
