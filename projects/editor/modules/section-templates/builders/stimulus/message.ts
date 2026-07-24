import { MessageStimulusOptions } from 'editor/src/app/section-templates/stimulus-interfaces';

export function getMessageTemplateString(
  options: MessageStimulusOptions & { sendLabel: string }) {
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
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 1,
      "gridColumnRange": 2,
      "gridRow": 2,
      "gridRowRange": 5,
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
        "value": 10,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 2,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 20,
      "backgroundColor": "#e9e9e9"
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
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 1,
      "gridColumnRange": 1,
      "gridRow": 2,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 20,
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
        "value": 5,
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
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">07:35</p>",
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
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 2,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 0,
        "unit": "px"
      },
      "marginRight": {
        "value": 20,
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
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"text-align: right; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\"><img style=\\"display: inline-block; height: 1em; vertical-align: middle\\" src=\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABZCAQAAABiD0msAAAAwnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVBBDgMhCLz7ij5BGVR8jtvdJv1Bn18UtlnbTuKAjBmBcLyej3AboMSBc5XSSokKbtyoayLR0CenyJMnCruW1nrIzQXSEjTCrlL8/VlPHwMLXbN8MZK7C9sqNP+Z5MuILGB0NPLdjZobgUxIbtC7j9KkXkfYjrhC7IRBLGvbP/eq29uz/gOiAwlRGWBrAOMgoA9hctGHypoDVZlwjqoL+benE+EN9eZZI3KNOLQAAAEkaUNDUElDQyBwcm9maWxlAAB4nJ2Qv0rDUBTGf62iUlQExUEcMnQtTnZy8B8Gh0JtIxid0qTFYm4MSUrxDfom+jAdBMFXcFdw9rvRwcEsXjh8Pw7nfN+9F+pOHJp88RBMUmRu78i/8q+d5TcabLBOk70gzNNO/8yj8ny+UrP60rJe1XN/nqVomIfSuSoJ06yA2oG4PS1Syyq27rzeiXgmdiKTROIncTMykWW72zPxJPzxtLdZHSaXfdtX7eJyTocuDgMmjIkpaEkTdU5psy91yQh4ICeUxgzVm2qm4FaUy8nlWOSJdJuKvJ0yr6uUgTzG8rIJ9xh52jzs/36vfVyUm7XteRpkQdlaUNVHI3h/hDUfNp+hcVORtfL7bRUz7XLmn2/8Al2pUJ+JXYNVAAANdmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo1MDY3MGFjOS1jMDBmLTQ4ZGItOGE2Yi00ZDg4YjViMTBlMWIiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Nzg2MWNhZDctOTkxMi00ZjYzLTgwYjEtMjVmZTg5YzVjNTA3IgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MGU3NTY1YWUtMjE2Ni00NDAxLWE1NTgtOGM2Yjc3Zjg0NTIyIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2OTc0NjcwNDc5MDM0NjgiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zNCIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjM6MTA6MTZUMTY6Mzc6MjUrMDI6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIzOjEwOjE2VDE2OjM3OjI1KzAyOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZDc4NWNlM2EtMGVlMC00NWFmLTg4YjgtYTdlMWUwY2ViZDVhIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTEwLTE2VDE2OjM3OjI3Ii8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PpRVU0QAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+cKEA4lG7U0+qUAAAHeSURBVHja7dw7SwNBFIbhN4l4Ay1SKSm0EQQVDAoighcwjXYBG3sRCwstbRSsBCsbwUIRFKz1H/gLJOIFlBALIaAQO7FxLQwmzcBZxDi7fLMQFuYcsk+YyZzNkgGfW44SgeEokPWZ0ULFxPimeNz6zYyAIElMWlMkrvKWa0fPGL3+X35taG07Y45jN7QEEUQQQQSJ+crezSaDhrgrtnj1GXLBiCluggFm/B1aaSMDYJqUv5DmUNGJKFS/H7w7etpDcv/5W+uQtOM4itr9SKB1RBBBBBFEkLiU8Rl6DFHPPPkNWWLfVKF+ssaev0Mrwa6x0E6y85tC8K8hKTrNsa2kNdkbWP1ecuroWWQqSpA7Dhw9w42GaEEURBBBBBFEEKCJBAtkDb+2PnDCh8+QXdaNsXnmfR5aK+bYOTI+Q9pCRHdosjewjD9nwxGzynKUIG/cOGJetI4IIogggggiiCCCCCKIIIIIIogggggiiCCCCCKIIIL412oPeiY5c8QMObNnnTnuf1TlnDmjzpw8fY6esdppiO0I6K/iw+R0AdAVKuf74/Vsq4Sg7vVPW8GsrtBSzSmac8rVWZikbM4pVt8l5C4cWSOlRO4HP86dKeeRybo5+GjKuWe8bj6Z90X5Astrb9d58ku/AAAAAElFTkSuQmCC\\"> 4G 67 % <img style=\\"display: inline-block; height: 1em; vertical-align: middle\\" src=\\"data:image/png;base64,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3MGsZKjEU8QRRdUoX8i6rHDe4qxWaqx1T/7CUF5bSXOd5jDiWEICSYiQUUMZFViI0qqRYiJF+zEP/5DjT5JLJlcZjBwLqEKF5PjB/+B3t2ZhcsJNCsWArhfb/hgBuneBZt22v49tu3kC+J+BK63trzaAmU/S620tcgT0bwMX121N3gMud4DBJ10yJEfy0xQKBeD9jL4pBwzcAsE1t7fWPk4fgAx1tXwDHBwCo0XKXvd4d09nb/+eafX3A5CHcrPO3vZpAAAOVWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo5MzQxMzU4Yi04ODE5LTRjZGUtYjliOC1mYTk2NWU0MDViODEiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODM1NGNhODYtMTM2ZS00NGE1LWFlMmEtYzljNDM5MzM4YWNmIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MTY4ZGFjNzQtMzhiNi00YzQ1LWFiOGItZTVkYjAzMGY0NTM5IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2OTc3OTMwMTYwMjIzNjciCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4yOCIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjM6MTA6MTZUMTQ6MTc6MzErMDI6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIzOjEwOjE2VDE0OjE3OjMxKzAyOjAwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MWJlNDI0ZDYtY2YwYS00YTE3LWJkM2ItN2U5MTUwNmQ1YTAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTEwLTE2VDE0OjE3OjM2Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg3NzU3NGFiLWNhZWItNGU2ZS04MjY2LWQ1ZTkyNGViYzg0MCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0xMC0yMFQxMToxMDoxNiIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz7SX62fAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5woUCQoPN9+XZwAAC4FJREFUeNrtnb2PJNd1xX/3vlfVvVxJK0ICBEtBUaK4lgMZhp04c6TAZObEBvwHOGCyTP0fOLEmcWjAgBMZsJWRqQEnZmIZcCJAhO19TggYFumlyN3pqnrvOqhXszXN3Z2VZ2b76x6g0dPdM9NV754679z3URccjgNGAPhhd//N/370y08Bfrf7wXe+9fVvvv7tr3/zKx8/+p9feRM59hlyv3vzRwP5LwQ+AQTIwAZYATFj5s3keL4CSlmIoVUOKVCAOxn7x5TSn9/W90eBHvgdg0fAV4FgZoiI5ZwlhOAEdjwXNhGWUgqqWiqJC5DNbI3w89v8/jjbCOAcaOrrNfB5JW/0MDlegAygqrESd1bfUUQau+UePK6Acfr5bn30iBhwdxxHjdH563gBe3N+aifCrIX0ldhSoL3N79fqWaxKPjnnFihmpjHG7CFyvNADh2D1AWCV0HPPrk/18fYsxGy688L3jn3fh9VqNWmxw/E8DyyTB/6yNSbXx60ySDdgBXKBtgBt2wKsVqsVgJpQTMAE68cBE/rFe45jtwhWyFao8R6GPGJCnjmxICxmJiEEM7Ow8MO3iisNbs5Z5+6haRqANueMqiIiFFyijxmqWsxMh2EghNDUnGi2nTuXsCsJHEIoZqZ93+tqtWIcR+pJZEBFxHX4yDksIrlpGi2lCFA2m422bYtMBlP2msAA9QQCcB5jDAWeLLoIl+DjRgSGqsZrIDdNc3cfyPtSBK5DaYOqYmZr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\\"></p>",
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
      "width": 40,
      "height": 100,
      "isWidthFixed": true,
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
      "gridColumnRange": 2,
      "gridRow": 3,
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
        "value": 0,
        "unit": "px"
      },
      "zIndex": 0
    },
    "type": "image",
    "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA/CAYAAACxdtubAAAA7npUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjajVFZrsMwCPz3KXoENm/HcTapN+jxO7Fx0zzpSSXyCAYCYxz21/MIj9OkSLCYS6opEcyqVWlwCg1bOjJZx27aPMd3PujhCQGlZ+UIqzi/g4fPHlcfwrN+NpoON3jxSjSfzMudX7yhlL+NXIHymEyb/+CNVFyRjXh1RamWfLvattLdynVMs6SYOBvQhHJOFX4Rsox9bqfQY5XaG8Wx0A8x41kq0CS7shJQtQyVeh7TBl6ApBZQyPiaxol98YSnhAQorz7o81qNvndz7egf++Va4Q3qp3cUshAhHgAAAYRpQ0NQSUNDIHByb2ZpbGUAAHicfZE9SMNAHMVf04pFWhzsIOKQoTrZRYs4lioWwUJpK7TqYHLpFzRpSFJcHAXXgoMfi1UHF2ddHVwFQfADxNnBSdFFSvxfUmgR48FxP97de9y9A4R2nalmIAGommVkU0mxUFwVB18RQgBBxBGWmKmnc4t5eI6ve/j4ehfjWd7n/hxhpWQywCcSJ5huWMQbxLObls55nzjCqpJCfE48ZdAFiR+5Lrv8xrnisMAzI0Y+O08cIRYrfSz3MasaKnGcOKqoGuULBZcVzluc1XqTde/JXxgqaSs5rtMcRwpLSCMDETKaqKEOCzFaNVJMZGk/6eEfc/wZcsnkqoGRYwENqJAcP/gf/O7WLM9Mu0mhJDDwYtsfE8DgLtBp2fb3sW13TgD/M3Cl9fyNNjD3SXqrp0WPgOFt4OK6p8l7wOUOMPqkS4bkSH6aQrkMvJ/RNxWBkVtgaM3trbuP0wcgT10t3wAHh8BkhbLXPd4d7O/t3zPd/n4AnDFytywkICkAAA12aVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmVhNDlkMTM4LTBkZGItNDg3Ny1hOTQ3LWZhNjZjMGZkYmFlNiIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowZDkxYjU5Yy05MTUzLTRhYWEtYjZlOC01NmFkNzJkODkzMWMiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkOTQzZjE4Mi0yYzExLTQxZmMtOWQ0MS1jYjYxNjVkM2E4ZGEiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTczMzMwOTUxMjkxMTU0OCIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjM4IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNDoxMjowNFQxMTo1MTo1MSswMTowMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjQ6MTI6MDRUMTE6NTE6NTErMDE6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmZmM2Y2Q5OS0wOGVjLTQ2ZGYtYWVkNC1jZDNiNGM0NWFjNGIiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjQtMTItMDRUMTE6NTE6NTIiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+dZVDWgAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+gMBAozNKQZXUoAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAJpklEQVRo3tVba0xTWxb+TmlLFXlIFcXHVYra+EBuNYrY+IgQjWE0RnEGwWeEO3HGiRKNROUqEk3EB/GikJF4E1FxoqKISkRBQTA+KD4KKhQTqFKlBSrxTqwjOK75YXvsAQqc0gLzJTuh57DXWt9e+7HWPnszcCLevXtHDQ0NMJlMICI8f/4c3759AwBMmjQJAwYMgEgkglQqhb+/P4P/J1RVVVFSUhK5uroSAF4lOjqaSktLSa/XU78kZzAYPqSmppKnpycxDNOOgEgkosDAQFIqlZwyfPjwDgmLxWKKiIigqqqq/kH4w4cPoVu3biWpVMoxNCgoiGJjYykrK4saGxsvdiXnwYMHFB8fT2FhYTRgwABWjlAo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",
    "alt": "Bild nicht gefunden",
    "scale": false,
    "allowFullscreen": false,
    "magnifier": false,
    "magnifierSize": 100,
    "magnifierZoom": 1.5,
    "magnifierUsed": false,
    "fileName": ""
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
      "gridColumnRange": 2,
      "gridRow": 4,
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
    "text": "<p style=\\"text-align: center; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.from}</p>",
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
      "gridColumnRange": 2,
      "gridRow": 5,
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
      "backgroundColor": "#eefcda"
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
      "minHeight": 380,
      "maxHeight": null
    },
    "position": {
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 1,
      "gridColumnRange": 2,
      "gridRow": 5,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 20,
        "unit": "px"
      },
      "marginRight": {
        "value": 20,
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
    "text": "<p style=\\"padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\">${options.body}</p>",
    "markingMode": "selection",
    "markingPanels": [],
    "highlightableOrange": false,
    "highlightableTurquoise": false,
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
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 6,
      "gridRowRange": 1,
      "marginLeft": {
        "value": 20,
        "unit": "px"
      },
      "marginRight": {
        "value": 20,
        "unit": "px"
      },
      "marginTop": {
        "value": 5,
        "unit": "px"
      },
      "marginBottom": {
        "value": 20,
        "unit": "px"
      },
      "zIndex": -1
    },
    "styling": {
      "borderWidth": 1,
      "borderColor": "black",
      "borderStyle": "solid",
      "borderRadius": 20,
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
      "xPosition": 0,
      "yPosition": 0,
      "gridColumn": 2,
      "gridColumnRange": 1,
      "gridRow": 6,
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
        "value": 13,
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
      "font": "NunitoSans",
      "fontSize": 20,
      "bold": false,
      "italic": false,
      "underline": false,
      "lineHeight": 135
    },
    "type": "text",
    "text": "<p style=\\"text-align: center; padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0\\" indent=\\"0\\" indentsize=\\"20\\"><span>${options.sendLabel}</span></p>",
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
        "value": 30,
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
    "value": 175,
    "unit": "px"
  }, {
    "value": 175,
    "unit": "px"
  }, {
    "value": 2,
    "unit": "fr"
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
