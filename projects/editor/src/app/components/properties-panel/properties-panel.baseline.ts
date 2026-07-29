/**
 * Generated baseline for `properties-panel.characterization.spec.ts` — one entry per
 * (element type, expert mode, selection), holding the controls the panel renders as readable text.
 *
 * The `multi-` entries describe a selection of two elements of the same type whose booleans all
 * disagree. Every such property merges to null, which the panel renders as an unchecked box.
 *
 * Do NOT hand-edit to make a failing test pass. A diff here means the panel now shows something
 * different; either that change is intended — then regenerate and review the diff as part of the
 * change — or it is a regression.
 *
 * Regenerate: see the doc comment on the `baseline regeneration` group in the spec.
 */
/* eslint-disable max-len */
export const PANEL_BASELINE: Record<string, string> = {
  'audio|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = audio
text "originalFileName" = unknown
button "upload_file"
button "Medienoptionen anpassen"
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 90

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'audio|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
button "Medienoptionen anpassen"
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 90
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'audio|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'audio|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = audio
text "originalFileName" = unknown
button "upload_file"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'button|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = button
textarea "propertiesPanel.label" = Knopf
[propertiesPanel.presentation]
button "propertiesPanel.button"
button "propertiesPanel.image"
button "propertiesPanel.link"
checkbox "propertiesPanel.super" = false
checkbox "propertiesPanel.sub" = false
[propertiesPanel.tooltip]
button "propertiesPanel.editTooltip"
[propertiesPanel.action]
select "propertiesPanel.action" = <null>
select "propertiesPanel.actionParam" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 60

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = lightgrey
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 0

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'button|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
textarea "propertiesPanel.label" = Knopf
[propertiesPanel.presentation]
button "propertiesPanel.button"
button "propertiesPanel.image"
button "propertiesPanel.link"
checkbox "propertiesPanel.super" = false
checkbox "propertiesPanel.sub" = false
[propertiesPanel.tooltip]
button "propertiesPanel.editTooltip"
[propertiesPanel.action]
select "propertiesPanel.action" = <null>
select "propertiesPanel.actionParam" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 60
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = lightgrey
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 0

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'button|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
textarea "propertiesPanel.label" = Knopf
[propertiesPanel.presentation]
button "propertiesPanel.button"
button "propertiesPanel.image"
button "propertiesPanel.link"
checkbox "propertiesPanel.super" = false
checkbox "propertiesPanel.sub" = false
[propertiesPanel.tooltip]
button "propertiesPanel.editTooltip"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'button|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = button
textarea "propertiesPanel.label" = Knopf
[propertiesPanel.presentation]
button "propertiesPanel.button"
button "propertiesPanel.image"
button "propertiesPanel.link"
checkbox "propertiesPanel.super" = false
checkbox "propertiesPanel.sub" = false
[propertiesPanel.tooltip]
button "propertiesPanel.editTooltip"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'checkbox|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = checkbox
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
button "image"
toggle-group [propertiesPanel.true, propertiesPanel.false]
checkbox "propertiesPanel.crossOutChecked" = false
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 215
input[number] "propertiesPanel.height" = 60

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'checkbox|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
button "image"
toggle-group [propertiesPanel.true, propertiesPanel.false]
checkbox "propertiesPanel.crossOutChecked" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 215
input[number] "propertiesPanel.height" = 60
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'checkbox|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = indeterminate
button "image"
toggle-group [propertiesPanel.true, propertiesPanel.false]
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'checkbox|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = checkbox
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = false
button "image"
toggle-group [propertiesPanel.true, propertiesPanel.false]
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'cloze|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = cloze
button "Text und Elemente editieren"
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 200

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 180
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'cloze|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
button "Text und Elemente editieren"
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 200
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 180
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'cloze|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
button "Text und Elemente editieren"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'cloze|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = cloze
button "Text und Elemente editieren"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'drop-list|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = drop-list
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
[preset]
textarea "Neue Option" = 
select "propertiesPanel.connectedDropLists" = []
select "propertiesPanel.alignment" = vertical
checkbox "propertiesPanel.isSortList" = false
checkbox "propertiesPanel.onlyOneItem" = false
checkbox "allowReplacement" = false
checkbox "propertiesPanel.copyOnDrop" = false
checkbox "propertiesPanel.permanentPlaceholders" = false
checkbox "propertiesPanel.permanentPlaceholdersCC" = false (disabled)
checkbox "propertiesPanel.showNumbering" = false
checkbox "propertiesPanel.startNumberingAtZero" = false (disabled)
checkbox "propertiesPanel.highlightReceivingDropList" = false
input[text] "propertiesPanel.highlightReceivingDropListColor" = #006064 (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 240
input[number] "propertiesPanel.height" = 100

--- tab "styling" ---
input[text] "propertiesPanel.itemBackgroundColor" = #c9e0e0
input[text] "propertiesPanel.backgroundColor" = #ededed
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'drop-list|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
[preset]
textarea "Neue Option" = 
select "propertiesPanel.connectedDropLists" = []
select "propertiesPanel.alignment" = vertical
checkbox "propertiesPanel.isSortList" = indeterminate
checkbox "propertiesPanel.onlyOneItem" = indeterminate
checkbox "allowReplacement" = indeterminate
checkbox "propertiesPanel.copyOnDrop" = indeterminate
checkbox "propertiesPanel.permanentPlaceholders" = indeterminate
checkbox "propertiesPanel.permanentPlaceholdersCC" = indeterminate (disabled)
checkbox "propertiesPanel.showNumbering" = indeterminate
checkbox "propertiesPanel.startNumberingAtZero" = indeterminate (disabled)
checkbox "propertiesPanel.highlightReceivingDropList" = indeterminate
input[text] "propertiesPanel.highlightReceivingDropListColor" = #006064 (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 240
input[number] "propertiesPanel.height" = 100
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.itemBackgroundColor" = #c9e0e0
input[text] "propertiesPanel.backgroundColor" = #ededed
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'drop-list|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = indeterminate
[preset]
textarea "Neue Option" = 
select "propertiesPanel.connectedDropLists" = []
select "propertiesPanel.alignment" = vertical
checkbox "propertiesPanel.isWidthFixed" = indeterminate
input[number] "propertiesPanel.width" = 240 (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'drop-list|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = drop-list
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = false
[preset]
textarea "Neue Option" = 
select "propertiesPanel.connectedDropLists" = []
select "propertiesPanel.alignment" = vertical
checkbox "propertiesPanel.isWidthFixed" = false
input[number] "propertiesPanel.width" = 240 (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'dropdown|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = dropdown
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "propertiesPanel.allowUnset" = false
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 240
input[number] "propertiesPanel.height" = 83

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'dropdown|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "propertiesPanel.allowUnset" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 240
input[number] "propertiesPanel.height" = 83
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'dropdown|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "propertiesPanel.allowUnset" = indeterminate
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'dropdown|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = dropdown
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "propertiesPanel.allowUnset" = false
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'frame|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = frame
checkbox "propertiesPanel.hasBorderTop" = true
checkbox "propertiesPanel.hasBorderBottom" = true
checkbox "propertiesPanel.hasBorderLeft" = true
checkbox "propertiesPanel.hasBorderRight" = true
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = -1
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 180

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 1

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'frame|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
checkbox "propertiesPanel.hasBorderTop" = indeterminate
checkbox "propertiesPanel.hasBorderBottom" = indeterminate
checkbox "propertiesPanel.hasBorderLeft" = indeterminate
checkbox "propertiesPanel.hasBorderRight" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = -1
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 180
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 1

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'frame|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
checkbox "propertiesPanel.hasBorderTop" = indeterminate
checkbox "propertiesPanel.hasBorderBottom" = indeterminate
checkbox "propertiesPanel.hasBorderLeft" = indeterminate
checkbox "propertiesPanel.hasBorderRight" = indeterminate
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'frame|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = frame
checkbox "propertiesPanel.hasBorderTop" = true
checkbox "propertiesPanel.hasBorderBottom" = true
checkbox "propertiesPanel.hasBorderLeft" = true
checkbox "propertiesPanel.hasBorderRight" = true
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'geometry|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = geometry
text "originalFileName" = unknown
input[text] "propertiesPanel.appDefinition" =  (disabled)
checkbox "propertiesPanel.showResetIcon" = true
[propertiesPanel.geogebraHeader]
checkbox "propertiesPanel.enableUndoRedo" = true
checkbox "propertiesPanel.enableShiftDragZoom" = false
checkbox "propertiesPanel.showZoomButtons" = false
checkbox "propertiesPanel.showFullscreenButton" = false
checkbox "propertiesPanel.showToolbar" = true
input[text] "propertiesPanel.customToolbar" = 
[propertiesPanel.trackedGeogebraVariables]
select "propertiesPanel.trackedVariables" = []
input[text] "propertiesPanel.trackedExpectedVariables" = 
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 600
input[number] "propertiesPanel.height" = 400

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'geometry|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
input[text] "propertiesPanel.appDefinition" =  (disabled)
checkbox "propertiesPanel.showResetIcon" = indeterminate
[propertiesPanel.geogebraHeader]
checkbox "propertiesPanel.enableUndoRedo" = indeterminate
checkbox "propertiesPanel.enableShiftDragZoom" = indeterminate
checkbox "propertiesPanel.showZoomButtons" = indeterminate
checkbox "propertiesPanel.showFullscreenButton" = indeterminate
checkbox "propertiesPanel.showToolbar" = indeterminate
input[text] "propertiesPanel.customToolbar" =  (disabled)
[propertiesPanel.trackedGeogebraVariables]
select "propertiesPanel.trackedVariables" = []
input[text] "propertiesPanel.trackedExpectedVariables" = 
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 600
input[number] "propertiesPanel.height" = 400
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'geometry|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
input[text] "propertiesPanel.appDefinition" =  (disabled)
[propertiesPanel.geogebraHeader]
[propertiesPanel.trackedGeogebraVariables]
select "propertiesPanel.trackedVariables" = []
input[text] "propertiesPanel.trackedExpectedVariables" = 
input[number] "propertiesPanel.width" = 600
input[number] "propertiesPanel.height" = 400
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'geometry|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = geometry
text "originalFileName" = unknown
input[text] "propertiesPanel.appDefinition" =  (disabled)
[propertiesPanel.geogebraHeader]
[propertiesPanel.trackedGeogebraVariables]
select "propertiesPanel.trackedVariables" = []
input[text] "propertiesPanel.trackedExpectedVariables" = 
input[number] "propertiesPanel.width" = 600
input[number] "propertiesPanel.height" = 400
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'hotspot-image|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = hotspot-image
text "originalFileName" = unknown
button "upload_file"
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
[propertiesPanel.hotspots]
button "add"
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 100

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'hotspot-image|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
[propertiesPanel.hotspots]
button "add"
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 100
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'hotspot-image|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
[propertiesPanel.hotspots]
button "add"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'hotspot-image|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = hotspot-image
text "originalFileName" = unknown
button "upload_file"
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
[propertiesPanel.hotspots]
button "add"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'image|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = image
text "originalFileName" = unknown
button "upload_file"
input[text] "Alternativtext" = Bild nicht gefunden
button "Medienoptionen anpassen"
checkbox "propertiesPanel.scale" = false
checkbox "propertiesPanel.magnifier" = false
checkbox "propertiesPanel.allowFullscreen" = false
input[number] "propertiesPanel.magnifierSize in px" = 100 (disabled)
slider ""
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 100

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'image|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
input[text] "Alternativtext" = Bild nicht gefunden
button "Medienoptionen anpassen"
checkbox "propertiesPanel.scale" = indeterminate
checkbox "propertiesPanel.magnifier" = indeterminate
checkbox "propertiesPanel.allowFullscreen" = indeterminate
input[number] "propertiesPanel.magnifierSize in px" = 100 (disabled)
slider ""
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 100
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'image|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'image|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = image
text "originalFileName" = unknown
button "upload_file"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'likert-row|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = likert-row
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 50

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'likert-row|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 50
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'likert-row|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'likert-row|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = likert-row
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'likert|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = likert
textarea "propertiesPanel.label" = Optionentabelle Beschriftung
textarea "propertiesPanel.label2" = Beschriftung Erste Spalte
[propertiesPanel.options]
textarea "Neue Option" = 
[rows]
textarea "Neue Zeile" = 
checkbox "propertiesPanel.stickyHeader" = false
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 200

--- tab "styling" ---
checkbox "propertiesPanel.lineColoring" = true
input[text] "propertiesPanel.lineColoringColor" = #c9e0e0
checkbox "propertiesPanel.firstLineColoring" = false
input[text] "propertiesPanel.firstLineColoringColor" = #c7f3d0 (disabled)
input[text] "propertiesPanel.backgroundColor" = white
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'likert|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
textarea "propertiesPanel.label" = Optionentabelle Beschriftung
textarea "propertiesPanel.label2" = Beschriftung Erste Spalte
[propertiesPanel.options]
textarea "Neue Option" = 
[rows]
textarea "Neue Zeile" = 
checkbox "propertiesPanel.stickyHeader" = indeterminate
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 200
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
checkbox "propertiesPanel.lineColoring" = indeterminate
input[text] "propertiesPanel.lineColoringColor" = #c9e0e0 (disabled)
checkbox "propertiesPanel.firstLineColoring" = indeterminate
input[text] "propertiesPanel.firstLineColoringColor" = #c7f3d0 (disabled)
input[text] "propertiesPanel.backgroundColor" = white
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'likert|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
textarea "propertiesPanel.label" = Optionentabelle Beschriftung
textarea "propertiesPanel.label2" = Beschriftung Erste Spalte
[propertiesPanel.options]
textarea "Neue Option" = 
[rows]
textarea "Neue Zeile" = 
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'likert|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = likert
textarea "propertiesPanel.label" = Optionentabelle Beschriftung
textarea "propertiesPanel.label2" = Beschriftung Erste Spalte
[propertiesPanel.options]
textarea "Neue Option" = 
[rows]
textarea "Neue Zeile" = 
input[number] "propertiesPanel.firstColumnSizeRatio" = 5
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'marking-panel|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = marking-panel
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = true
checkbox "propertiesPanel.highlightableTurquoise" = false
checkbox "propertiesPanel.highlightableOrange" = false
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 98

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'marking-panel|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = indeterminate
checkbox "propertiesPanel.highlightableTurquoise" = indeterminate
checkbox "propertiesPanel.highlightableOrange" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 98
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'marking-panel|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = indeterminate
checkbox "propertiesPanel.highlightableTurquoise" = indeterminate
checkbox "propertiesPanel.highlightableOrange" = indeterminate
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'marking-panel|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = marking-panel
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = true
checkbox "propertiesPanel.highlightableTurquoise" = false
checkbox "propertiesPanel.highlightableOrange" = false
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'math-field|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = math-field
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
button "code"
checkbox "propertiesPanel.enableModeSwitch" = false
select "formulaPreset.title" = [math, symbols, latin, greek]
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 80

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'math-field|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
button "code"
checkbox "propertiesPanel.enableModeSwitch" = indeterminate
select "formulaPreset.title" = [math, symbols, latin, greek]
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 80
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'math-field|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
button "code"
checkbox "propertiesPanel.enableModeSwitch" = indeterminate
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'math-field|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = math-field
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
button "code"
checkbox "propertiesPanel.enableModeSwitch" = false
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'math-table|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = math-table
select "Operation" = addition
input[text] "Term" = 123
button "clear"
input[text] "Term" = 456
button "clear"
button "add addTermRow"
input[text] "resultHelperRow" = 
input[text] "resultRow" = 
button "Variables Layout anpassen" (disabled)
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = false
checkbox "propertiesPanel.hideNativeKeyboard" = false (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = false (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 192

--- tab "styling" ---
input[text] "propertiesPanel.helperRowColor" = transparent
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'math-table|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
select "Operation" = addition
input[text] "Term" = 123
button "clear"
input[text] "Term" = 456
button "clear"
button "add addTermRow"
input[text] "resultHelperRow" = 
input[text] "resultRow" = 
button "Variables Layout anpassen" (disabled)
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = indeterminate
checkbox "propertiesPanel.hideNativeKeyboard" = indeterminate (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = indeterminate (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 192
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.helperRowColor" = transparent
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'math-table|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
input[text] "Term" = 123
button "clear"
input[text] "Term" = 456
button "clear"
button "add addTermRow"
input[text] "resultHelperRow" = 
input[text] "resultRow" = 
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'math-table|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = math-table
input[text] "Term" = 123
button "clear"
input[text] "Term" = 456
button "clear"
button "add addTermRow"
input[text] "resultHelperRow" = 
input[text] "resultRow" = 
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'radio-group-images|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = radio-group-images
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "limitItemPerRow" = false
input[number] "itemsPerRow" =  (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 200

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'radio-group-images|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "limitItemPerRow" = false
input[number] "itemsPerRow" =  (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 200
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'radio-group-images|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = indeterminate
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "limitItemPerRow" = false
input[number] "itemsPerRow" =  (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'radio-group-images|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = radio-group-images
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = false
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
checkbox "limitItemPerRow" = false
input[number] "itemsPerRow" =  (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'radio|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = radio
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
select "propertiesPanel.alignment" = column
checkbox "propertiesPanel.strikeOtherOptions" = false
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 215
input[number] "propertiesPanel.height" = 80

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 100
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'radio|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
select "propertiesPanel.alignment" = column
checkbox "propertiesPanel.strikeOtherOptions" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 215
input[number] "propertiesPanel.height" = 80
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 100
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'radio|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = indeterminate
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
select "propertiesPanel.alignment" = column
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'radio|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = radio
[Eingabeelement]
textarea "propertiesPanel.label" = Beschriftung
checkbox "propertiesPanel.readOnly" = false
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
select "propertiesPanel.alignment" = column
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'slider|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = slider
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[number] "propertiesPanel.minValue" = 0
input[number] "propertiesPanel.maxValue" = 100
checkbox "propertiesPanel.showValues" = true
checkbox "propertiesPanel.barStyle" = true
checkbox "propertiesPanel.thumbLabel" = true
input[number] "propertiesPanel.preset" = 
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 240
input[number] "propertiesPanel.height" = 80

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 5
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'slider|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[number] "propertiesPanel.minValue" = 0
input[number] "propertiesPanel.maxValue" = 100
checkbox "propertiesPanel.showValues" = indeterminate
checkbox "propertiesPanel.barStyle" = true
checkbox "propertiesPanel.thumbLabel" = true
input[number] "propertiesPanel.preset" = 
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 240
input[number] "propertiesPanel.height" = 80
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 5
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'slider|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
input[number] "propertiesPanel.minValue" = 0
input[number] "propertiesPanel.maxValue" = 100
input[number] "propertiesPanel.preset" = 
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'slider|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = slider
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
input[number] "propertiesPanel.minValue" = 0
input[number] "propertiesPanel.maxValue" = 100
input[number] "propertiesPanel.preset" = 
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'spell-correct|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = spell-correct
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = false
checkbox "propertiesPanel.hideNativeKeyboard" = false (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = false (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 80

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'spell-correct|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = indeterminate
checkbox "propertiesPanel.hideNativeKeyboard" = indeterminate (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = indeterminate (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 80
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'spell-correct|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'spell-correct|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = spell-correct
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'table|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = table
button "Elemente anpassen"
[section-menu.rows]
input[number] "section-menu.rowCount" = 2
input[number] "section-menu.height 1" = 1
select "Einheit" = fr
input[number] "section-menu.height 2" = 1
select "Einheit" = fr
[section-menu.columns]
input[number] "section-menu.columnCount" = 2
input[number] "section-menu.width 1" = 1
select "Einheit" = fr
input[number] "section-menu.width 2" = 1
select "Einheit" = fr
checkbox "Tabellenränder zeichnen" = false
checkbox "propertiesPanel.tableHeaderEnabled" = false
checkbox "propertiesPanel.stickyHeader" = false (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 200

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 1

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'table|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
button "Elemente anpassen"
[section-menu.rows]
input[number] "section-menu.rowCount" = 2
input[number] "section-menu.height 1" = 1
select "Einheit" = fr
input[number] "section-menu.height 2" = 1
select "Einheit" = fr
[section-menu.columns]
input[number] "section-menu.columnCount" = 2
input[number] "section-menu.width 1" = 1
select "Einheit" = fr
input[number] "section-menu.width 2" = 1
select "Einheit" = fr
checkbox "Tabellenränder zeichnen" = indeterminate
checkbox "propertiesPanel.tableHeaderEnabled" = indeterminate
checkbox "propertiesPanel.stickyHeader" = indeterminate (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 250
input[number] "propertiesPanel.height" = 200
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 1

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'table|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
button "Elemente anpassen"
[section-menu.rows]
input[number] "section-menu.rowCount" = 2
input[number] "section-menu.height 1" = 1
select "Einheit" = fr
input[number] "section-menu.height 2" = 1
select "Einheit" = fr
[section-menu.columns]
input[number] "section-menu.columnCount" = 2
input[number] "section-menu.width 1" = 1
select "Einheit" = fr
input[number] "section-menu.width 2" = 1
select "Einheit" = fr
checkbox "Tabellenränder zeichnen" = indeterminate
checkbox "propertiesPanel.tableHeaderEnabled" = indeterminate
checkbox "propertiesPanel.stickyHeader" = indeterminate (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'table|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = table
button "Elemente anpassen"
[section-menu.rows]
input[number] "section-menu.rowCount" = 2
input[number] "section-menu.height 1" = 1
select "Einheit" = fr
input[number] "section-menu.height 2" = 1
select "Einheit" = fr
[section-menu.columns]
input[number] "section-menu.columnCount" = 2
input[number] "section-menu.width 1" = 1
select "Einheit" = fr
input[number] "section-menu.width 2" = 1
select "Einheit" = fr
checkbox "Tabellenränder zeichnen" = false
checkbox "propertiesPanel.tableHeaderEnabled" = false
checkbox "propertiesPanel.stickyHeader" = false (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-area-math|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-area-math
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
checkbox "propertiesPanel.hasAutoHeight" = false
input[number] "rows" = 2
select "formulaPreset.title" = [math, symbols, latin, greek]
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = false
checkbox "propertiesPanel.hideNativeKeyboard" = false (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = false (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 132

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'text-area-math|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
checkbox "propertiesPanel.hasAutoHeight" = indeterminate
input[number] "rows" = 2
select "formulaPreset.title" = [math, symbols, latin, greek]
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = indeterminate
checkbox "propertiesPanel.hideNativeKeyboard" = indeterminate (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = indeterminate (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 132
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'text-area-math|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
input[number] "rows" = 2
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-area-math|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-area-math
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
input[number] "rows" = 2
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-area|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-area
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
textarea "preset" = 
checkbox "propertiesPanel.resizeEnabled" = false
checkbox "propertiesPanel.hasAutoHeight" = false (disabled)
checkbox "propertiesPanel.hasDynamicRowCount" = true
input[number] "propertiesPanel.expectedCharactersCount" = 135
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
select "propertiesPanel.appearance" = outline
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = false
checkbox "propertiesPanel.hideNativeKeyboard" = false (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = false (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 132

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'text-area|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
textarea "preset" = 
checkbox "propertiesPanel.resizeEnabled" = indeterminate
checkbox "propertiesPanel.hasAutoHeight" = indeterminate
checkbox "propertiesPanel.hasDynamicRowCount" = indeterminate
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
select "propertiesPanel.appearance" = outline
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = indeterminate
checkbox "propertiesPanel.hideNativeKeyboard" = indeterminate (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = indeterminate (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 230
input[number] "propertiesPanel.height" = 132
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'text-area|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
textarea "preset" = 
checkbox "propertiesPanel.hasDynamicRowCount" = indeterminate
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-area|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-area
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
textarea "preset" = 
checkbox "propertiesPanel.hasDynamicRowCount" = true
input[number] "propertiesPanel.expectedCharactersCount" = 135
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-field-simple|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-field-simple
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
input[number] "propertiesPanel.minLength" = 
input[text] "propertiesPanel.minLengthWarnMessage" = Eingabe zu kurz (disabled)
input[number] "propertiesPanel.maxLength" = 
checkbox "propertiesPanel.isLimitedToMaxLength" = true (disabled)
input[text] "propertiesPanel.maxLengthWarnMessage" = Eingabe zu lang (disabled)
input[text] "propertiesPanel.pattern" = 
input[text] "propertiesPanel.patternWarnMessage" = Eingabe entspricht nicht der Vorgabe (disabled)
checkbox "propertiesPanel.clearable" = false
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = false
checkbox "propertiesPanel.hideNativeKeyboard" = false (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = false (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 100
input[number] "propertiesPanel.height" = 30

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'text-field-simple|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
input[number] "propertiesPanel.minLength" = 
input[text] "propertiesPanel.minLengthWarnMessage" = Eingabe zu kurz (disabled)
input[number] "propertiesPanel.maxLength" = 
checkbox "propertiesPanel.isLimitedToMaxLength" = indeterminate (disabled)
input[text] "propertiesPanel.maxLengthWarnMessage" = Eingabe zu lang (disabled)
input[text] "propertiesPanel.pattern" = 
input[text] "propertiesPanel.patternWarnMessage" = Eingabe entspricht nicht der Vorgabe (disabled)
checkbox "propertiesPanel.clearable" = indeterminate
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = indeterminate
checkbox "propertiesPanel.hideNativeKeyboard" = indeterminate (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = indeterminate (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 100
input[number] "propertiesPanel.height" = 30
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'text-field-simple|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = indeterminate
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
checkbox "propertiesPanel.isWidthFixed" = indeterminate
input[number] "propertiesPanel.width" = 100 (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-field-simple|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-field-simple
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = false
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
checkbox "propertiesPanel.isWidthFixed" = false
input[number] "propertiesPanel.width" = 100 (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-field|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-field
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
select "propertiesPanel.appearance" = outline
input[number] "propertiesPanel.minLength" = 
input[text] "propertiesPanel.minLengthWarnMessage" = Eingabe zu kurz (disabled)
input[number] "propertiesPanel.maxLength" = 
checkbox "propertiesPanel.isLimitedToMaxLength" = true (disabled)
input[text] "propertiesPanel.maxLengthWarnMessage" = Eingabe zu lang (disabled)
input[text] "propertiesPanel.pattern" = 
input[text] "propertiesPanel.patternWarnMessage" = Eingabe entspricht nicht der Vorgabe (disabled)
checkbox "propertiesPanel.clearable" = false
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = false
checkbox "propertiesPanel.hideNativeKeyboard" = false (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = false (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 120

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'text-field|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
select "propertiesPanel.appearance" = outline
input[number] "propertiesPanel.minLength" = 
input[text] "propertiesPanel.minLengthWarnMessage" = Eingabe zu kurz (disabled)
input[number] "propertiesPanel.maxLength" = 
checkbox "propertiesPanel.isLimitedToMaxLength" = indeterminate (disabled)
input[text] "propertiesPanel.maxLengthWarnMessage" = Eingabe zu lang (disabled)
input[text] "propertiesPanel.pattern" = 
input[text] "propertiesPanel.patternWarnMessage" = Eingabe entspricht nicht der Vorgabe (disabled)
checkbox "propertiesPanel.clearable" = indeterminate
[Tastatur]
checkbox "propertiesPanel.showSoftwareKeyboard" = indeterminate
checkbox "propertiesPanel.hideNativeKeyboard" = indeterminate (disabled)
checkbox "propertiesPanel.addInputAssistanceToKeyboard" = indeterminate (disabled)
[Eingabehilfe]
select "propertiesPanel.inputAssistance" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 120
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'text-field|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = indeterminate
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text-field|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text-field
[Eingabeelement]
textarea "propertiesPanel.label" = 
checkbox "propertiesPanel.readOnly" = false
input[text] "preset" = 
[propertiesPanel.textAlign]
toggle-group [format_align_left, format_align_center, format_align_right]
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text
button "edit"
input[number] "propertiesPanel.columnCount" = 1
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = false
checkbox "propertiesPanel.highlightableTurquoise" = false
checkbox "propertiesPanel.highlightableOrange" = false
select "propertiesPanel.markingPanels" = []
select "propertiesPanel.markingMode" = selection
checkbox "propertiesPanel.hasSelectionPopup" = false (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 98

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'text|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
button "edit"
input[number] "propertiesPanel.columnCount" = 1
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = indeterminate
checkbox "propertiesPanel.highlightableTurquoise" = indeterminate
checkbox "propertiesPanel.highlightableOrange" = indeterminate
select "propertiesPanel.markingPanels" = []
select "propertiesPanel.markingMode" = selection
checkbox "propertiesPanel.hasSelectionPopup" = indeterminate (disabled)
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 98
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 135
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'text|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
button "edit"
input[number] "propertiesPanel.columnCount" = 1
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = indeterminate
checkbox "propertiesPanel.highlightableTurquoise" = indeterminate
checkbox "propertiesPanel.highlightableOrange" = indeterminate
select "propertiesPanel.markingPanels" = []
select "propertiesPanel.markingMode" = selection
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'text|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = text
button "edit"
input[number] "propertiesPanel.columnCount" = 1
[propertiesPanel.marking]
checkbox "propertiesPanel.highlightableYellow" = false
checkbox "propertiesPanel.highlightableTurquoise" = false
checkbox "propertiesPanel.highlightableOrange" = false
select "propertiesPanel.markingPanels" = []
select "propertiesPanel.markingMode" = selection
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'toggle-button|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = toggle-button
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = false
checkbox "propertiesPanel.requiredField" = false
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
button "build"
button "clear"
button "build"
button "clear"
checkbox "propertiesPanel.strikeOtherOptions" = false
checkbox "propertiesPanel.strikeSelectedOption" = false
checkbox "propertiesPanel.verticalOrientation" = false
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 30

--- tab "styling" ---
input[text] "propertiesPanel.selectionColor" = #c9e0e0
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 100
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'toggle-button|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = indeterminate
checkbox "propertiesPanel.requiredField" = indeterminate
input[text] "propertiesPanel.requiredWarnMessage" = Eingabe erforderlich (disabled)
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
button "build"
button "clear"
button "build"
button "clear"
checkbox "propertiesPanel.strikeOtherOptions" = indeterminate
checkbox "propertiesPanel.strikeSelectedOption" = indeterminate
checkbox "propertiesPanel.verticalOrientation" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 30
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.selectionColor" = #c9e0e0
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
input[number] "propertiesPanel.lineHeight" = 100
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'toggle-button|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = indeterminate
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
button "build"
button "clear"
button "build"
button "clear"
checkbox "propertiesPanel.strikeSelectedOption" = indeterminate
checkbox "propertiesPanel.verticalOrientation" = indeterminate
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'toggle-button|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = toggle-button
[Eingabeelement]
checkbox "propertiesPanel.readOnly" = false
select "preset" = <null>
[propertiesPanel.options]
textarea "Neue Option" = 
button "build"
button "clear"
button "build"
button "clear"
checkbox "propertiesPanel.strikeSelectedOption" = false
checkbox "propertiesPanel.verticalOrientation" = false
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'trigger|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = trigger
[propertiesPanel.action]
select "propertiesPanel.action" = <null>
select "propertiesPanel.actionParam" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'trigger|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[propertiesPanel.action]
select "propertiesPanel.action" = <null>
select "propertiesPanel.actionParam" = <null>
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = transparent
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'trigger|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'trigger|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = trigger
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'video|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = video
text "originalFileName" = unknown
button "upload_file"
button "Medienoptionen anpassen"
checkbox "propertiesPanel.scale" = false
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 280
input[number] "propertiesPanel.height" = 230

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'video|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
button "Medienoptionen anpassen"
checkbox "propertiesPanel.scale" = indeterminate
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 280
input[number] "propertiesPanel.height" = 230
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #000000
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'video|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
text "originalFileName" = unknown
button "upload_file"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'video|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = video
text "originalFileName" = unknown
button "upload_file"
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'widget-molecule-editor|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = widget-molecule-editor
[toolbox.widget-molecule-editor]
select "propertiesPanel.bondingType" = VALENCE
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 60

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #006064
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 0

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'widget-molecule-editor|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[toolbox.widget-molecule-editor]
select "propertiesPanel.bondingType" = VALENCE
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 60
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #006064
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 0

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'widget-molecule-editor|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[toolbox.widget-molecule-editor]
select "propertiesPanel.bondingType" = VALENCE
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'widget-molecule-editor|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = widget-molecule-editor
[toolbox.widget-molecule-editor]
select "propertiesPanel.bondingType" = VALENCE
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'widget-periodic-table|expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = widget-periodic-table
[toolbox.widget-periodic-table]
checkbox "propertiesPanel.showInfoOrder" = true
checkbox "propertiesPanel.showInfoENeg" = false
checkbox "propertiesPanel.showInfoAMass" = true
checkbox "propertiesPanel.closeOnSelection" = false
input[number] "propertiesPanel.maxNumberOfSelections" = 1
checkbox "propertiesPanel.isRelevantForPresentationComplete" = true

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 60

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #006064
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = false
checkbox "propertiesPanel.italic" = false
checkbox "propertiesPanel.underline" = false
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 0

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement"
button "propertiesPanel.deleteElement"`,

  'widget-periodic-table|multi-expert': `--- tabs --- element properties, position and size, styling

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[toolbox.widget-periodic-table]
checkbox "propertiesPanel.showInfoOrder" = indeterminate
checkbox "propertiesPanel.showInfoENeg" = indeterminate
checkbox "propertiesPanel.showInfoAMass" = indeterminate
checkbox "propertiesPanel.closeOnSelection" = indeterminate
input[number] "propertiesPanel.maxNumberOfSelections" = 1
checkbox "propertiesPanel.isRelevantForPresentationComplete" = indeterminate

--- tab "position and size" ---
[Position]
input[number] "propertiesPanel.xPosition" = 0
input[number] "propertiesPanel.yPosition" = 0
input[number] "propertiesPanel.zIndex" = 0
[Dimensionen]
input[number] "propertiesPanel.width" = 180
input[number] "propertiesPanel.height" = 60
button "align_horizontal_left"
button "align_horizontal_right"
button "align_vertical_top"
button "align_vertical_bottom"

--- tab "styling" ---
input[text] "propertiesPanel.backgroundColor" = #f1f1f1
input[text] "propertiesPanel.fontColor" = #006064
input[number] "propertiesPanel.fontSize" = 20
checkbox "propertiesPanel.bold" = indeterminate
checkbox "propertiesPanel.italic" = indeterminate
checkbox "propertiesPanel.underline" = indeterminate
[Rahmen]
input[number] "propertiesPanel.borderRadius" = 0
input[text] "propertiesPanel.borderColor" = black
select "propertiesPanel.borderStyle" = solid
input[number] "propertiesPanel.borderWidth" = 0

--- footer ---
checkbox "propertiesPanel.setElementInteractionEnabled" = false
button "propertiesPanel.duplicateElement" (disabled)
button "propertiesPanel.deleteElement"`,

  'widget-periodic-table|multi-standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = Muss eindeutig sein (disabled)
[toolbox.widget-periodic-table]
checkbox "propertiesPanel.showInfoOrder" = indeterminate
checkbox "propertiesPanel.showInfoENeg" = indeterminate
checkbox "propertiesPanel.showInfoAMass" = indeterminate
checkbox "propertiesPanel.closeOnSelection" = indeterminate
input[number] "propertiesPanel.maxNumberOfSelections" = 1
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`,

  'widget-periodic-table|standard': `--- tabs --- element properties

--- tab "element properties" ---
input[text] "propertiesPanel.id" = widget-periodic-table
[toolbox.widget-periodic-table]
checkbox "propertiesPanel.showInfoOrder" = true
checkbox "propertiesPanel.showInfoENeg" = false
checkbox "propertiesPanel.showInfoAMass" = true
checkbox "propertiesPanel.closeOnSelection" = false
input[number] "propertiesPanel.maxNumberOfSelections" = 1
checkbox "propertiesPanel.maxWidthEnabled" = false
input[number] "propertiesPanel.maxWidth" =  (disabled)

--- footer ---
button "propertiesPanel.deleteElement"`
};
