# ⛽ Nachtschicht – SVE Studios

Horror-Spiel im Browser: Nachtschicht an der Tankstelle, Ausweise prüfen, Anomalien erkennen, bis 6 Uhr überleben.
Läuft auf dem iPad in Safari (Touch) und am Computer (Tastatur).

## Spielen

Nach dem ersten Deploy: `https://cedrik240414.github.io/Tankstellen-Simulator-/`

### Steuerung
| | iPad | Tastatur |
|---|---|---|
| Laufen | linke Bildhälfte wischen (Joystick) | WASD / Pfeil hoch/runter |
| Umschauen | rechte Bildhälfte wischen | Pfeil links/rechts |
| Schießen | roter Knopf unten rechts | Leertaste |
| Monitor | grüner Knopf oben links | M |

## GitHub Pages einrichten (einmalig)

1. Auf GitHub: **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.
2. Auf `main` pushen (oder den Workflow „Tests und GitHub Pages“ unter *Actions* von Hand starten).
3. Der Workflow testet, baut und veröffentlicht `dist/index.html`.

## Entwickeln

```bash
npm install
npm run dev      # lokaler Server mit Live-Reload
npm test         # Tests der Spiellogik (vitest)
npm run build    # baut dist/index.html (eine einzige Datei, alles eingebettet)
npm run smoke    # startet das gebaute Spiel headless und macht Screenshots in screenshots/
```

`dist/index.html` ist eine einzelne Datei mit eingebettetem three.js. Sie läuft auch ohne Server, z. B. per AirDrop/Dateien-App auf dem iPad.

## Aufbau

| Datei | Inhalt |
|---|---|
| `src/config.js` | **alle Zahlen zum Ändern**: Preise, Freischalt-Schichten der Welten, Waffen-Tabelle, Altar-Tabelle, Admin |
| `src/logic.js` | reine Spiellogik (Kunden, Ausweisprüfung, Verkaufen/Erschießen, Freischalten, Altäre, Belohnungen) |
| `src/storage.js` | Accounts und Speicherstand in `localStorage` |
| `src/game.js` | Spielablauf, Knöpfe, Monitor, Pizzeria, Backrooms, Bus |
| `src/scene.js` | 3D-Szene mit three.js, Figuren, Bewegung, Touch-Steuerung |
| `src/weapons3d.js` | 3D-Modelle aller Waffen |
| `src/dogs3d.js` | die Animatronics Benni und Cookie |
| `tests/` | automatische Tests |
| `legacy/nachtschicht.html` | die ursprüngliche Einzeldatei zum Vergleich |

### Welten freischalten
In `src/config.js` → `WORLD_UNLOCK` (geschaffte Schichten gesamt). Halloween hat keinen eigenen Wert: es öffnet erst, wenn alle anderen Welten offen sind.

### Altäre (zentrale Tabelle `ALTARS`)
| Welt | Bedingung | Waffe | Rang |
|---|---|---|---|
| Halloween | 30 Schichten in Halloween + Bosskampf Kürbiskönig | Kürbiskönig-Vernichter (300) | 1 |
| Piraten | 25 Schichten in Piraten | Klabautermann-Kanone (250) | 2 |
| Winter | 20 Schichten in Winter | Eisdrachen-Zorn (200) | 3 |
| Pizzeria | 8 Animatronic-Köpfe | Fazbear-Nachtmahr (200) | 3 |
| Tankstelle | 10 Schädel | Dämon-Donnerhammer (160) | 4 |

## Hinweise
- Passwörter werden nur lokal und schwach gehasht gespeichert. Das ist ein Spiel-Schutz, keine echte Sicherheit. Der Spielstand liegt nur im Browser auf dem jeweiligen Gerät.
- Der Admin-Zugang steht im öffentlichen Code (als Hash). Wer den Code liest, kann ihn herausfinden.
