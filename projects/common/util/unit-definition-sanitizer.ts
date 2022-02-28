import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Page, Unit } from '../interfaces/unit';
import {
  DragNDropValueObject, DropListElement, PlayerElement, UIElement, UIElementValue
} from '../interfaces/elements';
import ToggleButtonExtension from '../tiptap-editor-extensions/toggle-button';
import DropListExtension from '../tiptap-editor-extensions/drop-list';
import TextFieldExtension from '../tiptap-editor-extensions/text-field';
import { IdService } from '../../editor/src/app/services/id.service';

export abstract class UnitDefinitionSanitizer {
  private static unitVersion: [number, number, number] = [0, 0, 0];

  static campatibilityHandlers: { (s: UIElement[]): void; }[] = [
    UnitDefinitionSanitizer.handlePositionProps,
    UnitDefinitionSanitizer.handleFontProps,
    UnitDefinitionSanitizer.handleSurfaceProps,
    UnitDefinitionSanitizer.handlePlayerProps,
    UnitDefinitionSanitizer.handleTextElements,
    UnitDefinitionSanitizer.handleClozeElements,
    UnitDefinitionSanitizer.handleDropListElements,
    UnitDefinitionSanitizer.handlePlusOne
  ];

  static sanitize(unitDefinition: Partial<Unit> & { pages: Page[], veronaModuleVersion?: string }): Unit {
    UnitDefinitionSanitizer.unitVersion = unitDefinition.unitDefinitionType?.split('.')
      .map(el => Number(el)) as [number, number, number] ||
      unitDefinition.veronaModuleVersion?.split('.')
        .map(el => Number(el)) as [number, number, number];
    const elementList = UnitDefinitionSanitizer.getElementList(unitDefinition as Unit);
    UnitDefinitionSanitizer.campatibilityHandlers.forEach(handler => handler(elementList));
    return unitDefinition as Unit;
  }

  private static getElementList(unitDefinition: Unit): UIElement[] {
    return unitDefinition.pages.flat().map(page => page.sections.map(section => section.elements)).flat(2);
  }

  private static handlePositionProps(elementList: UIElement[]): void {
    const positionProps = ['xPosition', 'yPosition',
      'useMinHeight', 'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 'marginLeft',
      'marginRight', 'marginTop', 'marginBottom', 'zIndex', 'fixedSize', 'dynamicPositioning'];
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList, 'positionProps', positionProps);
  }

  private static handleFontProps(elementList: UIElement[]): void {
    const fontProps = ['fontColor', 'font', 'fontSize', 'lineHeight', 'bold', 'italic', 'underline'];
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList,
      'styles',
      fontProps,
      'fontProps');
  }

  private static handleSurfaceProps(elementList: UIElement[]): void {
    UnitDefinitionSanitizer.movePropertiesToSubObject(elementList,
      'styles',
      ['backgroundColor'],
      'surfaceProps');
  }

  private static handlePlayerProps(elementList: UIElement[]): void {
    const playerProps = ['autostart', 'autostartDelay', 'loop', 'startControl', 'pauseControl',
      'progressBar', 'interactiveProgressbar', 'volumeControl', 'defaultVolume', 'minVolume',
      'muteControl', 'interactiveMuteControl', 'hintLabel', 'hintLabelDelay', 'activeAfterID',
      'minRuns', 'maxRuns', 'showRestRuns', 'showRestTime', 'playbackTime'];
    const filteredElementList: PlayerElement[] =
      elementList.filter(element => ['audio', 'video'].includes(element.type)) as PlayerElement[];
    UnitDefinitionSanitizer.movePropertiesToSubObject(filteredElementList,'playerProps', playerProps);
    filteredElementList.forEach((element: PlayerElement) => {
      element.playerProps.defaultVolume = element.playerProps.defaultVolume || 0.8;
      element.playerProps.minVolume = element.playerProps.minVolume || 0;
    });
  }

  private static movePropertiesToSubObject(elementList: UIElement[],
                                           targetPropertyGroup: string,
                                           propertyList: string[],
                                           alternativeSourceGroup?: string): void {
    elementList.forEach((element: UIElement) => {
      let actualValues: Record<string, UIElementValue> = {};
      if (element[targetPropertyGroup]) {
        actualValues = element[targetPropertyGroup] as Record<string, UIElementValue>;
      } else if (alternativeSourceGroup && alternativeSourceGroup in element) {
        actualValues = element[alternativeSourceGroup] as Record<string, UIElementValue>;
        delete element[alternativeSourceGroup];
      } else {
        actualValues = Object.keys(element)
          .filter(key => propertyList.includes(key))
          .reduce((obj, key) => {
            (obj as any)[key] = element[key];
            return obj;
          }, {});
      }

      // delete old values
      if (alternativeSourceGroup) delete element[alternativeSourceGroup];
      propertyList.forEach(prop => delete element[prop]);

      if (Object.keys(actualValues).length > 0) {
        (element[targetPropertyGroup] as Record<string, UIElementValue>) = actualValues;
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

  // version 1.1.0 is the only version where there was a plus one for values, which we rolled back afterwards
  private static handlePlusOne(elementList: UIElement[]): void {
    if (UnitDefinitionSanitizer.unitVersion === [1, 1, 0]) {
      elementList.filter(el => (
        ['dropdown', 'radio', 'likert-row', 'radio-group-images', 'toggle-button'].includes(el.type)
      ))
        .forEach(element => {
          if (element.value && element.value > 0) {
            (element.value as number) -= 1;
          }
        });
    }
  }
}
