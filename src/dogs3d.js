// Die Pizzeria-Animatronics als Hunde.
// k = 0: Benni – flauschig braun mit langen Schlappohren
// k = 1: Cookie – grau-weiß und struppig
// Beide tragen eine Weihnachtsmütze und haben leuchtende Augen.

/** kleiner fester Zufallsgenerator, damit die Modelle jedes Mal gleich aussehen */
function seeded(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

export function dogModel(THREE, k) {
  const g = new THREE.Group(), rand = seeded(k ? 4242 : 1717);
  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  const glow = c => new THREE.MeshBasicMaterial({ color: c });
  const sph = (r, x, y, z, m, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; };
  const cyl = (r, h, x, y, z, m) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), m); o.position.set(x, y, z); g.add(o); return o; };

  const fur = k ? [0x8a8a92, 0x9c9ca4, 0x74747c, 0xdedee2] : [0xb8692c, 0xa65a22, 0xc97a3a, 0x9a5220];
  const light = lam(k ? 0xeeeef2 : 0xe0b080), earM = lam(k ? 0x55555c : 0x7a431d), metal = lam(0x5a5e64);
  const furM = fur.map(lam);
  const furPick = () => furM[(rand() * furM.length) | 0];

  // Endoskelett-Beine mit Fell-"Hosen"
  for (const s of [-1, 1]) {
    cyl(0.07, 0.75, s * 0.2, 0.38, 0, metal);
    sph(0.13, s * 0.2, 0.06, 0.06, furPick(), 1.1, 0.6, 1.5); // Pfote
    sph(0.16, s * 0.2, 0.7, 0, furPick(), 1, 1.3, 1);
  }
  // Körper aus vielen Fellbüscheln
  sph(0.42, 0, 1.25, 0, furM[0], 1, 1.25, 0.85);
  sph(0.26, 0, 1.25, 0.24, light, 1, 1.4, 0.6); // Brustfleck
  // Arme
  for (const s of [-1, 1]) {
    const arm = sph(0.12, s * 0.5, 1.2, 0.05, furPick(), 0.9, 2.6, 0.9);
    arm.rotation.z = s * 0.25;
    sph(0.11, s * 0.56, 0.86, 0.1, light);
  }
  // Kopf
  const HY = 2.0;
  sph(0.38, 0, HY, 0, furM[0], 1, 0.95, 0.95);
  // Schnauze, Nase, Maul
  sph(0.19, 0, HY - 0.1, 0.3, light, 1.1, 0.85, 1.2);
  sph(0.07, 0, HY - 0.03, 0.51, lam(0x111111), 1.2, 0.85, 1);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.05), lam(0x2a0a0a)); mouth.position.set(0, HY - 0.2, 0.44); g.add(mouth);
  // leuchtende Augen
  for (const s of [-1, 1]) {
    sph(0.075, s * 0.15, HY + 0.08, 0.31, glow(0xfff600));
    sph(0.03, s * 0.15, HY + 0.08, 0.38, glow(0x000000));
  }
  // Ohren
  for (const s of [-1, 1]) {
    const ear = k
      ? sph(0.12, s * 0.33, HY + 0.12, -0.02, earM, 0.7, 1.6, 0.5)   // Cookie: halb-geknickt
      : sph(0.14, s * 0.4, HY - 0.15, 0, earM, 0.6, 2.6, 0.6);       // Benni: lange Schlappohren
    ear.rotation.z = s * (k ? 0.9 : 0.18);
  }
  // Cookie ist struppig: ein paar abstehende Haarbüschel am Kopf
  if (k) {
    const tuft = lam(0xc8c8ce);
    for (let n = 0; n < 7; n++) {
      const a = (n / 7) * Math.PI * 2 + rand() * 0.3, onHead = true, y = onHead ? HY + 0.1 + rand() * 0.25 : 0.9 + rand() * 0.75, r = onHead ? 0.33 : 0.42;
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), tuft);
      c.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.85);
      c.lookAt(c.position.x * 3, onHead ? y + 0.5 : y, c.position.z * 3);
      c.rotateX(Math.PI / 2);
      g.add(c);
    }
  } else {
    // Benni: rotes Halsband
    const col = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 6, 18), lam(0xa01818));
    col.position.set(0, 1.68, 0); col.rotation.x = Math.PI / 2; g.add(col);
  }
  // Weihnachtsmütze
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 12), lam(0xc0392b));
  hat.position.set(0.05, HY + 0.52, -0.03); hat.rotation.z = -0.35; g.add(hat);
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.07, 8, 20), lam(0xf4f4f4));
  brim.position.set(0, HY + 0.27, -0.03); brim.rotation.x = Math.PI / 2; g.add(brim);
  sph(0.08, 0.28, HY + 0.78, -0.03, lam(0xffffff));

  g.scale.setScalar(1.25);
  return g;
}
