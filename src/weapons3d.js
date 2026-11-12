// 3D-Modelle der Waffen in der Hand. Lauf zeigt nach -z, Ursprung = Griff.
// Index 0–49: 10 Grundtypen × 5 Stufen (Rost, Stahl, Silber, Gold, Dämon). 50+: Sonderwaffen.
import { W_IDX } from './config.js';

const TIER = [
  { c: 0x8a4a2a, e: 0x000000 }, // Rost
  { c: 0x7d858e, e: 0x000000 }, // Stahl
  { c: 0xd4dae2, e: 0x111418 }, // Silber
  { c: 0xe0b030, e: 0x2a1c00 }, // Gold
  { c: 0x5a0a14, e: 0x5a0008 }, // Dämon (glüht)
];

export function weaponModel(THREE, i) {
  const g = new THREE.Group();
  const mat = (c, e = 0, basic = false) => (basic ? new THREE.MeshBasicMaterial({ color: c }) : new THREE.MeshLambertMaterial({ color: c, emissive: e }));
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  // Zylinder entlang der z-Achse
  const tube = (r1, r2, len, x, y, z, m) => add(new THREE.CylinderGeometry(r1, r2, len, 10), m, x, y, z, Math.PI / 2);
  const ball = (r, x, y, z, m) => add(new THREE.SphereGeometry(r, 10, 8), m, x, y, z);

  const dark = mat(0x1c2228), wood = mat(0x6a4426), grip = mat(0x2a2420);
  let muzzle = -0.3;

  if (i < 50) {
    const t = TIER[(i / 10) | 0], M = mat(t.c, t.e);
    switch (i % 10) {
      case 0: // Pistole
        box(0.05, 0.11, 0.06, 0, -0.05, 0.01, grip, 0.25);
        box(0.055, 0.06, 0.22, 0, 0.03, -0.08, M);
        tube(0.014, 0.014, 0.05, 0, 0.035, -0.21, dark); muzzle = -0.24; break;
      case 1: // Revolver
        box(0.05, 0.12, 0.06, 0, -0.05, 0.02, wood, 0.35);
        tube(0.04, 0.04, 0.07, 0, 0.03, -0.05, M);
        tube(0.015, 0.015, 0.24, 0, 0.045, -0.2, M);
        box(0.01, 0.02, 0.01, 0, 0.065, -0.3, dark); muzzle = -0.32; break;
      case 2: // Schrotflinte
        box(0.05, 0.08, 0.2, 0, -0.01, 0.15, wood);
        box(0.06, 0.07, 0.2, 0, 0.02, -0.05, M);
        tube(0.018, 0.018, 0.36, -0.017, 0.04, -0.32, M); tube(0.018, 0.018, 0.36, 0.017, 0.04, -0.32, M);
        box(0.05, 0.04, 0.12, 0, 0, -0.25, wood); muzzle = -0.5; break;
      case 3: // Sturmgewehr
        box(0.05, 0.06, 0.16, 0, 0, 0.16, dark);
        box(0.06, 0.09, 0.34, 0, 0.02, -0.08, M);
        box(0.04, 0.13, 0.05, 0, -0.08, -0.08, dark, -0.25);
        box(0.02, 0.04, 0.16, 0, 0.09, -0.06, dark);
        tube(0.012, 0.012, 0.2, 0, 0.03, -0.34, M); muzzle = -0.45; break;
      case 4: // Scharfschütze
        box(0.05, 0.07, 0.2, 0, -0.01, 0.17, wood);
        box(0.05, 0.06, 0.4, 0, 0.02, -0.1, M);
        tube(0.025, 0.02, 0.2, 0, 0.09, -0.05, dark);
        ball(0.02, 0, 0.09, -0.15, mat(0x3070ff, 0, true));
        tube(0.01, 0.01, 0.36, 0, 0.03, -0.48, M); muzzle = -0.66; break;
      case 5: { // Armbrust
        box(0.04, 0.05, 0.42, 0, 0, -0.08, wood);
        box(0.04, 0.09, 0.05, 0, -0.06, 0.06, grip, 0.3);
        const arm = (s) => box(0.24, 0.02, 0.025, s * 0.11, 0.02, -0.28 + 0.03, M, 0, s * 0.35);
        arm(1); arm(-1);
        box(0.36, 0.004, 0.004, 0, 0.02, -0.18, mat(0xdddddd));
        box(0.008, 0.008, 0.3, 0, 0.04, -0.2, mat(0x8a6a3a)); muzzle = -0.36; break;
      }
      case 6: // Flammenwerfer
        tube(0.05, 0.05, 0.24, 0, -0.06, 0, M);
        box(0.05, 0.05, 0.3, 0, 0.03, -0.12, dark);
        add(new THREE.ConeGeometry(0.035, 0.08, 10), M, 0, 0.03, -0.31, -Math.PI / 2);
        ball(0.012, 0, 0.0, -0.33, mat(0xff8a20, 0, true)); muzzle = -0.36; break;
      case 7: // Laser
        box(0.05, 0.1, 0.06, 0, -0.05, 0.03, grip, 0.25);
        box(0.06, 0.06, 0.3, 0, 0.03, -0.1, M);
        box(0.062, 0.012, 0.26, 0, 0.045, -0.1, mat(0x30e0ff, 0, true));
        add(new THREE.TorusGeometry(0.03, 0.008, 6, 16), mat(0x30e0ff, 0, true), 0, 0.03, -0.26);
        muzzle = -0.28; break;
      case 8: // Plasmakanone
        box(0.12, 0.11, 0.26, 0, 0.02, -0.06, M);
        ball(0.045, 0, 0.09, -0.06, mat(0x7aff5a, 0, true));
        tube(0.045, 0.035, 0.14, 0, 0.02, -0.25, dark);
        box(0.05, 0.1, 0.06, 0, -0.07, 0.04, grip, 0.25); muzzle = -0.33; break;
      default: // Donnerhammer
        tube(0.015, 0.015, 0.42, 0, 0, -0.12, wood);
        box(0.18, 0.1, 0.1, 0, 0, -0.34, M);
        box(0.19, 0.015, 0.105, 0, 0.02, -0.34, mat(0x80c0ff, 0, true)); muzzle = -0.4;
    }
    if (i >= 40) ball(0.012, 0, 0.065, -0.02, mat(0xff2020, 0, true)); // Dämonen-Auge
  } else {
    switch (i) {
      case W_IDX.knife:
        box(0.03, 0.04, 0.12, 0, -0.01, 0.03, grip);
        box(0.06, 0.01, 0.015, 0, -0.01, -0.035, dark);
        box(0.008, 0.04, 0.2, 0, 0.0, -0.14, mat(0xdfe6ee, 0x101418));
        box(0.008, 0.028, 0.03, 0, -0.006, -0.25, mat(0xdfe6ee, 0x101418)); muzzle = -0.27; break;
      case W_IDX.pizzaAltar: // Fazbear-Nachtmahr: brauner Plüsch-Blaster mit Mütze
        box(0.12, 0.12, 0.28, 0, 0.02, -0.08, mat(0x9a5a28));
        ball(0.02, -0.03, 0.06, -0.22, mat(0xfff600, 0, true)); ball(0.02, 0.03, 0.06, -0.22, mat(0xfff600, 0, true));
        add(new THREE.ConeGeometry(0.05, 0.1, 8), mat(0xc0392b), 0, 0.13, -0.08, 0, 0, -0.3);
        ball(0.018, 0.03, 0.17, -0.08, mat(0xffffff));
        tube(0.03, 0.03, 0.08, 0, 0.0, -0.26, dark); muzzle = -0.3; break;
      case W_IDX.shop1: // Götterdämmerung
        box(0.06, 0.08, 0.5, 0, 0.02, -0.15, mat(0xf0c840, 0x302000));
        for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(0.045, 0.008, 6, 16), mat(0xfff0a0, 0, true), 0, 0.02, -0.25 - k * 0.08);
        muzzle = -0.42; break;
      case W_IDX.shop2: // Apokalypse-Kanone
        tube(0.07, 0.08, 0.5, 0, 0.0, -0.18, mat(0x2a2a2e));
        for (let k = 0; k < 3; k++) box(0.15, 0.015, 0.02, 0, 0.0, -0.05 - k * 0.1, mat(0xff3010, 0, true));
        muzzle = -0.45; break;
      case W_IDX.winterAltar: { // Eisdrachen-Zorn
        const ice = mat(0x9fe8ff, 0x1a5a7a);
        box(0.06, 0.07, 0.3, 0, 0.02, -0.08, mat(0xcfefff, 0x103040));
        for (let k = 0; k < 5; k++) add(new THREE.ConeGeometry(0.02, 0.1, 5), ice, Math.sin(k) * 0.04, 0.07, -0.02 - k * 0.06, 0, 0, Math.sin(k * 2) * 0.5);
        add(new THREE.OctahedronGeometry(0.05), mat(0xc0f4ff, 0, true), 0, 0.02, -0.28); muzzle = -0.33; break;
      }
      case W_IDX.pirateAltar: // Klabautermann-Kanone
        box(0.08, 0.06, 0.14, 0, -0.04, 0.05, wood);
        tube(0.05, 0.06, 0.42, 0, 0.02, -0.16, mat(0x1a1a1a));
        add(new THREE.TorusGeometry(0.06, 0.012, 6, 16), mat(0xc8a040, 0x201400), 0, 0.02, -0.02);
        add(new THREE.TorusGeometry(0.052, 0.012, 6, 16), mat(0xc8a040, 0x201400), 0, 0.02, -0.36); muzzle = -0.38; break;
      case W_IDX.halloAltar: // Kürbiskönig-Vernichter
        box(0.06, 0.07, 0.26, 0, 0.0, -0.03, mat(0x2a1a30));
        { const p = ball(0.09, 0, 0.02, -0.25, mat(0xff7a10, 0x6a2000)); p.scale.y = 0.8; }
        box(0.015, 0.05, 0.015, 0, 0.11, -0.25, mat(0x2e7a2e));
        box(0.03, 0.02, 0.01, -0.03, 0.04, -0.335, mat(0xffe060, 0, true)); box(0.03, 0.02, 0.01, 0.03, 0.04, -0.335, mat(0xffe060, 0, true));
        muzzle = -0.35; break;
      default:
        box(0.06, 0.08, 0.3, 0, 0.02, -0.1, mat(0x555555));
    }
  }
  g.userData.muzzle = muzzle;
  return g;
}
