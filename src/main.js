import './style.css';
import { startGameLoop, act, G } from './game.js';
import { initScene } from './scene.js';
import { initMenu, showMenu, sync, poll } from './menu.js';
import { S, V } from './state.js';
import { disableZoom } from './nozoom.js';

disableZoom();
initScene();
startGameLoop();
G.hooks.showMenu = showMenu;
G.hooks.sync = sync;
initMenu();

// Zugriff für automatische Browser-Tests (scripts/smoke.mjs)
window.__ns = { get S() { return S; }, act, V, G, poll };
