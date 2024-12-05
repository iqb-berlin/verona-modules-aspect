Allgemein
=========
## editor/2.6.1+player/2.6.1
### Änderungen
- Tabelle: Mindesthöhe von Zellen auf 50px (in 2.6.0 30px)

## editor/2.6.0+player/2.6.0
### Neue Funktionen
- Bild: Neue Eigenschaft
  - Vollbildansicht erlauben
- Text: Neue Markierfunktionalität
  - Die Wörter in einem Text können durch Mausklick oder Berührung einzeln markiert oder unmarkiert werden
- Neues Element: Markierungselement
  - Kann als zusätzliche oder alternative Farbauswahlleiste zur Markierung verwendet werden
- Neue Option: "Navigationsknopf zur nächsten Unit anfügen"
  - Wenn ausgewählt wird ein kurzer Text ("Hier geht’s weiter") und ein Knopf zur Unit-Navigation ans Ende der letzten Seite angefügt. Dieser ist nur zu sehen, wenn alle Elemente gesehen wurden (presentation-complete)

### Änderungen
- Erlaubt die Anzeige von Bildern im Vollbild-Dialog nur noch für explizite Bildelmente
- Lückentext - Optionsfelder: "Gewählte Option durchstreichen" setzt nicht länger die Auswahlfarbe auf transparent. Stattdessen wird die Farbe in diesem Fall ignoriert. Editor-Tooltip entsprechend angepasst.
- Tabelle:
  - Tabellenzellen haben keine interne Mindestbreite von 50px mehr. Das sollte Fehler beheben bei denen Zellinhalte in vorhergehende Spalten überfließen, wenn sehr schmale Spaltenbreiten verwendet werden.

### Fehlerbehebungen
- Behebt "Flackern"-Fehler von Eingabebereichen mit dynamischen Zeilen unter Chromium-basierten Browsern
- Ablegeliste:
  - Aufnehmen weiterer Elemente während eines aktiven Drags wird verhindert
  - Rekursives Verdrängen sorgt nicht mehr für eine Endlosschleife
  - Sortierlisten bei Berührungssteuerung (Touchscreen) repariert
- Optionentabelle: Absätze im Beschriftungstext werden korrekt untereinander dargestellt


## editor/2.5.0+player/2.5.0
### Neue Funktion
- Neues Element: Tabelle
- Abschnittsnummerierung
  - Es werden alle Abschnitte seitenübergreifend durchnummeriert. Einzelne Seitenabschnitte können via Seitenabschnittsmenu davon ausgenommen werden. Dauerhaft sichtbare Seiten sind grundsätzlich ausgenommen.
- Audio und Video: Neue Eigenschaft - Hintergrundfarbe
- Bilder werden beim Anwählen in einem Vollbild-Dialog angezeigt
- Ablegelisten: Nummerierung zuschaltbar (nicht in Lückentexten)

### Änderungen
- Kontrollkästchen: Wenn keine Vorbelegung definiert ist, gilt der Wert als nicht-ausgewählt anstatt nicht-definiert

### Fehlerbehebungen
- Hoch- und Tiefgestellter Text in Text-Elementen verursacht keine Änderung der Zeilenhöhe mehr
- Text: Unterstreichung hat die gleiche Farbe wie der zugehörige Text
- Lückentext: Bilder werden nun angezeigt


## editor/2.4.9+player/2.4.10
### Fehlerbehebungen
- Optionstabellen und Optionsfelder mit Bildern:
  - Behebt fehlerhafte Größendarstellung von Bildern auf iPads beim ersten Laden der Aufgabe


## editor/2.4.8+player/2.4.9
### Fehlerbehebungen
- Korrigiert die Positionierung von vertikal ausgerichteten Optionsfeldern in Lückentexten
- Ablegeliste:
  - Sortierlisten unter Firefox + Windows 10 repariert


## editor/2.4.7+player/2.4.8
### Fehlerbehebungen
- Verbesserte Bildvorschau in Dialogen (Editor) wurde rückgängig gemacht
  Hierdurch wurde die Anzeige diverser anderer Elemente (MC, CMC, Ablegeliste) beeinträchtigt.


## editor/2.4.6+player/2.4.6
### Fehlerbehebungen
- Ablegeliste:
  - Sortierlisten auf Touchscreen repariert


## editor/2.4.5+player/2.4.5
### Fehlerbehebungen
- Ablegeliste:
  - Sortierlisten erlauben wieder Ablegen in die Ausgangsliste


## editor/2.4.4+player/2.4.4
### Änderungen
- Ablegeliste:
  - Ersetzte (aka Verdrängen) Elemente ignorieren Listenverbindungen


## editor/2.4.3+player/2.4.3
### Fehlerbehebungen
- Ablegeliste:
  - Sortierlisten beachten verbundene Listen (Elemente aus Sortierlisten lassen sich nicht mehr überall ablegen)


## editor/2.4.2+player/2.4.2
### Fehlerbehebungen
- Korrigiert die Anzeige der Auswahl für Klapplisten
