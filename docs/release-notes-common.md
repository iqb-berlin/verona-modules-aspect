Allgemein
=========
## next
### Neue Funktionen
- Geometrie
  - Ermöglicht die Angabe von erwarteten und durch Nutzer:innen erstellte Variablen. Diese sind dann in den Antwortdaten und zur Auswertung verfügbar.
  - Macht optional alle Variablen eines Geogebra-Elements in den Antwortendaten verfügbar
- Formelfeld/Formelbereich
  - Die Reiter der Tastatur sind als Formeleingabelayouts frei wählbar
  - Neues Formeleingabelayout: "Physik"
- Tabelle
  - Neues Kindelement: "Eingabebereich"
- Audio/Video
  - Hinweise (Rahmen und Text) können auch ohne die Angabe von Text angezeigt werden
- Neue Eingabehilfe: "Reaktionsgleichung Chemie"
- Ablegeliste
  - Erlaubt jetzt formatierten Text für die Optionen
  

### Änderungen
- Auslöser
  - "Textabschnitt hervorheben" wird bei als paralleler Anordnung immer nach "Hervorhebungen ausblenden" ausgelöst
- Eingabefeld
  - "Eingabe auf Maximallänge begrenzen" ist jetzt Standardeinstellung

### Fehlerbehebungen
- Audio/Video
  - Korrektur der Position der Steuerungselemente
- Optionsfelder und Kontrollkästchen
  - Ausrichtung der Knöpfe korrigiert. Erscheinen jetzt wieder oben an der Beschriftung


## editor/2.10.1+player/2.10.1
### Fehlerbehebungen
- Schieberegler
  - Korrigiert die Einstellung "Schreibschutz"
- Rechenkästchen
  - Vereinheitlicht die Farbgebung der Schaltflächen zum Hinzufügen und Löschen von Zeilen in verschiedenen Browsern
- Lückentext
  - Text von Auswahlelementen innerhalb von Zitaten korrigiert.

## editor/2.9.3+player/2.9.3
### Fehlerbehebungen
- Optionsfelder, Optionentabelle und Ablegeliste
  - Behebt unter iOS Anzeigefehler von Bildern beim Laden einer Aufgabe
- Video
  - Behebt unter Firefox Initialisierungsfehler von Videos beim Laden einer Aufgabe (Problem in Version 2.9.1/2.9.2)

## editor/2.9.1+player/2.9.1
### Fehlerbehebungen
- Audios:
  - Aufgaben mit vielen Audios können nun auf iPads geladen werden, ohne deren Abspielbarkeit zu beeinträchtigen
  - Audios innerhalb von Drag&Drop-Elementen können nun auch auf Touch-Devices abgespielt werden

## editor/2.9.0+player/2.9.0
### Neue Funktionen
- Kontrollkästchen:
  - Können jetzt mit Bildern versehen werden. Dadurch ändert sich automatisch die Anordnung auf vertikal. Außerdem kann auf das Bild geklickt werden, um eine Auswahl vorzunehmen.
### Fehlerbehebungen
- Text und Positionierung des "Hier geht’s weiter"-Knopf korrigiert

## editor/2.8.0+player/2.8.0
### Neue Funktionen
- Text: Neue Markierfunktionalität
  - In einem Text können durch zwei Mausklicks oder zwei Berührung Bereiche von Wörtern markiert werden
- Ablegelisten: Neue Eigenschaften "Platzhalter anzeigen" und "Platzhalter mit Durchschrift"
  - Wenn gesetzt, wird für entfernte Elemente Platz reserviert und optional eine verblasste Version des Elements angezeigt.

## Änderungen
  - Ausrichtung "horizontal linksbündig" (ehemals "horizontal") bricht automatisch um

### Fehlerbehebungen
- Lückentexte können jetzt Formeln darstellen
- Ablegelisten:
  - Listen mit Schreibschutz akzeptieren keine abgelegten Elemente mehr
- Wort korrigieren:
  - mit Schreibschutz wird der Text nicht mehr durchgestrichen, wenn man das Eingabefeld fokussiert
- Eingabebereich: ohne Beschriftung wird der Fokusrahmen mit durchgezogener Linie dargestellt


## editor/2.7.2+player/2.7.2
### Fehlerbehebungen
- Ablegeliste:
  - Behebt Fehler beim Ablegen von Optionen auf Touch-Geräten (Problem in Version 2.7.1)
- Formel (Bereich):
  - Unterbindet auf Touch-Geräten, wenn eingestellt, das Öffnen der Software-Tastatur des Betriebssystems
  - Korrigiert Umbrüche in Text-Bereichen vor und hinter Formeln
  - Stellt sicher, dass Formeltastatur und IQB-Tastatur nicht gleichzeitig geöffnet werden können
  - Behebt Aktualisierungsfehler beim Speichern von Formeln

## editor/2.7.1+player/2.7.1
### Fehlerbehebungen
- Behebt Fehler beim erneuten Laden von Aufgaben mit mehreren Geogebra-Elementen

### Änderungen
- Entfernt Tooltips von der Tastatur zur Formeleingabe

## editor/2.7.0+player/2.7.0
## Verbesserungen
- Formeleingabe
  - Update der Bibliothek zur Eingabe von Formeln
  - Formeln können inline (ohne Dialog) eingegeben werden
  - Das Eingabefeld wird beim Öffnen der Tastatur zur Formeleingabe nach oben verschoben
  - Zur Texteingabe vor und hinter Formeln kann die IQB-Tastatur ausgewählt werden

## editor/2.6.2+player/2.6.2
### Fehlerbehebungen
- Korrigiert die Alias-Benennung von GeoGebra-Variablen

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
