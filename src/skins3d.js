// Baut aus einem Skin-Bauplan (content.js) ein 3D-Figurenmodell.
// Rückgabe: THREE.Group mit userData { lg, rg, la, ra } für die Laufanimation.
// Kopf-Teile haben userData.head = true (werden in der Ego-Sicht ausgeblendet).
import { SKIN } from './content.js';

export function skinModel(THREE, id, opts = {}) {
  const k = SKIN[id] || SKIN.standard, L = { ...k.look };
  if (opts.tieColor != null && L.tie) L.tieColor = opts.tieColor;
  const g = new THREE.Group(), U = {};
  const mats = {};
  const mat = (c, e) => {
    const key = c + '|' + (e || 0);
    if (!mats[key]) {
      mats[key] = new THREE.MeshLambertMaterial({ color: c, emissive: e || 0 });
      if (L.ghost) { mats[key].transparent = true; mats[key].opacity = 0.6; }
    }
    return mats[key];
  };
  const glowM = c => new THREE.MeshBasicMaterial({ color: c });
  const add = (o, head) => { if (head) o.userData.head = true; g.add(o); return o; };
  const box = (w, h, d, x, y, z, m, head) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return add(o, head); };
  const sph = (r, x, y, z, m, sx = 1, sy = 1, sz = 1, head) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return add(o, head); };
  const cone = (r, h, x, y, z, m, head, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); return add(o, head); };
  const cyl = (r1, r2, h, x, y, z, m, head) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 14), m); o.position.set(x, y, z); return add(o, head); };
  const limb = (w, h, d, x, y, z, m) => {
    // Gelenk oben, damit die Laufanimation natürlich schwingt
    const pivot = new THREE.Group(); pivot.position.set(x, y, z);
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.y = -h / 2; pivot.add(o); g.add(pivot); return pivot;
  };

  const skinM = mat(L.skin), shirtM = mat(L.jacket || L.shirt), pantsM = mat(L.pants), shoeM = mat(L.shoes);
  const glow = L.glow != null ? glowM(L.glow) : null;

  // ---------- Körper
  U.lg = limb(0.16, 0.76, 0.18, -0.11, 0.78, 0, pantsM);
  U.rg = limb(0.16, 0.76, 0.18, 0.11, 0.78, 0, pantsM);
  const part = (parent, geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };
  part(U.lg.children[0], new THREE.BoxGeometry(0.17, 0.08, 0.26), shoeM, 0, -0.36, 0.04);
  part(U.rg.children[0], new THREE.BoxGeometry(0.17, 0.08, 0.26), shoeM, 0, -0.36, 0.04);
  box(0.42, 0.62, 0.22, 0, 1.12, 0, shirtM);
  if (L.jacket) { box(0.16, 0.5, 0.02, 0, 1.18, 0.112, mat(L.shirt)); }
  U.la = limb(0.1, 0.58, 0.12, -0.27, 1.4, 0, shirtM);
  U.ra = limb(0.1, 0.58, 0.12, 0.27, 1.4, 0, shirtM);
  for (const a of [U.la, U.ra]) part(a.children[0], new THREE.BoxGeometry(0.09, 0.1, 0.1), skinM, 0, -0.32, 0);

  if (L.tie) { box(0.06, 0.34, 0.02, 0, 1.2, 0.115, mat(L.tieColor ?? 0xc02020)); box(0.08, 0.05, 0.025, 0, 1.39, 0.115, mat(L.tieColor ?? 0xc02020)); }
  if (L.vest) box(0.44, 0.4, 0.25, 0, 1.18, 0, mat(L.vest));
  if (L.belt) box(0.44, 0.06, 0.24, 0, 0.84, 0, mat(L.belt));
  if (L.bag) { box(0.22, 0.12, 0.08, 0.05, 0.92, 0.14, mat(L.bag)); box(0.04, 0.6, 0.02, -0.05, 1.15, 0.115, mat(L.bag)).rotation.z = 0.6; }
  if (L.chain) box(0.2, 0.03, 0.02, 0, 1.36, 0.115, mat(0xf5c518, 0x3a2a00));
  if (L.scarf) { cyl(0.16, 0.16, 0.08, 0, 1.43, 0, mat(L.scarf)); box(0.08, 0.3, 0.03, 0.08, 1.28, 0.12, mat(L.scarf)); }
  if (L.armor) {
    const a = mat(L.armor, L.glow ? (L.armor & 0x3f3f3f) : 0);
    box(0.44, 0.3, 0.25, 0, 1.25, 0, a);
    sph(0.12, -0.3, 1.42, 0, a, 1, 0.7, 1); sph(0.12, 0.3, 1.42, 0, a, 1, 0.7, 1);
  }
  if (L.bones) for (let i = 0; i < 4; i++) box(0.3, 0.03, 0.02, 0, 1.0 + i * 0.1, 0.115, mat(0x222222));
  if (L.pack) { box(0.34, 0.42, 0.16, 0, 1.15, -0.19, mat(L.pack)); }
  if (L.cape != null) { const c = box(0.46, 1.0, 0.03, 0, 0.98, -0.13, mat(L.cape)); c.rotation.x = 0.08; }
  if (L.wings != null) {
    for (const sgn of [-1, 1]) {
      const w = box(0.6, 0.5, 0.03, sgn * 0.42, 1.38, -0.16, mat(L.wings, L.glow ? (L.wings & 0x2f2f2f) : 0));
      w.rotation.z = sgn * 0.45; w.rotation.y = sgn * 0.3;
    }
  }

  // ---------- Kopf
  const HY = 1.62, H = true, eyes = (c, y = HY + 0.02, z = 0.155, dx = 0.06, r = 0.03) => { sph(r, -dx, y, z, glow || mat(c), 1, 1, 1, H); sph(r, dx, y, z, glow || mat(c), 1, 1, 1, H); };
  switch (L.head) {
    case 'pumpkin': {
      sph(0.24, 0, HY + 0.02, 0, mat(0xff7a10, 0x5a1a00), 1, 0.85, 1, H);
      box(0.04, 0.1, 0.04, 0, HY + 0.24, 0, mat(0x2e5a1e), H);
      cone(0.04, 0.06, -0.08, HY + 0.06, 0.22, glowM(0xffe060), H, Math.PI / 2);
      cone(0.04, 0.06, 0.08, HY + 0.06, 0.22, glowM(0xffe060), H, Math.PI / 2);
      box(0.16, 0.03, 0.02, 0, HY - 0.06, 0.225, glowM(0xffe060), H);
      break;
    }
    case 'alien': sph(0.19, 0, HY + 0.05, 0, skinM, 0.85, 1.25, 0.9, H); sph(0.05, -0.07, HY + 0.05, 0.14, mat(0x050505), 1, 1.5, 0.6, H); sph(0.05, 0.07, HY + 0.05, 0.14, mat(0x050505), 1, 1.5, 0.6, H); break;
    case 'frog': sph(0.2, 0, HY, 0, skinM, 1.25, 0.8, 1, H); for (const x of [-0.11, 0.11]) { sph(0.07, x, HY + 0.15, 0.06, skinM, 1, 1, 1, H); sph(0.04, x, HY + 0.17, 0.12, mat(0x111111), 1, 1, 1, H); } box(0.22, 0.02, 0.02, 0, HY - 0.06, 0.18, mat(0x8a1a1a), H); break;
    case 'dog': sph(0.2, 0, HY, 0, skinM, 1, 1, 1, H); sph(0.1, 0, HY - 0.05, 0.17, mat(0xe0b080), 1.2, 0.9, 1, H); sph(0.035, 0, HY - 0.02, 0.27, mat(0x111111), 1, 1, 1, H); for (const x of [-0.2, 0.2]) sph(0.08, x, HY - 0.06, 0, mat((L.skin & 0xfefefe) >> 1), 0.6, 2, 0.6, H); eyes(0xfff600, HY + 0.05, 0.16, 0.07, 0.035); break;
    case 'helmet': sph(0.21, 0, HY + 0.02, 0, mat(L.hatColor || 0xd8dde4), 1, 1, 1, H); box(0.26, 0.12, 0.08, 0, HY + 0.02, 0.17, glowM(L.visor ?? 0x222222), H); break;
    case 'visor': sph(0.17, 0, HY, 0, skinM, 1, 1, 1, H); box(0.3, 0.07, 0.06, 0, HY + 0.03, 0.15, glowM(L.visor), H); break;
    case 'mask': sph(0.18, 0, HY, 0, mat(L.skin === 0xf4f4f4 ? 0xf4f4f4 : 0x111111), 1, 1.05, 1, H); eyes(0xff3030, HY + 0.03, 0.16, 0.06, 0.028); break;
    case 'ninja': sph(0.18, 0, HY, 0, mat(0x111114), 1, 1.05, 1, H); box(0.24, 0.05, 0.04, 0, HY + 0.03, 0.15, mat(L.skin), H); eyes(0xffffff, HY + 0.03, 0.17, 0.05, 0.02); break;
    case 'hacker': sph(0.18, 0, HY, 0, mat(0x0a0a10), 1, 1.05, 1, H); box(0.26, 0.09, 0.05, 0, HY + 0.03, 0.15, glowM(L.glow || 0x30e0ff), H); box(0.04, 0.12, 0.02, 0, HY - 0.08, 0.17, glowM(L.glow || 0x30e0ff), H); break;
    case 'flame': sph(0.18, 0, HY, 0, skinM, 1, 1, 1, H); for (let i = 0; i < 6; i++) cone(0.06, 0.22, Math.cos(i) * 0.1, HY + 0.2, Math.sin(i) * 0.08, glowM(i % 2 ? 0xff7a10 : 0xffd040), H); eyes(0xffd040); break;
    case 'crystal': { const o = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), mat(L.skin, 0x204050)); o.position.set(0, HY + 0.02, 0); add(o, H); eyes(0xffffff, HY + 0.02, 0.17); break; }
    case 'robot': case 'box': case 'fridge': {
      const big = L.head === 'fridge' ? [0.34, 0.4, 0.3] : [0.34, 0.34, 0.34];
      box(...big, 0, HY + 0.04, 0, skinM, H);
      if (L.head === 'fridge') box(0.02, 0.12, 0.02, 0.12, HY + 0.04, 0.16, mat(0x8a9096), H);
      else eyes(L.head === 'box' ? 0x111111 : 0x30e0ff, HY + 0.06, 0.175, 0.08, 0.035);
      break;
    }
    case 'banana': { const o = cyl(0.11, 0.08, 0.45, 0, HY + 0.1, 0, skinM, H); o.rotation.z = 0.2; box(0.05, 0.06, 0.05, -0.04, HY + 0.34, 0, mat(0x6a4a1a), H); eyes(0x111111, HY + 0.08, 0.1, 0.05, 0.025); break; }
    case 'toilet': box(0.3, 0.16, 0.34, 0, HY - 0.06, 0, skinM, H); box(0.3, 0.26, 0.08, 0, HY + 0.1, -0.13, skinM, H); eyes(0x111111, HY + 0.1, -0.08); break;
    case 'potato': sph(0.22, 0, HY + 0.02, 0, skinM, 1.1, 1.2, 1, H); eyes(0x111111, HY + 0.06, 0.2); box(0.1, 0.02, 0.02, 0, HY - 0.06, 0.21, mat(0x3a1a0a), H); break;
    case 'pizza': sph(0.18, 0, HY, 0, skinM, 1, 1, 1, H); for (let i = 0; i < 5; i++) sph(0.035, Math.cos(i * 1.3) * 0.1, HY + Math.sin(i * 1.3) * 0.1, 0.15, mat(0xc02020), 1, 1, 0.4, H); break;
    case 'duck': sph(0.18, 0, HY, 0, skinM, 1, 1, 1, H); box(0.16, 0.05, 0.14, 0, HY - 0.03, 0.2, mat(0xff8a20), H); eyes(0x111111, HY + 0.05, 0.15); break;
    case 'cactus': cyl(0.15, 0.15, 0.36, 0, HY + 0.04, 0, skinM, H); for (let i = 0; i < 8; i++) cone(0.012, 0.06, Math.cos(i) * 0.15, HY + (i % 4) * 0.08 - 0.08, Math.sin(i) * 0.15, mat(0xf4f4c8), H, 0, Math.PI / 2); eyes(0x111111, HY + 0.06, 0.15); break;
    case 'dragon': sph(0.19, 0, HY, 0, skinM, 1, 0.9, 1.1, H); box(0.16, 0.1, 0.2, 0, HY - 0.04, 0.2, skinM, H); cone(0.04, 0.14, -0.1, HY + 0.18, -0.04, mat(0xeeeedd), H, -0.4); cone(0.04, 0.14, 0.1, HY + 0.18, -0.04, mat(0xeeeedd), H, -0.4); eyes(0xffd040, HY + 0.06, 0.16); break;
    case 'devil': sph(0.18, 0, HY, 0, skinM, 1, 1, 1, H); cone(0.04, 0.16, -0.1, HY + 0.2, 0, mat(0x111111), H, 0, 0.3); cone(0.04, 0.16, 0.1, HY + 0.2, 0, mat(0x111111), H, 0, -0.3); eyes(0xffd040); break;
    case 'galaxy': sph(0.2, 0, HY, 0, mat(L.skin, 0x3a1a8a), 1, 1, 1, H); for (let i = 0; i < 6; i++) sph(0.015, Math.cos(i * 2) * 0.12, HY + Math.sin(i * 3) * 0.12, 0.17, glowM(0xffffff), 1, 1, 1, H); break;
    case 'skull': sph(0.18, 0, HY, 0, skinM, 1, 1.05, 1, H); sph(0.045, -0.065, HY + 0.03, 0.15, mat(0x111111), 1, 1, 0.5, H); sph(0.045, 0.065, HY + 0.03, 0.15, mat(0x111111), 1, 1, 0.5, H); box(0.1, 0.03, 0.02, 0, HY - 0.09, 0.16, mat(0x111111), H); if (L.glow) eyes(L.glow, HY + 0.03, 0.17, 0.065, 0.02); break;
    case 'wolf': sph(0.19, 0, HY, 0, skinM, 1, 1, 1, H); box(0.12, 0.1, 0.18, 0, HY - 0.05, 0.18, skinM, H); cone(0.06, 0.14, -0.1, HY + 0.2, 0, skinM, H); cone(0.06, 0.14, 0.1, HY + 0.2, 0, skinM, H); eyes(0xffd040, HY + 0.05, 0.16); break;
    case 'blob': sph(0.21, 0, HY, 0, mat(L.skin, L.glow ? (L.skin & 0x3f3f3f) : 0), 1.1, 0.95, 1.05, H); eyes(0x111111, HY + 0.05, 0.19); break;
    case 'glitch': for (let i = 0; i < 6; i++) box(0.12 + (i % 3) * 0.05, 0.1, 0.12, ((i * 37) % 7 - 3) * 0.03, HY - 0.1 + i * 0.05, ((i * 13) % 5 - 2) * 0.03, glowM([0xff30d0, 0x30ffd0, 0x111111][i % 3]), H); break;
    default: { // Mensch
      sph(0.17, 0, HY, 0, skinM, 1, 1, 1, H);
      { const hr = new THREE.Mesh(new THREE.SphereGeometry(0.185, 14, 10, 0, Math.PI * 2, 0, 1.25), mat(L.hair)); hr.position.set(0, HY + 0.01, -0.015); hr.rotation.x = -0.25; add(hr, H); }
      sph(0.022, -0.06, HY + 0.02, 0.155, mat(0x111111), 1, 1, 1, H); sph(0.022, 0.06, HY + 0.02, 0.155, mat(0x111111), 1, 1, 1, H);
      if (L.glow && !L.hat) sph(0.022, 0, HY + 0.02, 0.17, glowM(L.glow), 1, 1, 1, H).visible = false;
    }
  }
  if (L.glasses) { box(0.28, 0.05, 0.02, 0, HY + 0.03, 0.17, mat(0x111111), H); }
  // ---------- Hüte
  const hc = mat(L.hatColor ?? 0x333333);
  switch (L.hat) {
    case 'beanie': sph(0.19, 0, HY + 0.07, 0, hc, 1, 0.75, 1, H); sph(0.05, 0, HY + 0.22, 0, mat(0xf4f4f4), 1, 1, 1, H); break;
    case 'helmet': sph(0.21, 0, HY + 0.07, 0, hc, 1, 0.7, 1, H); break;
    case 'hood': sph(0.21, 0, HY + 0.04, -0.075, hc, 1, 1.1, 1, H); break;
    case 'cap': sph(0.18, 0, HY + 0.08, 0, hc, 1, 0.55, 1, H); box(0.2, 0.02, 0.14, 0, HY + 0.08, 0.17, hc, H); break;
    case 'straw': cyl(0.34, 0.34, 0.02, 0, HY + 0.12, 0, hc, H); cyl(0.17, 0.18, 0.12, 0, HY + 0.18, 0, hc, H); cyl(0.181, 0.181, 0.03, 0, HY + 0.14, 0, mat(0xc02020), H); break;
    case 'santa': cone(0.18, 0.32, 0.03, HY + 0.28, -0.02, mat(0xc0392b), H, 0, -0.35); cyl(0.19, 0.19, 0.06, 0, HY + 0.13, 0, mat(0xf4f4f4), H); sph(0.05, 0.14, HY + 0.4, -0.02, mat(0xffffff), 1, 1, 1, H); break;
    case 'crown': cyl(0.15, 0.15, 0.08, 0, HY + 0.2, 0, mat(L.hatColor, 0x3a2a00), H); for (let i = 0; i < 5; i++) cone(0.03, 0.08, Math.cos(i * 1.26) * 0.13, HY + 0.28, Math.sin(i * 1.26) * 0.13, mat(L.hatColor, 0x3a2a00), H); break;
    case 'tophat': cyl(0.24, 0.24, 0.02, 0, HY + 0.13, 0, hc, H); cyl(0.14, 0.14, 0.26, 0, HY + 0.27, 0, hc, H); break;
    case 'wizard': cyl(0.26, 0.26, 0.02, 0, HY + 0.13, 0, hc, H); cone(0.16, 0.42, 0, HY + 0.34, 0, hc, H); break;
    case 'pirate': box(0.42, 0.1, 0.14, 0, HY + 0.17, 0, hc, H); sph(0.03, 0, HY + 0.17, 0.08, mat(0xf4f4f4), 1, 1, 1, H); break;
    case 'cowboy': cyl(0.3, 0.3, 0.02, 0, HY + 0.13, 0, hc, H); cyl(0.14, 0.16, 0.16, 0, HY + 0.21, 0, hc, H); break;
  }
  if (L.visorGlow) box(0.26, 0.06, 0.02, 0, HY + 0.03, 0.17, glowM(L.visorGlow), H);
  if (L.big) g.scale.setScalar(L.big);
  g.userData = U;
  return g;
}
