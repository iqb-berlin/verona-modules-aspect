import { EmailStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';

export function getEmailTemplateString(
  options: EmailStimulusOptions & { fromLabel: string, toLabel: string, subjectLabel: string, sendLabel: string }) {
  return `
    {
  "elements": [{
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": 180,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 1,
      "gridColumnRange": 3,
      "gridRow": 1,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 30,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "Roboto",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.instruction}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": false,
    "columnCount": "1"
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 10,
      "yPosition": 10,
      "gridColumn": 1,
      "gridColumnRange": 3,
      "gridRow": 2,
      "gridRowRange": 3,
      "marginLeft": {
        "value": 7,
        "unit": "px"
      },
      "marginRight": {
        "value": 7,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 0,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 0,
      "backgroundColor": "#eaeaea"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 10,
      "yPosition": 10,
      "gridColumn": 1,
      "gridColumnRange": 1,
      "gridRow": 2,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 10,
        "unit": "px"
      },
      "marginBottom": {
        "value": 2,
        "unit": "px"
      },
      "zIndex": 2
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"text-align: right; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.fromLabel}:</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 20,
      "yPosition": 20,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 2,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 10,
        "unit": "px"
      },
      "marginBottom": {
        "value": 5,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 10,
      "backgroundColor": "#ffffff"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 10,
      "yPosition": 10,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 2,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 7,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": 10,
        "unit": "px"
      },
      "marginBottom": {
        "value": 2,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.from}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 20,
      "yPosition": 20,
      "gridColumn": 1,
      "gridColumnRange": 1,
      "gridRow": 3,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 10,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 2,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"text-align: right; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.toLabel}:</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 30,
      "yPosition": 30,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 3,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 5,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 10,
      "backgroundColor": "#ffffff"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 20,
      "yPosition": 20,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 3,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 7,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 2,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.to}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 30,
      "yPosition": 30,
      "gridColumn": 1,
      "gridColumnRange": 1,
      "gridRow": 4,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 10,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 2,
        "unit": "px"
      },
      "zIndex": 2
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"text-align: right; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.subjectLabel}:</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 40,
      "yPosition": 40,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 4,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 5,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 10,
      "backgroundColor": "#ffffff"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 30,
      "yPosition": 30,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 4,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 7,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 2,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.subject}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 10,
      "yPosition": 10,
      "gridColumn": 3,
      "gridColumnRange": 1,
      "gridRow": 4,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 5,
        "unit": "px"
      },
      "marginRight": {
        "value": 10,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 0,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">11.01.2025 08:48</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 1,
      "gridColumnRange": 3,
      "gridRow": 5,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 7,
        "unit": "px"
      },
      "marginRight": {
        "value": 7,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 10,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 0,
      "backgroundColor": "transparent"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 10,
      "yPosition": 10,
      "gridColumn": 1,
      "gridColumnRange": 3,
      "gridRow": 5,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 15,
        "unit": "px"
      },
      "marginRight": {
        "value": 15,
        "unit": "px"
      },
      "marginTop": {
        "value": 10,
        "unit": "px"
      },
      "marginBottom": {
        "value": 20,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.body}",
    "markingMode": "range",
    "markingPanels": [],
    "highlightableOrange": ${options.allowMarking ? 'true' : 'false'},
    "highlightableTurquoise": ${options.allowMarking ? 'true' : 'false'},
    "highlightableYellow": false,
    "hasSelectionPopup": false,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 30,
      "yPosition": 30,
      "gridColumn": 1,
      "gridColumnRange": 1,
      "gridRow": 6,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 32,
        "unit": "px"
      },
      "marginRight": {
        "value": -4,
        "unit": "px"
      },
      "marginTop": {
        "value": -1,
        "unit": "px"
      },
      "marginBottom": {
        "value": 19,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 20,
      "backgroundColor": "#ffffff"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 20,
      "yPosition": 20,
      "gridColumn": 1,
      "gridColumnRange": 3,
      "gridRow": 6,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 7,
        "unit": "px"
      },
      "marginRight": {
        "value": 7,
        "unit": "px"
      },
      "marginTop": {
        "value": -10,
        "unit": "px"
      },
      "marginBottom": {
        "value": 7,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 0,
      "backgroundColor": "#eaeaea"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 60,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": 70,
      "maxWidth": 83,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 40,
      "yPosition": 40,
      "gridColumn": 3,
      "gridColumnRange": 1,
      "gridRow": 6,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": -1,
        "unit": "px"
      },
      "marginBottom": {
        "value": 19,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 10,
      "backgroundColor": "#ffffff"
    },
    "type": "frame",
    "hasBorderTop": true,
    "hasBorderBottom": true,
    "hasBorderLeft": true,
    "hasBorderRight": true
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 10,
      "yPosition": 10,
      "gridColumn": 3,
      "gridColumnRange": 1,
      "gridRow": 6,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 8,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": 0,
        "unit": "px"
      },
      "marginBottom": {
        "value": 20,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.sendLabel}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": true,
    "columnCount": 1
  }, {
    "isRelevantForPresentationComplete": true,
    "dimensions": {
      "width": 180,
      "height": 98,
      "isWidthFixed": false,
      "isHeightFixed": false,
      "minWidth": null,
      "maxWidth": null,
      "minHeight": null,
      "maxHeight": null
    },
    "position": {
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 1,
      "gridColumnRange": 3,
      "gridRow": 7,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 0,
        "unit": "px"
      },
      "marginTop": {
        "value": 20,
        "unit": "px"
      },
      "marginBottom": {
        "value": 10,
        "unit": "px"
      },
      "zIndex": 0
    },
    "styling": {
      "backgroundColor": "transparent",
      "fontColor": "#000000",
      "font": "NunitoSans",
      "fontSize": 14,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 100
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indentsize=\\"20\\">${options.subText}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
    "highlightableYellow": false,
    "hasSelectionPopup": false,
    "columnCount": 1
  }],
  "height": 400,
  "backgroundColor": "#ffffff",
  "dynamicPositioning": true,
  "autoColumnSize": false,
  "autoRowSize": true,
  "gridColumnSizes": [{
    "value": 120,
    "unit": "px"
  }, {
    "value": "1",
    "unit": "fr"
  }, {
    "value": 200,
    "unit": "px"
  }],
  "gridRowSizes": [{
    "value": "1",
    "unit": "fr"
  }],
  "visibilityDelay": 0,
  "animatedVisibility": false,
  "enableReHide": false,
  "logicalConnectiveOfRules": "disjunction",
  "visibilityRules": [],
  "ignoreNumbering": false
}
`;
}
