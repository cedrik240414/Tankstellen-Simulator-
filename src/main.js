import './style.css';
import { init, startGameLoop, act } from './game.js';
import { initScene } from './scene.js';
import { unlockShifts } from './logic.js';
import { S, V } from './state.js';
import { disableZoom } from './nozoom.js';

disableZoom();

document.getElementById('pzlock').textContent = `(ab Schicht ${unlockShifts('pizza')})`;
initScene();
startGameLoop();
init();

// Zugriff für automatische Browser-Tests (scripts/smoke.mjs)
window.__ns = { get S() { return S; }, act, V };
