Welche Version der Aufgabendefinition (Unit Def) ein veröffentlichter Editor bzw. Player schreibt.
Ein Bereich (z. B. `2.12.0–2.12.6`) heißt: alle Veröffentlichungen dazwischen ebenfalls.

| Editor        | Unit Def | Player        |
|---------------|----------|---------------|
| 3.0.0         | 4.12.0   | 3.0.0         |
| 2.12.0–2.12.6 | 4.11.0   | 2.12.0–2.12.6 |
| 2.11.0–2.11.6 | 4.10.0   | 2.11.0–2.11.6 |
| 2.8.0–2.10.1  | 4.9.0    | 2.8.0–2.10.1  |
| 2.7.0–2.7.4   | 4.8.0    | 2.7.0–2.7.4   |
| 2.6.0–2.6.4   | 4.7.0    | 2.6.0–2.6.4   |
| 2.5.0         | 4.6.0    | 2.5.0         |
| 2.4.0–2.4.10  | 4.4.0    | 2.4.0–2.4.13  |
| 2.3.0         | 4.3.0    | 2.3.0         |
| 2.2.0–2.2.1   | 4.2.0    | 2.2.0–2.2.5   |
| 2.1.0–2.1.2   | 4.1.0    | 2.1.0–2.1.2   |
| 2.0.0–2.0.2   | 4.0.0    | 2.0.0–2.0.3   |
| 1.39.0        | 3.10.0   | 1.32.0        |
| 1.38.0        | 3.10.0   | 1.31.0        |
| 1.37.5        | 3.10.0   | 1.30.5        |
| 1.36.0        | 3.9.0    | 1.29.0        |
| 1.35.3        | 3.8.0    | 1.28.3        |
| 1.34.0        | 3.7.0    | 1.27.0        |
| 1.33.3        | 3.7.0    | 1.26.3        |
| 1.32.0        | 3.6.0    | 1.25.2        |
| 1.31.1        | 3.6.0    | 1.25.0        |
| 1.29.0        | 3.3.0    | 1.23.0        |

Anmerkungen:

- 3.0.0 ist noch nicht veröffentlicht; die Zeile steht hier, weil die Auslieferung vorbereitet ist.
- 4.5.0 hat keine eigene Zeile: Diese Definitionsversion war zu keiner Veröffentlichung die aktuelle.
  2.4.x schrieb 4.4.0, die nächste Veröffentlichung (2.5.0) schon 4.6.0.
- In der 2.4er-Reihe liefen Editor und Player auseinander (der Player bekam eigene Korrekturen),
  ebenso in 2.0–2.2 und bei 2.11.4, das es nur für den Player gab. Die Definitionsversion war dabei
  immer dieselbe.
- Die 2.11er-Reihe wurde neben 2.12.x weitergepflegt: 2.11.5 und 2.11.6 sind jünger als 2.12.0 und
  bleiben bei 4.10.0.
- Die Zeilen ab 2.0.0 sind aus den Release-Tags und dem `config`-Block der `package.json` gewonnen,
  die Zeilen der 1er-Reihe stehen unverändert so, wie sie hier eingetragen wurden.
