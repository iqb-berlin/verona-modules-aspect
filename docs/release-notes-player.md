Player
======
## 2.11.3
### Änderungen
- Eingabehilfe
  - Entfernt die Tasten 'Ò' und 'Ù' aus 'Französische Sonderzeichen' ([#933](https://github.com/orgs/iqb-berlin/projects/13/views/1?pane=issue&itemId=142815291&issue=iqb-berlin%7Cverona-modules-aspect%7C933))

### Fehlerbehebungen
- Tabelle
  - Korrigiert fehlerhafte Schreibschutz-Einstellung für Kontrollkästchen ([#929](https://github.com/orgs/iqb-berlin/projects/13?pane=issue&itemId=142569164&issue=iqb-berlin%7Cverona-modules-aspect%7C929))
- Formel-Bereich
  - Korrigiert die Cursor- und Scrollposition bei der Eingabe von Text mit der IQB-Tastatur ([#936](https://github.com/orgs/iqb-berlin/projects/13/views/1?pane=issue&itemId=145272051&issue=iqb-berlin%7Cverona-modules-aspect%7C936)) 


## 2.11.0
### Fehlerbehebungen
- Eingabebereich
  - IQB-Tastatur/Eingabehilfe
    - Text wird zur aktuellen Cursorposition gescrollt
    - Behebt Fehler bei der automatischen Höhenanpassung
- Korrigiert die automatische Seitennummerierung beim Ändern der Seitendarstellung einer Aufgabe zur Laufzeit
- Tabelle
  - Implementiert die Darstellung von Validierungen für Kindelemente

### Änderungen
- Audio/Video
  - Speichert die bereits verstrichene Zeit von Hinweisen
- Eingabefeld
  - Ermöglicht das Einfügen von Text aus der Zwischenablage, wenn die zulässige Maximallänge eingestellt ist


## 2.10.1
### Fehlerbehebungen
- Audios und Videos
  - Korrigiert das Einblenden des Hinweises zum Starten
### Änderungen
- Textmarkierung
  - Hinweistext zur Auswahl des Endes einer Textmarkierung verwendet Weiß als Hintergrundfarbe

## 2.10.0
### Neue Funktionen
- Unterstützt den Print-Modus der Verona-Spezifikation 6.0
  - Wird der Player im Studio in der Druckvorschau aufgerufen, werden alle Seiten einer Unit
    gestapelt dargestellt. Das Ausblenden von Seiten und Seiten wird in dieser Ansicht unterdrückt.
    Optional kann in der Druckansicht der Alias der Elemente eingeblendet werden.

## 2.9.4
### Neue Funktionen
- Der Zustand von Abschnitten mit Regeln zur Sichtbarkeit wird in eigener Variable gespeichert
- Kennzeichnet die Elemente mit Datenattributen für ID und Alias, um sie im Replay der Kodierbox identifizieren zu können

## 2.9.2
### Fehlerbehebungen
- Schriftgröße von Kontrollkästchenbeschriftung hat den eingestellten Wert.

## 2.9.0
### Fehlerbehebungen
- Korrigiert bei Rechenkästchen die Position von schwebenden, hinten positionierten Eingabehilfen
- Behebt das Flackern vorhandener Markierungen beim Erstellen neuer Bereichs-Markierungen

## 2.8.0
### Neue Funktionen
- Beim Aufgabenwechsel wird der Zustand der aktuellen Aufgabe zur Sicherung an den Host (i. d. R. Testcenter) gesendet

## player/2.7.4
### Änderungen
- Reduziert die Verzögerung für das Senden von Änderungsmitteilungen

### Fehlerbehebungen
- "neu anfangen" aktualisiert den Wert von Geogebra-Variablen

## player/2.7.3
### Fehlerbehebungen
- Behebt Wiederherstellungsfehler von Geogebra-Variablen beim erneuten Öffnen einer Aufgabe

## 2.6.4
### Neue Funktionen
- Beim Seitenwechsel werden aktive Buttons zum Markieren von Texten zurückgesetzt

## Änderungen
- Beim Hervorheben von Textabschnitten durch Buttons werden andere Hervorhebungen zurückgesetzt

### Fehlerbehebungen
- Fasst aufeinanderfolgende markierte Wörter in den Antwortdaten von Texten zu Bereichen zusammen

## 2.6.0
### Neue Funktionen
- Unterstützt Verona API 6.0
  - Sendet Fehlermeldungen an den Host,
    - wenn Mediaelemente nicht geladen werden können
    - wenn die Dauer von Audio- und Video-Elementen nicht ermittelt werden kann
    - wenn die Ladezeit 20 Sekunden überschreitet
  - Ermöglicht dem Host das Ausblenden von Buttons zur Unitnavigation

### Fehlerbehebungen
- Korrigiert die Validierung von Eingabefeldern mit eingestellter maximaler Länge

### Änderungen
-  Ändert die Dauer von Texthervorhebung auf 60 Sekunden

## 2.5.0
- Unterstützung neuer Funktionen; siehe Allgemein

## 2.4.11
### Fehlerbehebungen
- Korrigiert das Markieren von Text, der Texthervorhebungen beinhaltet

## 2.4.7
### Fehlerbehebungen
- Behebt Fehler bei der Zurück-Navigation im Schaltflächen-Blätter-Modus

## 2.4.5
### Änderungen
- Markieren von Text
  - Verhindert unter Windows Mobile das Öffnen des Kontextmenüs

## 2.4.4
### Änderungen
- Textelement:
  - Markierte Bereiche werden innerhalb hervorgehobener Bereiche anzeigt

## 2.4.2
### Fehlerbehebungen
- Eingabefeld im Lückentest: Eingestellte Zeichenbegrenzung wird von IQB-Tastatur berücksichtigt

## 2.4.1
### Änderungen
- Stellt sicher, dass auch Audios/Videos mit langer Ladezeit nach dem Starten über ihre Statusänderung informieren

### Fehlerbehebungen
- Behebt Darstellungsfehler aud dem iPad beim Fortschrittsbalken und der Zeitanzeige von Audios/Videos
- Ermöglicht bei "Wort korrigieren" die Eingabe von Zeichen ohne zunächst das falsch geschriebene Wort durchstreichen zu müssen


## 2.4.0
### Neue Funktionen
- Unterstützt Tastatur und Eingabehilfe für Rechenkästchen
- Unterstützt neuen Verona API Modus zum Seitenwechsel 'Buttons'
- Unterstützt neues Auslöser-Element
- Unterstützt die Option des Ausblendens der Betriebssystem-Tastatur bei Eingabehilfen
- Unterbindet das Auswählen von Eingaben in Rechenkästchen
- Tastatur verfügt über Taste zum Schließen

### Änderungen
- Seiten, die ausschließlich ausgeblendete Abschnitte beinhalten, werden ausgeblendet und aus der Navigationsleiste des Testcenters und des Studios entfernt
- Beim Fokus-Wechsel zwischen Elementen mit Eingabehilfe oder Tastatur wird deren Animation unterbunden
- Zentriert den eingeblendeten Seiten-Scroll-Button in Bezug zur eingestellten Seitengröße
- Audios/Videos informieren nun unmittelbar nach dem Starten über ihre Statusänderung
- Überarbeitung der Postion und Dimension von Tooltips
- Überarbeitung der Positionierung von Eingabeelementen beim Öffnen der Tastatur

### Fehlerbehebungen
- Korrigiert die Anzeige der Anzahl der Durchläufe von Audios und Videos
- Stellt die bereits abgelaufene Zeit beim Einlenden von Abschnitten beim erneuten Aufruf einer Aufgabe wieder her
- Rechenkästchen: Verhindert auf Tablets das Öffnen des nativen Kontextmenüs für ausgewählten Text

## 2.3.0
### Neue Funktionen
- Unterstützt neue Funktionen für Geometrie und Rechenkästchen aus Editor 2.3.0
### Änderungen
- Eingestellte IQB-Tastatur erscheint wieder auf Windows-Devices mit Touchscreen

## 2.2.5
### Änderungen
- Für das Einblenden der IQB-Tastatur wird wie in den vorhergehenden Version (< 2.2.0)
  wieder auf die Überprüfung des Betriebssystem verzichtet

## 2.2.4
### Fehlerbehebungen
- Stellt die bereits abgelaufene Zeit beim Einlenden von Abschnitten beim erneuten Aufruf einer Aufgabe wieder her

## 2.2.3
### Fehlerbehebungen
- Behebt Fehler (in Version 2.2.2) beim Aufgabenwechsel im IQB-Studio bei geöffnetem Vorschau-Reiter

## 2.2.2
### Änderungen
- Verlängert bei "magnetischem Scroll-Verhalten" die einzelnen Seiten einer Unit,
  um Elemente an den Seitenenden besser erreichen zu können
### Fehlerbehebungen
- Unterbindet bei "magnetischem Scroll-Verhalten" das "Zurückspringen" von Seiten
  bei Benutzung des Scroll-Knopfes unter Firefox

## 2.2.1
Unterstützt Fehlerbehebungen aus Editor 2.2.1
### Verbesserung
- Verbessert das "magnetische" Scroll-Verhalten

## 2.2.0
Unterstützt neue Elemente und Einstellungen von Editor 2.2.0
### Änderungen
- Tastatur: Erscheint nicht auf nicht-mobil Geräten
- Font-Format ausgetauscht
### Fehlerbehebungen
- Positionierung von Eingabefeldern in Lückentexten (IPad)
- Checkbox in Lückentexten repariert

## 2.1.2
### Änderungen
- "Zurücksetzen"-Knopf des Geogebra-Elements
  - Position oberhalb des Elements
  - mit Beschriftung "neu anlegen"
  - neues Icon

## 2.1.1 deleted

## 2.1.0
### Neue Funktionen
- Der Player zeigt nur Unitdefinitionen an, die mit der gleichen Editor-Version erstellt wurden.
  Ältere Unitdefinitionen müssen daher zunächst mit einem Editor in der Version 2.1 geöffnet
  und gespeichert werden.

### Fehlerbehebungen
- Klappliste-Element repariert (ist wieder anklickbar)
- Optionsfelder: Textausrichtung bei mehrzeiligen Optionen orientiert sich wieder an der ersten Zeile
- Optionsfelder mit Bild: Optionen richten sich wieder nach unten aus

## 2.0.3
### Fehlerbehebungen
- Korrigiert Sichtbarkeitsregeln von Abschnitten mit undefinierten (leeren) Werten

## 2.0.2
### Fehlerbehebungen
- Korrigiert das automatische Haften von Markierknöpfen und den Kopfzeilen von Optionstabellen
  (Problem in Version 2.0.0 und 2.0.1)

## 2.0.1
### Änderungen
- Passt das Einbinden des Symbols für den Radiergummi an die Sicherheitseinstellungen des Testcenters an

## 2.0.0
### Neue Funktionen
- Unterstützt nur Unit-Definitionen, die mit der aktuellen Editor-Version erstellt wurden
- Umstellung der Schriftart von Roboto zu Nunito Sans
- Unterstützt die Anzeige von Tooltips innerhalb von markierbaren Texten
- Unterstützt die Anzeige von Tooltips bei Knopfelementen
- Ablegeelemente verfügen über einen optionalen Abspielknopf für Audios
- Beim Senden von "Presentation Complete" werden nur diejenigen Elemente berücksichtigt,
  die als "Relevant für 'Presentation Complete'" gesetzt sind
- Unterstützt die Regeln zur Sichtbarkeit von Abschnitten, indem die erreichten Werte
  von Elementen und Zustandsvariablen berücksichtigt werden.
  Die Funktionalität kann zur Darstellung von Text, nach dem Hören eines Audios und
  in Verbindung mit Zustandsvariablen zur Darstellung von Hypertexten verwendet werden
- Die virtuelle Tastatur des Players kann durch die ausgewählte Eingabehilfe erweitert werden
  Auf Tablets wird in diesem Fall lediglich die Tastatur nicht aber die Eingabehilfe eingeblendet
- Passt die Höhe von Eingabebereichen mit eingestellter "Automatischer Höhenanpassung" während der Eingabe an

### Verbesserungen
- Entfernt überflüssige leere Fläche von immer sichtbaren Seiten, wenn diese oben dargestellt werden
- Unterbindet das Öffnen eines Kontextmenüs für Videos
- Unterbindet den Bild in Bild Modus für Videos (Ausnahme: Firefox)
- Bei Eingabehilfen, die die virtuelle Tastatur erweitern, werden Zahlen ausgeblendet, da die Tastatur bereits über Zahlen verfügt
- Verbessert die Anzeige von Validierungsfehlern in Lückentextelementen
  Es können gleichzeitig Fehler von mehreren Elementen dargestellt werden, da
  keine Tooltipfunktionalität mehr verwendet wird.

### Fehlerbehebungen
- Korrigiert Haftfunktionalität von Markierknöpfen bei eingestelltem "Blätter-Modus"
- Behebt Fehler beim Ausblenden der Bildlaufknöpfe am unteren Bildrand

## 1.32.0
### Neue Funktionen
- Das Präfix "aspect" im Dateinamen wird durch "iqb" ersetzt.
  Der aktuelle Editor heißt "iqb-editor-aspect-1.32.0"
- Ändert die Metadaten entsprechend der Verona Interfaces Specification zu Version 5.0

### Verbesserungen
- Player stellt keine eigene Meldung mehr dar, wenn er vom Host die Meldung erhält,
  dass die Navigation verweigert wird. Diese Meldung ist Aufgabe des Hosts.

## 1.31.0
### Verbesserungen
- Verbessert die Positionsbestimmung für schwebende Eingabehilfen

### Fehlerbehebungen
- Korrigiert die Darstellung von Platzhaltern in Ablegelisten von Lückentexten
- Korrigiert die Position der Tasten in rechts positionierten Eingabehilfen

## 1.30.5
### Fehlerbehebungen
- Ablegelisten
  - Bilder in Ablegelisten tragen nun korrekt ihre ID und produzieren keine Fehler
  - Vorschau behält die größe des gezogenen Elements
  - Mauszeiger bleibt an der Position an der das Element angefasst wurde
  - Überarbeitete Regeln zur erkennung von validen Ablagen

## 1.30.4
### Fehlerbehebungen
- Korrigiert Tastatureingabefehler beim Tablet bei gleichzeitiger Verwendung von Tastatur und Eingabehilfe

## 1.30.3
### Fehlerbehebungen
- Ersetzt den temporären Platzhalter von Bilder in Ablegelisten, die Verdrängung erlauben
- Behebt Fehler beim Verdrängen von Elementen, die aus Kopierlisten stammen

## 1.30.2
### Verbesserungen
- Wenn ein Element ein anderes Element in einer Ablegeliste verdrängen soll,
  wird die Darstellung des zu verdrängenden Listenelements unterbunden, sobald der Platzhalter erscheint.

## 1.30.1
### Fehlerbehebungen
- Repariert die Indices von gezogenen Drag-and-Drop-Elementen bei dynamisch zentrierter Ausrichtung

## 1.30.0
### Fehlerbehebungen
- Behebt Probleme bei Lückentexten mit Knopfelementen
  Bei Lückentexten mit mehreren Elementen und mindestens einem Knopfelement,
  wurde den Elementen teilweise die Eigenschaften des Knopfelements zugeordnet

## 1.29.3
### Fehlerbehebungen
- Korrigiert die Position des Textes auf gezogenen Ablegelistenelementen

## 1.29.2
### Fehlerbehebungen
- Korrigiert die Warnmeldungsrahmenfarbe von als Pflichtfeld markierten Ablegelisten
- Korrigiert die Position von schließenden Zitatanführungszeichen in auf Chrome basierenden Browsern

## 1.29.1
### Verbesserungen
- Ändert die voreingestellte Hintergrundfarbe bei Ablegelisten für Ablegeankündigung
- Ändert die Rahmenfarbe für Eingabefelder, Eingabebereiche, Formeln und Optionsfelder in Lückentexten
- Überarbeitet Mauszeiger für Ablegelisten
  - Wird in der Ursprungsliste "Elemente kopieren" benutzt, wird der "Kopieren"-Mauszeiger verwendet
  - Ist ein Ablegen nicht erlaubt, wird der "Verboten"-Mauszeiger benutzt
  - In allen anderen Fällen (das beinhaltet alle Flächen außerhalb von Ablegelisten) wird der
    "Verschieben"-Mauszeiger verwendet
  - **Die Darstellung der Mauszeiger ist abhängig vom Betriebssystem**

### Fehlerbehebungen
- Speichert Änderungen an GeoGebra-Elementen, die durch Benutzung der
  Rückgängig- und Wiederherstellen-Knöpfe ausgelöst wurden
- Korrigiert die Ablegeankündigung für leere Ablegelisten
- Verhindert das Ablegen von Elementen, die nicht zu einer Ablegeliste gehören


## 1.29.0
### Verbesserungen
- Elemente von Ablegelisten, die nur ein Element zulassen, werden nur dann zentriert dargestellt,
  wenn die Ablegelisten innerhalb von Lückentexten angelegt sind
- Eingabehilfen bewegen sich innerhalb des sichtbaren Bereichs einer Seite mit,
  wenn die Seite gescrollt wird

### Fehlerbehebungen
- Stellt die erreichte Sichtbarkeit von Abschnitten mit eingestellter Verzögerung
  beim erneuten Laden einer Unit wieder her
  Folgendes ist zu beachten:
  - Abschnitte mit eingestellter Verzögerung dürfen nicht leer sein
  - Bereits verstrichene Zeit kann beim erneuten Laden berücksichtigt werden

## 1.28.4
### Fehlerbehebungen
- Korrigiert Darstellungsfehler von hervorzuhebenden Textbereichen, bei gleichzeitiger Markierung

## 1.28.3
### Verbesserungen
- Änderungen an hervorzuhebenden Textbereiche
  - Die Dauer der Anzeige beträgt 15 Sekunden
  - Es ist immer nur eine Hervorhebung aktiv

### Fehlerbehebungen
- Korrigiert das Scroll-Verhalten von versteckten Abschnitten mit unterschiedlichen Verzögerungen
- Korrigiert Darstellungsfehler von Eingabefeldern in Lückentexten in FireFox

## 1.28.2
### Verbesserungen
- Ermöglicht die Interaktion mit Elementen, die sich hinter einem Rahmenelement befinden
- Vereinheitlicht die vertikale Ausrichtung von Kindelementen von Lückentexten

### Fehlerbehebungen
- Behebt Fehler beim Hochladen von Aufgaben mit HTML-Sonderzeichen ins Testcenter

## 1.28.1
### Verbesserungen
- Darstellung und Verhalten der Warnmeldung von Formelelementen
  verhalten sich analog zu anderen Elementen
- Korrigiert die vertikale Ausrichtung von Ablegelisten in Lückentexten

### Fehlerbehebungen
- Behebt das versehentliche Löschen von Text beim Entfernen von
  Markierungen aus Textelementen (im Firefox-Browser)


## 1.28.0

### Neue Funktionen
- Macht das neue Element "Bildbereiche" im Player verfügbar
  "Aktive Bereiche" werden beim Anklicken durch den User mit der
  eingestellten Farbe gefüllt.
- Eingabebereiche mit "dynamischen Zeilen" passen die Anzahl
  ihrer Zeilen an das gegebene Seitenformat an
- Optionale Tastatursymbole von Eingabefeldern und -bereichen
  werden nach erster Benutzung der Elemente ausgeblendet
- Die neue Eingabehilfe "Eigene Zeichen" nutzt weitestgehend das Layout
  der Eingabehilfe "Französische Sonderzeichen"
- Ist die Texteingabe bei Eingabefeldern auf eine Maximallänge begrenzt, kann kein
  Text über die Zwischenablage eingefügt werden
- Vordefinierte markierte Bereiche in Texten können gezielt über vordefinierte Klicks auf
  Navigationsknöpfe für 30 Sekunden farblich hervorgehoben werden
- Aktiviert verborgene Abschnitten mit der angegebenen Verzögerung (in Millisekunden)

### Verbesserungen
- Verbessert die Performanz von GeoGebra-Elementen
- Ändert die Metadaten entsprechend der Verona Inferfaces Specification
- Zeigt Ladeanimationen während des Ladens von GeoGebra-, Video- und Audioelementen
- Wendet die angegebene Zeilenhöhe bei Optionsfeldern auch auf die Beschriftung an

### Fehlerbehebungen
- Zeigt Validierungsfehler ohne angegebene Warnmeldungen nur mit rotem Rahmen an
- Korrigiert fehlende Warnmeldungen beim Schieberegler/Zahlenstrahl
- Verhindert die Anzeige von Bildlaufleisten bei Geogebra-Elementen mit fester Größe


## 1.27.0
- Add new input assistance presets ('Space' and 'Comma').
  The preset 'Space' can be used to separate words.
  The preset 'Comma' can be used to add commas in texts.
- Add optional arrow keys to the input instance.
  This is useful for the 'Comma' and 'Space' presets.
- Add optional enter keys to the input instance of text areas.
- Improve placeholder behavior and styling of drop lists

## 1.26.3
- Support editor version 1.33.3

## 1.26.2
- Fix reading of old unit definition of likert options, radio-group-images image position and drop-list option with empty text

## 1.26.1
- Fix reading of old unit definition of likert-row, radio-group-images and drop-list
- Fix strike-through in toggle-button to only appear after a value is set

## 1.26.0
- Improve performance by reducing the frequency of change notifications to the host
- Display pages in scroll mode without generated spacing
- Add scroll buttons to pages that can be scrolled
- Display validation errors for children of cloze elements and for drop lists
- Fix reset option of dropdown element
- Improve setting of the height of placeholders in drop lists

## 1.25.2
- Fix the scroll position of input elements when
  opening the virtual keyboard in small browser views
  In small browser views elements are now scrolled
  to the top of the view instead of the middle of the view

## 1.25.1
- Fix sending unit state values to the backend

## 1.25.0
- Scroll page when opening the virtual keyboard
- Scroll to section after it is unlocked
- Fix initialisation problems of elements in hidden sections
- Resolve response status issues after re-entering a unit
- Fix problems with restoring drop-list, radio, radio-group-images,
  dropdown, toggle-button, likert-row values when re-entering the unit
- Reset the shift key after entering a capital letter
- Add software tests

## 1.24.0
- Fix display of empty dynamic drop lists on iOS 14

## 1.23.0
- Show virtual keyboard only on mobile devices. If a hardware keyboard is connected,
  the virtual keyboard is disabled after pressing the first hardware key.
- Scroll focused text element into the browser view, when using the virtual keyboard

## 1.22.1
- Fix reading of old radio button group options

## 1.22.0
- Fix drop list appearance
  Should no show up even without any contained items; shows outline etc.
- Implement ability to display sections depending on the status of audios/videos
- Fix delay of hints for audios and videos
-> Contains fixes and support for editor release 1.28.0

## 1.21.0
- Implement page navigation action for buttons
- Prevent pasting in text fields and areas with math keyboard
- Implement link variant of the button component
- Implement textfield option to restrict characters of the selected assistance
- Add support for reworked grid parameters
  Refer to Editor patch notes for 1.27.0 for additional info on reworked systems

## 1.20.1
- Fix styling issues with some elements in version 1.20.0

## 1.20.0
- Implement readonly for text fields of cloze elements
- Set the default language of the player to German
- Fix height of elements with dynamic positioning and fixed size
- Fix dimensions of image elements with dynamic positioning and fixed size
- Fix positioning of floating virtual keyboard for fixed size elements
- Fix positioning of floating marking bar when text element is dynamically positioned and has fixed size
- Fix display of fixed size dynamic elements on iPad
- Fix selecting and marking of text on iPad

## 1.19.0
- Remove border of slider rectangle in number line mode at position 0
- Set the minimum height of a page to the screen size
- Set background color of page
- Improves scroll snap behaviour for small pages

## 1.18.0
- Show arrow for slider in number line mode
- Center the position of slider rectangle in number line mode
- Color the slider rectangle in number line mode also in position 0
- Add a Unicode font to display squares, bars, and dots

## 1.17.0
- Add animation for fixed virtual keyboard
- Fix the display of dynamic elements with negative z-index
- Use dot instead of comma as thousands separator in slider
- Do not color the progress on the number line

## 1.16.0
- Start the valid value range for DropDown, Likert, RadioGroup, RadioGroupImages and ToggleButton at 1
  Attention! This can lead to incompatibilities when reloading units that were answered in IQB - TestCenter
  with AspectPlayer < 1.16.0. Already saved results are displayed incorrectly for these elements.
- Improve centering of layout
- Disable logs to console in production
- Enable autostart of audios/videos when reloading the unit
- Mark text without selecting first
- Show marking options as popup when text is selected
- Implement virtual keyboards for 'place value', 'numbers and basic operators', 'square, dash and dot'
- Show virtual keyboard optionally on the right side of the view

## 1.15.0
- Fix restoring of toggle buttons
- Prevent audio/video hint text from being displayed after reloading a played audio/video file
- Fix marking text when the selection is empty at the end
- Improve checking of responsesProgress of compound elements

## 1.14.0
- Specify the colors for marking in hexadecimal notation
- Improve  the determination of the ResponseProgress
- Change metadata for Verona Api 4.0
- Fix unstable behavior when marking text
- Fix disappearance of scrollable pages with dynamic content

## 1.13.0
 - Improve page snapping when scrolling when concat-scroll-snap property is selected
 - Color the disabled progress bar of the media player green
 - Fix the section from being placed in front of elements with negative z-index
 - Fix saving of drop list elements
 - Show warning messages of input fields at event 'NavigationDenied' only if reason "responsesIncomplete" is sent

## 1.12.0
- Use fixed size property for dynamic button, drop-list and text-field components
- Prevent scrollbars for static buttons with images
- Fix the playability of dependent audios and videos
- Fix storing/restoring of the playback time of audios and videos
- Fix disabling mute button of audios and videos
- Use z-index property for all elements
- Fix the response status when re-entering the unit
- Ignore blank pages when calculating the response progress
- Fix position of virtual keyboard for text areas
- Rename marking tag of text to 'aspect-marked'
- Restore the state of likert elements when re-entering a unit
- Change saving format of text markers

## 1.11.0
- For spelling element use the same font properties for input field and button
- Change cross out behaviour of spelling element. The button now behaves as
  toggle button and sets the focus to the input element only when it is crossed through.

## 1.10.0
 - Add virtual keyboard for comparison operators only
 - Fix volume setting of audios and videos
 - Fix page turning in Test Studio

## 1.9.0
 - Add support for new frame element

## 1.8.0
 - Fix reading of highlight properties of text elements
 - Add support for new elements: slider and spelling

## 1.7.0
 - Hint and autostart functionality of videos and audios is initialized only
   after dependencies to other audios and videos have been resolved
 - Remove minus sign if remaining time in audio/video player is 0
 - Fix playback option for videos
 - Disable mute control if wanted
 - Fix dependency resolving problems with audios and videos, when minRuns and maxRuns have the same value
 - Add rubber icon to delete text marks
 - Restrict the allowed inputs for the virtual keyboard (only numbers and numbers and operators).
   If these virtual keyboards are used, input via the normal keyboard is also restricted to these
   characters.
 - Allow or disallow scaling of videos and images. If the allowed, the video or image will be scaled as far as its
   container (static element or grid) allows, otherwise only up to its maximum native size.
 - Improve cursors of draggable items


## 1.6.0
 - Include audios and videos in presentationProgress. The presentation will not be completed until all audios and videos
   with the minRun property have been played.
 - Fix style and scroll behavior of marking buttons
 - Fix problem with truncated text in text components when using large font sizes
 - Hide audio and video control bar when no control is marked for display
 - Add the floating variant of the virtual keyboard for numbers and numbers + operators
 - Hide mute control if wanted
 - Use minimum volume value (value between 0 and 1)
 - Use default volume value  (value between 0 and 1)
 - Use minimal height setting for dynamic elements

## 1.5.0
 - Show the magnifier only when the mouse is over the image
 - Fix saving of inputs via the virtual keyboard
 - Show background color for dynamic sections
 - Set default volume of audios and videos to 80%
 - Play audios and videos depending on others. If an audio or video is defined as dependent on another, it
   cannot be played until the latter has played the minimum number of its runs
 - Make sure that settings of Boolean values are taken over from the editor to the player.
   The error occurred with the progress bar of the video element.

## 1.4.1
  - Make text underlinable
  - Fix marking of text

## 1.4.0
  - Add error-messages to DropList
  - Save values of DropList
  - Send responseProgress 'complete' when all required elements are valid
  - Prevent simultaneous media playback
  - Fix position of virtual keyboard when it appears above a text field

## 1.3.0
 - Add adjustable magnifier for images
 - Fix delay for hints in audio and video player
 - Fix delay for auto start in audio and video player
 - Send presentationProgress 'complete' when elements are displayed
 - Implement unit navigation for button elements
 - Show optional images for radio button groups

## 1.2.4
 - Support the possibility to set the display of the remaining runs

## 1.2.3
 - [Bug] Fix position of error warn message for radio buttons

## 1.2.2
 - Turn the display of the audio/video start button on and off
 - Turn the display of the audio/video pause button on and off
 - Turn the display of the audio/video progressbar on and off
 - Turn the display of the audio/video progressbar on and off
 - Turn the use of the audio/video progressbar on and off
 - Turn the display of the audio/video volume controls on and off
 - Turn the display of the audio/video remaining time display on and off
 - Change the display mode of the audio/videoAudio/video time by clicking on it
 - Display audio/video hint text below the control panel
 - Display audio/video hint text with delay (in milliseconds)
 - Start audio/video automatically when entering the unit
 - Start audio/video automatically when entering the unit with delay (in milliseconds)
 - Restart audio/player automatically
 - Allow a maximum number of playbacks
 - Display current playback and maximum playback when a maximum number of playbacks is set
 - Detect if elements are visible on the screen

## 1.2.1
- Apply audio and video appearance properties of the editor to the player
- Add space for hints beneath the control bar for audios and videos
- Save the current playback time of audio and videos

## 1.2.0
- Add custom control bar for audio and video elements
- Change background color and font size of virtual keyboard keys
- [bug] Solve problem with deleting text markers in Firefox

## 1.1.1
- Fix reading of existing elements

## 1.1.0
- Make texts markable
- Implements virtual keyboard for special characters
- Implements autosize for grid columns and grid
- Allow different positions for always visible page
- [bug] Remove unnecessary scrollbars from images in Firefox

## 1.0.11
- Disable autocomplete for text field and text area

## 1.0.10
- [bug] Center single column pages
- [bug] Allow aspect ratio for always visible side over 50%
- Display validation messages in small font size directly below the input line

## 1.0.9
- Allow loading of all aspect module unit definitions

## 1.0.8
- [bug] Don't show needless scrollbars for radio button group and validation messages
- [bug] Fix/Allow resizing of text area
- Support Roboto font
- [bug] Reset pages when loading a new unit definition
