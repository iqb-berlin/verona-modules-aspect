Editor
======
## 2.4.0
### Neue Funktionen
- Rechenkästchen: 
    - Tastatur und Eingabehilfe (Ziffern / Ziffern & Basis-Operatoren / Ziffern & Operatoren & '=') können hinzugefügt werden
    - Pfeiltastennavigation zwischen den einzelnen Kästchen ist möglich
- Ablegeliste:
  -  ID der Optionen wird im Eigenschaftenbereich angezeigt
  -  Knopf zum Verbinden aller verfügbaren Ablegelisten
- Neues Element: Auslöser
  - Element ist nur im Editor sichtbar
  - Eingestellte Aktion wird bei der Ankunft des unsichtbaren Elements im Bildbereich des Browsers ausgelöst
- Auf mobilen Geräten kann bei Eingabehilfen das zusätzliche Einblenden der Betriebssystem-Tastatur ausgeschaltet werden

### Fehlerbehebungen
- Legt für Kinderelemente von Optionstabellen und Lückentexten beim Einfügen von kopierten Abschnitten neue IDs an. verhindert damit den Fehler "Doppelte Ids"
- Korrigiert die Vorauswahl bei Optionstabellen
- Hintergrundfarbe von Eingabefeldern verdeckt nicht länder den eingegebenen Text
- Korrigiert bei doppelter Eingabe die Darstellung von Rechenzeichen bei Rechenkästchen  

### Änderungen
- Die voreingestellte Schriftfarbe im Text-Editors ist schwarz 
- Überarbeitung des Optionsdialogs für Ablegelisten


## 2.3.0
### Neue Funktionen
- Geometrie: Es können nun Variablen der Aufgabe ausgewählt werden, welche in den Ergebnisdaten
  gesondert ausgewiesen werden.
- Rechenkästchen:
  - neue Operation: "variables Layout". Mit dieser Einstellung wird keine Rechenoperation vorgegeben.
    Weitere Einstellungen sind via Menu auswählbar.
  - Die untere Hilfszeile kann analog zu Term- und Ergebniszeilen vorbelegt werden
### Fehlerbehebungen
- Zeigt HTML-Formatierungen der Optionen von Klapplisten korrekt an

## 2.2.1
### Fehlerbehebungen
- Rechenkästchen: Fehlende Helferzeilen bei Addition und Subtraktion hinzugefügt
- Rechenkästchen: Minuend statt Subtrahend durchstreichbar
- Lückentext: Eingabefeld hat den gleichen Font wie alle Elemente drumherum (NunitoSans)
- Lückentext: Als durchgestrichen formatierter Text erscheint jetzt als solcher

## 2.2.0
### Neue Funktionen
- Rechenkästchen: Nachbildung von schriftlichem Rechnen
  - Einträge können via Doppelklick durchgetrichen werden. Das gilt für Helferzeilen und Minuenden.
  - Terme und das Ergebnis können durch Leerzeichen oder Unterstriche mit editierbaren Lücken versehen werden.
- Formel-Bereich: Eingabebereich mit der Möglichkeit Formeln einzubetten
- Optionentabelle: Neue Gestaltungsoption: Färbung erster Zeile
### Änderungen
- Optionentabelle: Zeilenhöhe bezieht sich nur noch auf die Zeilen und nicht die Überschriften
- Font-Format ausgetauscht
### Fehlerbehebungen
- Optionentabelle: Auswahlelement zur Vorbelegung von Zeilen (Dialog) zeigt nun korrekt den gewählten Wert an
- Eingabefeld: Aussehen 'ausgefüllt' repariert
- Formeleditor: Klammern werden nicht mehr automatisch geschlossen

## 2.1.1
### Änderungen
- Duplizierte Elemente verlieren ihren Wert für Spalte/Zeile (Raster - dynamisches Layout)
  Damit liegen duplizierte Elemente nicht mehr deckungsgleich übereinander.
  (Gilt nicht für Elemente duplizierter Seitenabschnitte.)
- "Zurücksetzen"-Knopf des Geogebra-Elements
  - Position oberhalb des Elements
  - mit Beschriftung "neu anlegen"
  - neues Icon
### Fehlerbehebungen
- Sichtbarkeitseinstellungen duplizierter Abschnitte repariert
  Einstellungen an Kopien werden nicht mehr auf das Ursprungselement angewendet.

## 2.1.0
### Neue Funktionen
- Für die Bedingungen zur Sichtbarkeit von Abschnitten kann nun die
  logische Verknüpfung festgelegt werden: UND / ODER  

### Fehlerbehebungen
- Element-IDs gelöschter Abschnitte werden korrekt verfügbar gemacht
  Damit können Abschnitte die kopiert und direkt gelöscht werden, eingefügt werden und
  die IDs bleiben erhalten.
- Klappliste-Element repariert
  Wird nun im Editor angezeigt und ist im Player anklickbar.
- Optionsfelder: Textausrichtung bei mehrzeiligen Optionen orientiert sich wieder an der ersten Zeile
- Optionsfelder mit Bild: Optionen richten sich wieder nach unten aus

## 2.0.2
### Änderungen
- Passt das Einbinden des Symbols für den Radiergummi an die Sicherheitseinstellungen des Testcenters an


## 2.0.1
### Fehlerbehebungen
- Element-IDs eingefügter Abschnitte werden korrekt registriert

## 2.0.0
### Neue Funktionen
- Versionshandhabung
  - keine Unterstützung für Unit-Definitionen, die Editorversionen vor 1.37 erstellt wurden
  - Warnung, wenn alte Unit-Defintion geladen wird.
- Umstellung der Schriftart von Roboto zu Nunito Sans
  Zugehöriges Eigenschaftsfeld entfernt.
- alle Elemente haben haben nun folgende Dimensionseigenschaften:
  - Mindesthöhe
  - Maximalhöhe
  - Mindestbreite
  - Maximalbreite
- Elementabstände haben eine Einheit (Pixel oder Anteile)
- Bildelemente haben einen Alternativtext, der angezeigt wird, wenn das Bild nicht geladen wird
- Optionentabelle: neue Eigenschaft "Haftende Kopfzeile"
  Wenn gesetzt, wandert die Kopfzeile beim Scrollen mit und bleibt immer sichtbar, solange die Tabelle im Sichtbereich ist
- Ablegeoptionen können eine Audioquelle beinhalten
- Knopf:
  - Tooltip kann hinzugefügt werden
  - Randeigenschaften hinzugefügt (ähnlich dem Element "Rahmen")
  - neue Aktion: "Zustandsvariable ändern"
- Text:
  - Textabschnitte können ausgewählt und mit einem Tooltip versehen werden
- Kontrollkästchen:
  - Kann jetzt den Text durchgestrichen darstellen, wenn ausgewählt.
- Lückentext:
  - Kann jetzt Kinder vom Typ Kontrollkästchen beinhalten. Diese werden ohne Kasten dargestellt und
    "Auswahl durchstreichen" ist vorausgewählt.
- Regeln zur Sichtbarkeit von Seitenabschnitten wurden überarbeitet
  - Werte von Zustandsvariablen und Elementen bestimmen die Sichtbarkeit
  - Knopfelemente verändern die Werte von Zustandsvariablen
- alle Elemente haben Eigenschaft "Relevant für 'Presentation Complete'"
- Ersetzt die Einstellung "Tastatur: Französische Sonderzeichen" durch "Tastatur mit Eingabehilfe erweitern"
- Neue Einstellungsmöglichkeit für Eingabebereiche: "Automatischer Höhenanpassung"

### Verbesserungen
- Referenzüberprüfung beim Löschen von Elementen, die mögliche Verweisziele sind
  - Werden entsprechende Elemente (betrifft im Moment: Ablegelisten, Audio/Video und Knöpfe)
    oder Seiten/Seitenabschnitte, die diese beinhalten, gelöscht, wird überprüft, ob auf sie verwiesen wird.
    Wenn das der Fall ist, wird in einem Dialog darauf hingewiesen. Es gibt die Option, die Verweise zu entfernen
    (und damit die verweisenden Elemente evtl. unbrauchbar zu machen) oder abzubrechen. Bei Abbruch wird eine Liste
    der betreffenden Elemente dargestellt, damit manuell korrigiert werden kann.
  - Überprüfung findet auch beim Laden von Units statt. Hier werden fehlerhafte Verweise direkt entfernt.
- Abschnittselemente werden so angelegt/sortiert, dass die Tabulatorreihenfolge
  (bei der Anzeige im Player) sich an der optischen Reihenfolge orientiert
- Element-IDs auf 20 Zeichen limitiert und keine Leerzeichen erlaubt
- Feste Seitenbreite mit 750px als Voreinstellung
- Optionsfeld im Lückentext hat als Voreinstellung 2 Optionen
- Eingabehilfe: "Bearbeitung anderer Zeichen verhindern" ist nicht mehr voreingestellt
- neues Sonderzeichen im TextEditor: geschützter Bindestrich
- Lückentext-Optionsfeld: durchgestrichener Text hat breitere Linie
- Verbesserte Oberflächengestaltung:
  - Seitenabschnittsmenu
  - TextEditor
  - Dialog für Medienelemente
- Als Tooltip gekennzeichnete Bereiche werden im Textbearbeitungsdialog hellgrau hinterlegt
- Zeigt den Zurücksetzenknopf von GGB-Elementen unterhalb des Elements an
- Verhindert in den Einstellungsmöglichkeiten von Elementen das Löschen von Zahlwerten aus Zahleingabefeldern

### Fehlerbehebungen
- Geometrie: customToolbar wird korrekt gespeichert
- Selektionsrahmen für Lückentext-Elemente verbessert
- Behebt Fehler beim Duplizieren von Lückentext-Elementen
- Behebt Fehler beim Laden von GGB-Elementen, die sich nicht auf der ersten Seite einer Unit-Definition befinden

## 1.39.0
### Neue Funktionen
- Das Präfix "aspect" im Dateinamen wird durch "iqb" ersetzt.
  Der aktuelle Editor heißt "iqb-editor-aspect-1.39.0"
- Ändert die Metadaten entsprechend der Verona Interfaces Specification zu Version 4.0


## 1.38.0
### Fehlerbehebungen
- Korrigiert das Setzen der Seitennavigation im Knopfelement

## 1.37.5
- Unterstützt die aktuelle Fehlerbehebung im Player

## 1.37.4
- Unterstützt die aktuelle Fehlerbehebung im Player

## 1.37.3
- Unterstützt die aktuellen Fehlerbehebungen im Player

## 1.37.2
### Verbesserungen
- Erlaubt das Setzen von "Verdrängen erlauben" für Ablegelisten nur in Verbindung mit der Option "Nur ein Element"

## 1.37.1
### Fehlerbehebungen
- Repariert die Indices von gezogenen Drag-and-Drop-Elementen bei dynamisch zentrierter Ausrichtung

## 1.37.0
### Verbesserungen
- Erneute Überarbeitung von Ablegelisten
  - Unterscheidung zwischen Sortierlisten und normalen Ablegelisten existiert nicht mehr.
      Alle Listen lassen Umsortieren zu.
  - Zurücklegen in Listen mit kopierenden Elementen ist nun standardmäßiges, unabänderliches Verhalten.
  - 'Verdrängen erlauben' ist nun eine Einstellung für Listen, anstatt für einzelne Optionen
  - Platzhalter übernehmen die Größe der bewegten Elemente
  - Verbesserte Ausrichtung in Lückentexten

## 1.36.2
- Setzt für Eingabe- und Optionsfelder in Lückentexten den voreingestellten Wert für die Zeilenhöhe auf 100%

## 1.36.1
### Verbesserungen
- Unterstützt neue Darstellungen (s. Player Version 1.29.1)


## 1.36.0
### Neue Funktionen
- Bietet unterschiedliche Startpositionen für schwebende Eingabehilfen an  

## 1.35.3
### Verbesserungen
- Ändert Symbol und Tooltip-Namen für Knopf als Lückentextelement
- Erweiterung der Möglichkeiten für hervorzuhebende Textbereiche im TextEditor
  - Die hervorzuhebenden Textbereichen können mit einer Farbe belegt werden
  - Innerhalb eines Textbereichs können weitere Textbereiche mit anderen Farben definiert werden
    - Eine noch tiefere Verschachtelung ist nicht möglich
- Überarbeitet die Variablenliste zur Codierung für Geometrie-, Bildbereiche- und Textelemente

## 1.35.2
### Verbesserungen
- Wendet die Eigenschaft "Schreibgeschützt" auf Formel Elemente an
- Auswahllisten, die nur ein Element zulassen, werden von diesem Element komplett ausgefüllt
- Vereinheitlicht das Verhalten von Kindelementen von Lückentexten bei Änderung ihrer Höhe
  Bei Veränderung des Wertes ändert sich die Höhe aus der Mitte heraus
- Setzt bei allen Kindelementen von Lückentexten die Vorbelegung der Höhe auf 30

## 1.35.1

### Verbesserungen
- Das Aussehen von Formelelementen kann im Eigenschaftsfenster geändert werden   

## 1.35.0

### Neue Funktionen
- "Bildbereiche" als neues Element
  Auf einem Hintergrundbild können durch den User ausfüllbare und
  nicht ausfüllbare (schreibgeschützte) "aktive Bereiche" platziert werden.
  Die Bereiche können als Ellipsen, Rechtecke und Dreiecke angelegt werden.
  Ihre Position, Größe, Drehung, Farbe und Rahmenbreite kann eingestellt werden.
  Das Element kann als Pflichtfeld ausgezeichnet werden.
- Neues Element "Formel"
  Ermöglicht Formeleingabe in vergleichbarer Form zu einem Eingabefeld.
  In der Standardeinstellung lassen sich nur Formeln eingeben. Wenn "Eingabemodes änderbar"
  ausgewählt ist, erscheinen Knöpfe über dem Feld und der Eingabemodus kann auf 'Text'
  umgestellt werden. Das Einfügen von Formeln funktioniert nur im Formel-Modus!
  Für die Vorbelegung ist der duale Modus permanent aktiv.
- Knöpfe können nun als Lückentextelemente verwendet werden.
  Sie haben als Vorbelegung die Einstellung "als Hyperlink-Text darstellen".
- "Elementinteraktion erlauben"-Schalter ermöglicht mit Elementen
  bereits im Editor zu interagieren und deren Verhalten zu überprüfen.
  Das kann hinderlich beim Bewegen von Elementen sein und bleibt standardmäßig
  deaktiviert.
  - Dies hat keinen Einfluss auf das Verhalten im Player und wird beim Verlassen
    des Editors zurückgesetzt.
  - Interaktion mit den Elementen hat keinen Einfluss auf deren Vorbelegung. Diese
    ist weiterhin ggf. im Eigenschaftsfenster zu setzen.
- Möglichkeit, die maximale Zeichenanzahl von Eingabefeldern zu begrenzen
- Neue Kontrollelemente im Texteditor
  - Im TextEditor können nun Bereiche markiert werden, die dann im Navigationsknopf
    über die Aktion "Textabschnitt hervorheben" ausgewählt werden können.
  - Bilder können nun zusätzlich in voller Größe, in eigenem Absatz sowie mit rechts
    oder links umlaufendem Text angelegt werden.
- Ermöglicht die Angabe einer Verzögerung (in Millisekunden)
  für Aktivieren von verborgenen Abschnitten
- Runderneuerte Ablegelisten
  - Neuer Schalter "Sortierliste". Sortierlisten ermöglichen das Umsortieren der
    Elemente und haben einen dynamischen Platzhalter.
    Normale Listen haben einen unbewegten, versteckten Platzhalter und die gesamte Liste
    wird farbig markiert beim *mouseover*.
  - Neuer Schalter "Gleiche abgelegte Elemente löschen"
    Ist dieser gesetzt und es wird ein Element mit gleicher ID in das Feld zurückgelegt, so verschwindet dieses.
  - Neuer Schalter für Optionselemente "Verdrängen erlauben"
    Elemente mit gesetztem Schalter werden zurück in ihre Ursprungsliste verschoben, wenn
    ein anderes Element in ihre Liste gezogen wird.
  - "Potentielle Ablagen hervorheben" bezieht sich nun auf alle verbundenen
    Ablegelisten und muss nicht mehr in der Zielliste gesetzt werden.
  - Verbesserte Formatierierung des gezogenen Elements

### Verbesserungen
- Ermöglicht für Eingabebereiche die dynamische Anpassung der Anzahl von Zeilen
  Auf Grundlage der Angabe der erwarteten Zeichen für die Antwort des Users wird
  für das gegebene Seitenformat die Anzahl der Zeilen berechnet.
- Darstellung eines optionalen Tastatursymbols bei Eingabefeldern und -bereichen
- Validierungen ohne Warnmeldungen
  Warnmeldungen können nun ohne Zeichenketten abgespeichert werden.
- Definition eigener Zeichen für die Eingabehilfe
  Durch Auswahl der Option "Eigene Zeichen" öffnet sich ein Textfeld,
  in das die gewünschten Zeichen als ein Wort eingegeben werden können.
- Shortcuts und *Rückgängig machen* im TextEditor re-aktiviert. Das automatische
  Generieren von Listen bleibt deaktiviert.
- GeoGebra-Elemente können nun auch durch Hochladen einer .ggb-Datei angelegt werden.
- Die Erweiterung der Aktionsmöglichkeit eines Navigationsknopfs
  führt zur Umbenennung in "Knopf"
- Zeigt Ladeanimation bei GeoGebra-, Video- und Audioelementen
- Wendet die angegebene Zeilenhöhe bei Optionsfeldern auch auf die Beschriftung an

### Fehlerbehebungen
- "Verbundene Ablegelisten"-Menu öffnet sich beim ersten Click und zeigt immer die
  Anzahl der verbundenen Listen.
- Fehler bei leerer Unit-Definition behoben
- Falls eine Unit-Definition nicht gelesen werden konnte erscheint eine Fehlermeldung
  und der Editor startet mit einer leeren Unit.
  Es soll möglich sein alle (alten) Unit-Definitionen zu laden, andernfalls ist es ein Bug.
  Dieses Verhalten verhindert, dass in diesem Ausnahmefall der Editor in einen unbenutzbaren
  Zustand gerät.
- Felder zur Größenanpassung aus den elementspezifischen Einstellungen entfernt.
- Verhindert die Anzeige von Bildlaufleisten bei Geogebra-Elementen mit fester Größe
- Korrigiert Initialisierungs-Fehler von GeoGebra-Elementen beim wiederholten Laden von
  Aufgaben

## 1.34.0
- Implement GeoGebra applet element
  This needs a base64 representation of a unit.
  CustomToolbar setting as text-field is a temporary solution as a nice UI would
  be rather complicated to implement.
  Reference list of possible values can be found here:
  https://wiki.geogebra.org/en/Reference:Toolbar
- Add background color setting to text-field in cloze
- Fix frame border initialization
- Fix visual issue with double borders in TextEditor
- Fix DropList duplication
- Fix likert-row preset to show rich text
- Fix frame border switch translation (top and bottom were mixed up)

## 1.33.3
- Enable reading of duplicate IDs
  IDs will be generated and a warning is shown.

## 1.33.2
- Fix reading of old unit definition of likert options, radio-group-images image position and drop-list option with empty text

## 1.33.1
- Fix reading of old unit definition of likert-row, radio-group-images and drop-list
- Fix strike-through in toggle-button to only appear after a value is set

## 1.33.0
- Provide response schemes for elements; They are used by the "verona schemer"
- Implement changing media source for image, audio, video (also improve layout+styling)
- Add option to hide borders of frame element
  This way line-like elements are possible.
- Implement strike-through for selected value of toggle-button
- Make popup for selecting marker colors for text elements optional
- Implement read-only for elements still missing it
- Rework option elements
  - All have "Options"
    - Likert has "Rows" additionally
  - All, except dropdown, can have rich text
  - Improve properties panel layout and styling
- Rework radio-group-images element layout
  Add new parameter 'itemsPerRow'. This limits the grid columns used, making items move to the next row if overextending.
- Add new special character to TextEditor: thin non-breaking space
- Add primary and secondary label to likert
- Fix setting of background color of pages
- Fix shown position properties of elements created in static section
- Fix input field (text+area) validation inputs (to actually show :))
  - Also don't hide fields when unusable, but disable them. This way the UI should be less jumpy.
    This is a general philosophy for the editor from now on.
- Fix drop-list cursor when grabbing
- Fix save/read of images within text elements
- Fix button actions (was broken in several ways)
- Fix duplication issues with radio-group-images and drop-list within cloze
- Fix dynamic height of TextEditor dialog
- Fix empty line in cloze text (no longer destroys the element)
- Fix text field within cloze to have the same hover and focus styling as normal inputs
- Fix properties panel Delete and Duplicate buttons to not work with cloze sub-elements
- Improve several dialog layouts (mainly for labels and likert)
- Fix several missing translations

## 1.32.0
- Fix likert row generation
- Overhaul new element panel
  Some new icons and element reordering. Button is now called
  navigation button, because that is it's only purpose.
- Fix dropList element to read and register existing value IDs
- Disable autocomplete in TextEditor
  This 'fixes' issues with wrong formatted lists.
- Add more quoting characters to TextEditor special characters menu
- Fix spaces around sub and sup elements in cloze

## 1.31.1
- Fix drag and drop with images
- Fix drag and drop out of cloze children

## 1.31.0
- Add section copy&paste functionality
  Add 2 new menu buttons to the section menu.
  One simply copies the selected section to the clipboard.
  The other opens a dialog where a copied section can be pasted. The
  section element's IDs are checked for availability and a warning may be
  shown.
  This feature has one caveat: When pasting a section into one that already
  has elements in it, it will warn about duplicate IDs even though the IDs
  would be free again when the old section is replaced.
- Implement 'copy on drop' for dropLists
  With this setting elements are copied when being dropped to another list.
  On drop, it is now also checked if the item ID is already present in the
  target list. If it is, the drop event is silently discarded. This allows
  putting items back in the list without creating duplicate IDs.
  Lists with this setting:
  - do show a placeholder of the items being dragged. This way it is
  conveyed that the item will remain there after being dropped.
  - don't show a placeholder when foreign items are hovered over them, to
  avoid confusion with duplicate items.
- Add dynamic selection menu for connected drop lists
  This shows all available drop lists (including cloze children).
  This is pure QOL feature. Everything works the same as before, you just
  do not have to enter the target drop list ID manually.
- Rework new element panel
  No longer uses tabs but but a single column of grouped elements.
  The grouping is supposed to reflect logical meaning of elements for
  creating units instead of the system (ascending by technical
  complexity) used before.
  (This classification has been criticized heavily already and will probably
  change again in the future. It still is an improvement and will be used
  until better ideas are submitted.)
- Add tooltips to section menu
  This is supposed to help finding the right one, as there are quite a lot
  of buttons on there already. Also some icons are sub optimal.
  This whole panel needs a rework.
- Improve properties panel style and layout
  For example, add property groups (field sets) for some elements.
  The image control of buttons is has a fixed size, scales properly
  and show buttons only on hover.
  Addes tooltip to action parameter of dropdown: When having selected
  pageNav it shows a tooltip to get across that only valid pages can show up.
  Increase the panel width slightly (by 20px).
- Move dynamic width parameter of toggle buttons to dimension properties panel
- Fix Frame element not saving changed properties
- Fix line height property of cloze element
- Improve alignment of all cloze child elements
- Fix cloze element and section containing cloze elements duplication
  (IDs of children)
- Fix unclickable radio button label

## 1.30.0
- Improve aligmnent of elements within cloze
- Re-Add line-height property to radio button group
- Change default values for various fields
  - sections start in dynamic layout mode
  - default width of most elements to 180
  - cloze now uses default width
  - cloze line-height to 150
  - text element default paragraph margin to 0
  - drop list ion cloze context:
    background color to #f4f4f2; itemBackgroundColor to #c9e0e0
  - radio button group height to 100
  - radio button group margin-bottom to 40
  - text field dimensions to width: 180, height: 120
- Fix cloze text to not show sub- and superscript twice
- Fix (cloze element's) toggle button styling

## 1.29.0
- Extend likert rows to have text and/or an image
- Add switch likert row label to set the image postion relative to the text
- Rework software keyboard settings
  To enable the virtual software keyboard on mobile devices, the use of the
  read-only field is no longer required.
- Add input assistance and virtual software keyboard to spell-correct element
- Fix frame initialisation
- Fix section menu disappearing on short sections
  The solution is to always show the section menu of the selected section.
- Fix droplist item background color initialization

## 1.28.1
- Fix reading of old radio button group options

## 1.28.0
- Add rich text functionality for radio button group and likert
  When editing option items a reduced variant of the TextEditor is used.
- Add new property column count to text elements
- Add section menu element for new section parameter "activeAfterID"
- Implement subscript and superscript text formatting in cloze elements
- Show selected element type and ID on top of properties panel
- Keep selection on moved section
- Fix likert element
  There were several issues with this element. Now it should be possible again
  to change properties and show the line colouring.
- Fix toolbar to top of the TextEditor dialog
  This way it does not scroll out of view when editing very long texts.
- Show only number input for slider default value
  Was mistakenly showing an additional text area.
- Fix initial position parameters for dropdown, frame and drop list
- Fix alignment of toggle buttons in cloze element
- Fix styling issues with drop list
  Missing item color; half hidden outline etc.
- Add some missing translations

## 1.27.0
- Implement page navigation action for buttons
- Improve wording for page width setting and show actual resulting page width
- Add link variant to button
  This makes the button look like a text element.
- Add textfield option that restricts input to chars of the selected assistance
- Fix and Rework dynamic grid view
  Dynamically layouted sections with dynamic row and columns sizes no longer
  mistakenly show a predefined grid. (For a grid to be shown, info about either
  existing elements within or explicit column/row sizes is needed. So the
  dynamic grid can only be built after there are elements (with coordinates)
  within.)
  New elements no longer have initial grid coordinates and are therefore placed
  outside (i.e. under) the grid.
  Setting and manipulating element grid coordinates now has to be done mainly in
  the properties panel.
  The upside of this slight usability reduction is that it is now possible
  to see an appropriate representation of the layout as it will appear in the
  player.

  The grid coordinates have been simplified. Instead of defining the grid end
  column/row you can now directly enter the column/row span.

  Drag-and-Drop-Resizing of grid elements was bugged beyond redemption and is
  removed (for now).
- Fix text element's sub- and superscript to not implicitly increase line height
- Fix element selection to also select underlying section
- Make section menu only appear on selected sections
- Add option to show a software keyboard for text fields and text areas
  This is an intermediary solution for mobile devices where the system keyboard
  is not used. Note that setting this option does NOT automatically set the
  field to read-only, which would be necessary to prevent the system keyboard
  from appearing.

  There is an additional setting for showing french special characters on the
  keyboard as well. This is to remove the necessity of using the keyboard AND
  input assistance overlays. This might be extended to other character groups in
  the future.
- Fix text fields within cloze elements to support all properties normal
  text fields have, including input assistance and software keyboard.

## 1.26.1
- Fix styling issues with some elements in version 1.26.0

## 1.26.0
- Set the default language of the editor to German
- Add handling of empty and invalid unit definitions
  Show error but continue on with empty unit.
- Remove TextEditor window scaling (this makes unwanted scrollbars go away)
- Fix height of elements with dynamic positioning and fixed size
- Fix dimensions of image elements with dynamic positioning and fixed size

## 1.25.0
- Remove border of slider rectangle in number line mode at position 0
- Fix coloring of the slider rectangle in number line mode at position 0

## 1.24.0
- Show arrow for slider in number line mode
- Center the position of slider rectangle in number line mode
- Color the slider rectangle in number line mode also in position 0
- Add a Unicode font to display squares, bars, and dots

## 1.23.0
 - Fix setting of the default z-index for frames
 - Use dot instead of comma as thousands separator in number line
 - Rename option "Balken statt Kreis" of slider to "Zahlenstrahl-Modus"
 - Rename virtual keyboards for mathematics
 - Do not color the progress on the number line

## 1.22.0
- Rework cloze element
  No longer uses 'backslash-markers'. Instead inserts and renders
  elements directly. It is also able to read sub element properties,
  though some things like alignment and default values might not work.
  Also a lot of small improvements, like better sub element selection
  and support for all TextEditor features. There is a known visual
  issue with blockquotes though, where sub elements don't respect
  it's indentation.
  Also removed some useless properties from cloze child elements,
  like label.
  Cloze duplication now works.
- Cloze toggle-buttons now can have a manually set width and have a
  second optional vertical layout. The vertical layout is not very
  useful within a text but might come in handy in the future.
  The buttons on the element automatically stretch to meet the
  set width (or height).
- Fix file upload dialog appearing twice in Chrome
- Improve TextEditor layout
  Now widens to meet the set page width.
  All input controls are grouped in fieldsets.
- Make frame elements start with a z-index of -1
  Frames are supposedly used to group other elements and therefore
  need to be behind them.
- Slightly improve all menu elements to not close when clicking on them
- Fix sub- and superscript to not affect line height
- Disable font field
  Since we can't safely assume any other font than the one we ship is
  available, it is better to not allow changing this.
  The field is not removed completely as in the future more than one font
  might be available. So for now you just can't choose a different one.

## 1.21.0
- Fix multiselect of elements with array values (i.e. dropList)
  This includes correctly showing them and saving the changes properly
  so that other elements are not affected.
- Extend default width of some elements
  So the example text is completely visible.
  Affects: checkbox, text field, text area, dropdown
- Add default text to empty likert element
  This makes the element visible before content is defined.
- Fix cloze element to also save the actual HTML text
  This allows future versions to correctly restore the element

## 1.20.0
- Use shorter dash in TextEditor special chars
- Add top-99-double quote to TextEditor special chars
- Use font 'PT Sans' for blockquote quotes
- Set blockquote margins (top and bottom) to 20px
- Fix positioning values when duplicating elements
- Fix changing element IDs

## 1.19.0
- Implement fixedSize for all elements
- Add long dash to TextEditor special characters
- Remove border style 'hidden' from frame element
  This makes styling the element harder and the same can be achieved by
  setting the border width to 0.
- Add TextEditor button for toggle-button in cloze element
  And improve tooltips for the cloze buttons.
- Make dropLists always start with a min-height
  This makes the list not collapse when used in dynamic context.
- Fix element multiselection
 - Selecting multiple elements in dynamic mode no longer bugs out making
   further editing impossible.
 - Now correctly keeps the selection after moving multiple elements on
   the (static) canvas.
 - Fix element alignment
- Fix sizing property panel
 - Always show z-index
 - Only show alignment buttons in static mode
- Change color defaults:
  dropList elements: #c9e0e0
  dropList background: #f4f4f2
  dropList highlight: #006064
  likert line color: #c9e0e0

## 1.18.0
- Add image feature to TextEditor
  Images are always inline and scaled down to the font size (of the text
  element as a whole).
- Add blockquote feature to TextEditor
  This creates a special quote text, which is indented and has quote marks
  x2.5 the font size.
- Add new position property fixedSize ('Feste Abmessungen')
  This allows elements in dynamic sections to have fixed dimensions.
  (Some modifications to property panel logic, to show dimension fields and
  proper labels.)
  Only implemented for dropList and button elements!
- Add flex orientation for dropList
  This new setting makes child items space around in a row with line
  break.
  Images in vertical alignment now always reserve the whole row and don't
  appear next to each other.
- Allow negative values for z-index and margins
- Rework color inputs
  Use a suffix button to activate color picker instead of having an extra
  form field. This makes for a cleaner layout and also has the additional
  benefit of saving vertical space, reducing the need for scrolling.
  Also add direct input for likert line coloring color.
- Change/Fix radio button and checkbox color to dark green
  Affects all elements using radio buttons (likert, images...).
- Fix radio button without label
  Options still had a margin-top, when there is no label above.
  (Which produced the all-time favorite bug of unwanted scrollbars))
- Improve item duplication
  There are still some issues with duplication (and multiselect).
  Will be fixed soon™.

## 1.17.0
- Rework text field and text area styling
  The other variants are basically the same as filled. The only
  difference is the background color, which we are manipulating anyway.
  So there is no reason to keep them.
  The selected nackground color is now correctly applied to both
  remaining appearance variants.
- Add coloring options to toggle-button
  Now correctly sets the chosen background color and additionally sets
  another (configurable) color to the selected value
- Revert radio button color to default when not selected
- Add special character 'apostrophe' to TextEditor

## 1.16.0
- Fix text with background and font color
- Fix line-height property for radio button group
- Set default line height of 135 for likert and text
- Fix dropList values in player
- Allow indentation with individual sizes
- Move radio button label 1px (!) to the top
- Change radio button color to dark green
  For all elements using radio buttons.
- Fix missing translation for "Andere Optionen durchstreichen"
- Add section element list
  It is part of the section menu (appearing to the left of the hovered section)
  This allows to select elements without clicking them on the canvas, as
  elements may be obstructed or not visible for some reason.
  Also when an elements is selected it briefly gets z-index 100 so it is
  moved to the front and visible and manipulatable.
- New element for cloze: toggle-button
  This is a replacement for actual radio button groups. Will be extended
  with colors in the next release.

## 1.15.0
- New element frame ("Rahmen")
  (Tested and working for static layouts. Usage in dynamic layouts at one's
  own risk.)
- TextEditor: New functionality to create hanging indent
  It now also possible to set the indent size. It will be used for hanging
  and normal indents.
- Fix reading of droplist element IDs
  Should now correctly recognize already given (/read) IDs and refuse.
- Fix creating elements in empty (i.e. newly created) dropLists
- Improve property panel layout
  Delete and duplicate buttons are no longer part of the tab view. They are
  always visible below it.
- Fix min-height showing up before being checked
- Make text elements no longer start with a margin
- Fix image scaling for radio-image element
  Images are scaled down when needed. Small images do not scale up.
- Improve drop list item margins
  Horizontal orientation no longer has a wrong bottom-margin on the last
  element but elements now have a margin sideways (5px).
- Reduce unused space in textarea

## 1.14.0
- Fix reading of existing drop lists
- Fix reading of highlight properties of text elements
- New elements:
- Slider
- Spelling
- Text elements have a general font size again
  Specific parts of the text can still have a different font size
  applied to them.

## 1.13.0
- Remove underlinable option for text
- Offer a choice of colors for marking text
- Fix text element with background color and font color at the same time
- Add proper label to textarea and reduce vertical space around text
- Add 30px default bottom-margin to likert and radio
- Rework dropList items to have an ID and allow images references
  To use images a text option has to be created like before. The image
  can be set afterwards. When an option has both a text and an image, the
  text is ignored and the image is shown.
- Improve ID-Service to free up IDs when elements are deleted
- Improve cloze element all around - most importantly allowing to manually
 size sub-elements

## 1.12.0
- Add new element cloze ("Lückentext")
  Similar to a text element but parses the text on change and replaces
  markers with actual ui elements.
  The text is then displayed in line with the elements.
  Allowed markers are presented by buttons in the text editor but can
  also be entered manually. Implemented by now are "\i" for inputs
  and "\z" for drop Zones.
  It is now possible to select sub-elements (in addition to the parent cloze element)
  to alter element properties as usual.
  This element is still in development and contains functional and visual issues.
  Known issues:
  - To generate the text and elements you have to open the TextEditor at least once.
  - Elements are regenerated everytime the text is changed. This means they get a
    new ID and lose changed property values.
  - Text styling (like bold) does not continue after an inserted sub-element.
    To work around that, the style has to be applied separately to the text before
    and after inserted elements.
  - Changing dimension properties of sub-elements does not work.
- Add typographic quotes to TextEditor's special characters
- Fix radio button alignment
  Should now always correctly line up with the text on different line
  heights.
- Allow element deletion regardless of the selected section
  This has the additional benefit of allowing to delete multiple selected
  elements in different sections.
- Setting list style in TextEditor now also toggles the list (when not set)
- Setting list style in TextEditor applies the selected font size to the list counter
  It takes the selected font size, which is indepent of the font size of the items
  in the list. If you change the font size you may have to re-apply the font size
  to the list. This can be done by selecting the wanted style again.
- Changed default values:
 - font size: 20px
 - likert and text: line-height: 135px
 - likert and audio: width: 250px
 - page: margin: 30px
- Revert likert heading with images to not scale the images
- Improve visuals of radio-button-image elements
  Images are scaled again but behave a little better.
- Make min-height optional

## 1.11.0
- New DropList feature: highlightReceivingDropList ("Potentielle Ablagen hervorheben")
  When set eligible dropLists display a highlight effect. Currently with
  a colored border. The color is adjustable.
  This needs to be set on the target list, NOT on the list items are being
  dragged from.
- Refactor likert layout and add first column ratio property
  Images now scale depending on the available space.
  The new property controls the first (column) size parameter for the
  grid. The others are fixed at 1. Decimal values are allowed for
  fine-tuned control.
- Improve TextEditor toolbar layout and functionality
  Reordered the controls to make it look nicer. The sub menu no longer exists.
  Improve layouting to prevent elements from moving unexpextedly on different
  window sizes.
  Changed color and list inputs to split-buttons. Those combine a button
  with a dropdown allowing to specify the action of the button.
  For lists this does not actually toggle the list. The button needs to be used
  after setting the style. For colors the color is set immediately after using
  the dropdown/color picker.
  Now saves the set color and it can be applied to subsequent selections as well.
- Change dropList styling
  (Item margins and dropList border radius)
- Improved cursors everywhere
  Notice how the cursor changes to the grabbing hand on click before
  actually dragging canvas elements!
  The resizing preview in dynamic mode is no longer obstructed by the
  element itself. It is now hidden while resize-dragging.
  Color inputs now have the pointer cursor.
- Fix TestEditor (console) error when using the bullet-lists
- Fix likert column-edit dialog to set values on save
- Move some styling properties to the styling tab
  Applies to: borderRadius, itemBackgroundColor

## 1.10.0
- Fix reading of existing likert element row values
- Fix reading of existing dropList elements
  (This element was internally reworked and no longer has the 'options' property.
  To remain backwards compatible old 'option' lists are now correctly transformed to 'value' lists.)
- Fix textarea edit dialog to use multiline dialog
- Improve dialog sizing and styling

## 1.9.1
- Make text underlinable
- Fix marking of text

## 1.9.0
- Fix dropList element 'connectedTo' property renaming
- Implement 'readOnly' setting for dropList element
  This prevents reordering items.
- Add 5px margin between 'radio-group-image' images
- Improve dropList styling
  (background of draggable items, drop-preview, animations etc.)
- Add property 'itemBackgroundColor' to dropList
- Replace text element 'highlightable' with 'interaction' dropdown
  Multiple interaction themes are possible but mutually exclusive (for now).
  Player support will follow soon.
- Implement setting 'likert' preset value

## 1.8.1
- Add index indicator to option-list preset value
- Add alternative radio button group with images
  Automatically aligned horizontally with a vertical label on top.
  The label can contain text and/or an image. The label is clickable
  to select a value.
  Images are not scaled at all.
- Add small preview images to option list for radios with images
- Remove image scaling from likert
- Rename likert to 'Optionentabelle'
- Fix value of button actions to refer to unit instead of page
- Fix hidden autoStartDelay property
- Add magnifier properties to properties panel
- New element DropList ('Ablegeliste')
  This element has a list of strings as editable options. Those strings
  form draggable elements which may be reordered or moved between
  different DropList elements.
  To be able to move elements the DropLists need to be configured with
  the ID of the target DropList.
  There is an additional switch to allow only one item in a list.

## 1.7.2
- Add showRestRuns property to player-elements
- Fix (several problems with) likert element
  - Headings with Images should also work better now
- Fix radio-button-group label margin
  (Was accidentally removed in the last release)
- Fix editing properties of multiple selected elements
- Fix disappearing style properties when deleting the value

## 1.7.1
- Add radio-button-group property for strike-through of unselected options
- Allow setting 'first' and 'last' as button actions
- TextEditor: Add whitespace to special characters menu
  This allows multiple whitespaces after one another. Also keeps word groups
  from 'linebreaking'.
- [bug] TextEditor: Show empty paragraphs outside of the TextEditor
- Add extra field for manual background color selection
  Before it was not possible to switch back to transparent, since the color
  picker does not allow alpha channel settings. This also should make it easier
  to put the wanted color without having to navigate the picker.
  NOTE: The color picker does not recognize 'transparent' or any other color
  notation but hexadecimal. The preview is then always black.
- Make radio button and first line of the option text (in case there is a line
  break) appear at the same height
- Audio-/Video-Player: Use steps (of 1000) for timer fields
- Remove 'underlinable' property from text elements
  This feature will have to be reworked from scratch and will be re-introduced
  in a different form later.

## 1.7.0:
- [bug] Fix resize (drag and drop) in dynamic sections
- Replace element selection indicator from border to outline
  This makes element contents not move when selected.
- Allow deselection of elements
  Clicking anywhere (but the side panels) will deselect elements. This makes
  it easier to get an impression of how it will look like.
- Add 'line-height' property to all elements which have a font
- Add 'rows' property to text areas
- Change text property input to textarea
  This allows to properly enter longer default texts in text areas. (This is
  also active for text-field elements, where it makes little sense but makes
  it technically simpler to not differentiate).
- Fix lables on text fields
  Now correctly uses a proper label instead of a placeholder.
- Change text field appearance depending on label existence
  When the label text is empty the field will be rendered a lot smaller (and
  without any label obviously)
- Change font-size property to number field
- Improve radio-button-group styling
  Add 10px margin between label and options.
- Fix likert elements sizing
  This should make the selected background color cover the whole element instead
  of just the upper 100 pixels.
- Improve bold text style to be less bold and have letter spacing
- Add read-only property to all input elements and likert
- Allow changing the line-coloring color for likert elements
  (not to be mistaken for background color)
- Add 'underlinable' property to text elements
  This is to allow different purpose markers on text. Does NOT work in the
  aspect-player yet.

## 1.6.1:
- Allow styling of "Likert" element
- Set Roboto as app-wide font
- [bug] Fix selected page when deleting sections
- [bug] Fix duplicated section elements not getting new ID
- TextEditor: Improve list style
- TextEditor: Add more font sizes
- Improve radio button group style (margins)
- Allow editing text option properties (via overlay menu)

## 1.6.0:
- Add Likert-Element (looking for better name)
- Add Player-Element property controls

## 1.5.1:
- Fix reading of existing elements

## 1.5.0:
- Show scroll bars on element overflow
- Allow images for buttons
- Add border-radius setting to buttons
- [bug] Fix properties panel not always showing the appropriate inputs
  (especially when selecting multiple elements)
- Allow editing of option list for multiple (selected) elements IF they
  contain the same values
- Reduce delay of section menu hide-effect
- Add grid settings automatic sizing
- Improve deleting elements via Delete key
- Add Input Assistance property to input elements
  This can be activated by selecting one of the presets, which are mutually
  exclusive for now.
- Add "clearable" property to text field element
  When set, a button at the end of the field appears which allows deleting the
  field's content.
- Add "position" property to "always-visible" pages
- [bug] Fix option elements saving value index instead of actual option string
  This allows duplicate (or empty) options.
- Fix TextEditor indent setting to persist when re-opening text element
- Improve TextEditor margin logic
  Default margin of paragraphs is 0px. It can now read existing margin
  settings.
- Make all elements non-interactable. Only the overlay can be moved and resized.

## 1.4.0
- New Text-Editor (based on TipTap/ProseMirror)

## 1.3.1
- Fix background color of input fields
- Remove font size property from text elements
- Add 16px as font size option
- Textfield and Textarea have transparent background by default

## 1.3.0
- Use Roboto as default font
- [bug] Fix selection after adding/deleting pages/sections
- [bug] Fix deselection of maximum page width. Default design page width is always 900px.
- [bug] Fix reset default value (to undefined) for dropdown and radio button group
- Improve section highlighting
- Make enter key add options to option list of dropdown and radio button group
- [bug] Allow dragging of the whole button instead of just the text (in element toolbox)
- Allow section duplication
- Add new button properties for navigation actions
- [bug] Fix properties panel showing wrong properties when selecting multiple elements
