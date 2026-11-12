// Verhindert in Safari (iPad/iPhone) das Hineinzoomen bei schnellem Doppeltippen
// und bei Zwei-Finger-Gesten. Schnelle Tipps lösen trotzdem jeden Klick aus.
export function disableZoom() {
  let last = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - last < 350 && e.changedTouches.length === 1) {
      e.preventDefault(); // stoppt den Zoom, aber auch den automatischen Klick ...
      const t = e.target.closest && e.target.closest('[data-a],button,input');
      if (t && t.tagName !== 'INPUT' && typeof t.click === 'function') t.click(); // ... darum Klick selbst auslösen
      else if (t) t.focus();
    }
    last = now;
  }, { passive: false });
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, e => e.preventDefault(), { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
}
