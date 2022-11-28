Player
======

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

### Verbesserungen
- Verbessert die Performanz von GeoGebra-Elementen
- Ändert die Metadaten entsprechend der Verona Inferfaces Specification
- Zeigt Ladeanimationen während des Ladens von GeoGebra-, Video- und Audioelementen

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