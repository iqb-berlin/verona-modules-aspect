# Aufgaben für Messungen

Aufgaben, die nicht für Verhaltenstests gedacht sind, sondern für Messungen am laufenden Player:
wie viel er je geladener Aufgabe behält, wie lange ein Aufbau dauert. Inhaltlich ergeben sie keinen
Sinn — es geht darum, dass jede Komponente einmal gerendert wird.

## `all-elements.json`

Fünf Seiten mit je einem Element jedes Typs aus `UIElementType` (30 Stück, Stand
`unit_definition_version` 4.12.0). Erzeugt von `scripts/generate-measurement-unit.js`:

```bash
node scripts/generate-measurement-unit.js [--pages 5] [--copies 1] [--out <pfad>]
```

Kommt ein Elementtyp hinzu, gehört er in die Liste `ELEMENT_TYPES` im Generator, und die Datei wird
neu erzeugt.

## Für eine Messreihe den Generator einbinden, nicht die Datei laden

Wachstumsmessungen brauchen je Startkommando eine Aufgabe mit **anderen** Element-IDs — der Editor
vergibt IDs mit `Date.now()`, sie kollidieren zwischen Aufgaben also nie, und was der Player nach ID
ablegt, würde sonst überschrieben statt sich anzuhäufen. Dafür den Generator aufrufen:

```js
const { buildUnit, ELEMENT_TYPES } = require('./scripts/generate-measurement-unit');

buildUnit({ stamp: `lauf-${n}`, pages: 5 });                    // alle Typen
buildUnit({ stamp: `lauf-${n}`, types: ['geometry'], copies: 10 }); // ein Typ, zum Eingrenzen
```

Die Datei hier ist der Stand zum Ansehen und zum Laden von Hand.

Gebraucht in #1384, #1403 und #1410; das Vorgehen für die Messung selbst steht in #1144.
