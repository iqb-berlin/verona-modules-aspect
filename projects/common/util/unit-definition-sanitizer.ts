import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Unit } from '../interfaces/unit';
import { DragNDropValueObject, DropListElement, UIElement } from '../interfaces/elements';
import ToggleButtonExtension from '../tiptap-editor-extensions/toggle-button';
import DropListExtension from '../tiptap-editor-extensions/drop-list';
import TextFieldExtension from '../tiptap-editor-extensions/text-field';
import { IdService } from '../../editor/src/app/services/id.service';

export abstract class UnitDefinitionSanitizer {
  static campatibilityHandlers: { (s: UIElement[]): void; }[] = [
    UnitDefinitionSanitizer.handlePositionProps,
    UnitDefinitionSanitizer.handleFontProps,
    UnitDefinitionSanitizer.handleSurfaceProps,
    UnitDefinitionSanitizer.handlePlayerProps,
    UnitDefinitionSanitizer.handleTextElements,
    UnitDefinitionSanitizer.handleClozeElements,
    UnitDefinitionSanitizer.handleDropListElements
  ];

  static sanitize(unitDefinition: Unit): Unit {
    const elementList = UnitDefinitionSanitizer.getElementList(unitDefinition);
    UnitDefinitionSanitizer.campatibilityHandlers.forEach(handler => handler(elementList));
    return unitDefinition;
  }

  private static getElementList(unitDefinition: Unit): UIElement[] {
    return unitDefinition.pages.flat().map(page => page.sections.map(section => section.elements)).flat(2);
  }

  private static handlePositionProps(elementList: UIElement[]): void {
    const positionProps = ['fixedSize', 'dynamicPositioning', 'xPosition', 'yPosition',
      'useMinHeight', 'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 'marginLeft',
      'marginRight', 'marginTop', 'marginBottom', 'zIndex'];
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList, 'positionProps', positionProps);
  }

  private static handleFontProps(elementList: UIElement[]): void {
    const fontProps = ['fontColor', 'font', 'fontSize', 'lineHeight', 'bold', 'italic', 'underline'];
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList, 'fontProps', fontProps);
  }

  private static handleSurfaceProps(elementList: UIElement[]): void {
    const surfaceProps = ['backgroundColor'];
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList, 'surfaceProps', surfaceProps);
  }

  private static handlePlayerProps(elementList: UIElement[]): void {
    const playerProps = ['autostart', 'autostartDelay', 'loop', 'startControl', 'pauseControl',
      'progressBar', 'interactiveProgressbar', 'volumeControl', 'defaultVolume', 'minVolume',
      'muteControl', 'interactiveMuteControl', 'hintLabel', 'hintLabelDelay', 'activeAfterID',
      'minRuns', 'maxRuns', 'showRestRuns', 'showRestTime', 'playbackTime'];
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList, 'playerProps', playerProps);
  }

  /* Use the first prop as indicator for existence of all. */
  private static movePropertiesToSubObject(elementList: UIElement[],
                                           propertyName: string,
                                           propertyList: string[]): void {
    elementList.forEach((element: UIElement) => {
      if (element[propertyList[0]] !== undefined) {
        if (!element[propertyName]) {
          element[propertyName] = {};
          Object.keys(propertyList).forEach(prop => {
            (element[propertyName] as Record<string, unknown>)[prop] = element[prop];
            delete element[prop];
          });
        }
      }
    });
  }

  private static handleTextElements(elementList: UIElement[]): void {
    const textElements = elementList.filter(element => element.type === 'text');
    textElements.forEach((element: Record<string, unknown>) => {
      if (element.highlightable || element.interaction === 'highlightable') {
        element.highlightableYellow = true;
        element.highlightableTurquoise = true;
        element.highlightableOrange = true;
        delete element.interaction;
        delete element.highlightable;
      }
      if (element.interaction === 'underlinable') {
        element.highlightableYellow = true;
        delete element.interaction;
      }
    });
  }

  /*
  Replace raw text with backslash-markers with JSON representation.
  The TipTap editor module can automate that. It needs plugins though to be able
  to create ui-elements.
   */
  private static handleClozeElements(elementList: UIElement[]): void {
    const clozeElements = elementList.filter(element => element.type === 'cloze');
    if (clozeElements.length && clozeElements[0].text) {
      clozeElements.forEach((element: Record<string, any>) => {
        const replacedText = element.text.replace(/\\i|\\z|\\r/g, (match: string) => {
          switch (match) {
            case '\\i':
              return '<aspect-nodeview-text-field></aspect-nodeview-text-field>';
            case '\\z':
              return '<aspect-nodeview-drop-list></aspect-nodeview-drop-list>';
            case '\\r':
              return '<aspect-nodeview-toggle-button></aspect-nodeview-toggle-button>';
            default:
              throw Error('error in match');
          }
        });
        const editor = new Editor({
          extensions: [
            StarterKit,
            ToggleButtonExtension,
            DropListExtension,
            TextFieldExtension
          ],
          content: replacedText
        });
        element.document = editor.getJSON();
        delete element.text;
      });
    }
  }

  private static handleDropListElements(elementList: UIElement[]): void {
    const dropListElements: DropListElement[] =
      elementList.filter(element => element.type === 'drop-list') as DropListElement[];
    dropListElements.forEach((element: DropListElement) => {
      if (element.options) {
        element.value = [];
        (element.options as string[]).forEach(option => {
          (element.value as DragNDropValueObject[]).push({
            id: IdService.getInstance().getNewID('value'),
            stringValue: option
          });
        });
        delete element.options;
      }
      if (element.value && !((element.value as DragNDropValueObject[])[0] instanceof Object)) {
        const newValues: DragNDropValueObject[] = [];
        (element.value as string[]).forEach(value => {
          newValues.push({
            id: IdService.getInstance().getNewID('value'),
            stringValue: value
          });
        });
        element.value = newValues;
      }
    });
  }

  // TODO dropdown + 1
}
