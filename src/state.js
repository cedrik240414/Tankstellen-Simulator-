// Gemeinsamer, veränderlicher Zustand für alle Module.
export const $ = s => document.querySelector(s);
export const pick = a => a[(Math.random() * a.length) | 0];
export const rnd = n => (Math.random() * n) | 0;
/** 2D-Spielkoordinaten (px/py) -> 3D-Welt (x/z) */
export const W = (x, y) => [(x - 50) * 0.2, (y - 50) * 0.14];
/** 3D-Welt -> 2D-Spielkoordinaten */
export const unW = (x, z) => [x / 0.2 + 50, z / 0.14 + 50];
export const dst = (a, b, x, y) => Math.hypot(a - x, b - y);

/** Spielzustand der laufenden Schicht */
export let S = null;
export function setState(s) { S = s; }

/** Kamera und Eingabe: yaw/pit = Blickrichtung, fl = Mündungsfeuer, jx/jy = Joystick */
export const V = { yaw: 0, pit: 0, fl: 0, jx: 0, jy: 0, drg: 0 };
/** gedrückte Tasten */
export const K = {};

/** Zugriff auf die 3D-Szene (von scene.js gefüllt): ev = Event-Abspieler */
export const SC = {};
