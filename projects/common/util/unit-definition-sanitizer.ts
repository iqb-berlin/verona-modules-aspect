import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Page, Section, Unit } from '../interfaces/unit';
import {
  ClozeElement,
  DragNDropValueObject,
  DropListElement,
  ElementStyling, InputElement,
  PlayerProperties, PositionedElement,
  PositionProperties, TextElement,
  UIElement,
  UIElementValue
} from '../interfaces/elements';
import { IdService } from '../../editor/src/app/services/id.service';
import packageJSON from '../../../package.json';
import ToggleButtonExtension from '../tiptap-editor-extensions/toggle-button';
import DropListExtension from '../tiptap-editor-extensions/drop-list';
import TextFieldExtension from '../tiptap-editor-extensions/text-field';
import { ClozeDocument, ClozeDocumentParagraph, ClozeDocumentParagraphPart } from '../interfaces/cloze';
import { ClozeUtils } from './cloze';

export abstract class UnitDefinitionSanitizer {
  private static expectedUnitVersion: [number, number, number] =
  packageJSON.config.unit_definition_version.split('.') as unknown as [number, number, number];

  private static unitDefinitionVersion: [number, number, number] | undefined;

  /* Second return value is for signaling if sanatization happened or not */
  static sanitizeUnitDefinition(unitDefinition: Unit & { veronaModuleVersion?: string }): [Unit, boolean] {
    try {
      UnitDefinitionSanitizer.unitDefinitionVersion =
        UnitDefinitionSanitizer.getUnitDefinitionVersion(unitDefinition as unknown as Record<string, string>);
    } catch (e) {
      console.error('Could not read unit defintion');
      return [unitDefinition, true];
    }

    if (UnitDefinitionSanitizer.isVersionOlderThanCurrent(UnitDefinitionSanitizer.unitDefinitionVersion)) {
      console.log('Sanatizing unit definition...');
      const x = {
        ...unitDefinition,
        pages: unitDefinition.pages.map((page: Page) => UnitDefinitionSanitizer.sanatizePage(page))
      };
      return [x as Unit, true];
    }
    return [unitDefinition, false];
  }

  private static getUnitDefinitionVersion(unitDefinition: Record<string, string>): [number, number, number] {
    return (
      unitDefinition.version ||
      (unitDefinition.unitDefinitionType && unitDefinition.unitDefinitionType.split('@')[1]) ||
      (unitDefinition.veronaModuleVersion && unitDefinition.veronaModuleVersion.split('@')[1]))
      .split('.') as unknown as [number, number, number];
  }

  private static isVersionOlderThanCurrent(version: [number, number, number]): boolean {
    if (!version) return true;
    if (version[0] < UnitDefinitionSanitizer.expectedUnitVersion[0]) {
      return true;
    }
    if (version[1] < UnitDefinitionSanitizer.expectedUnitVersion[1]) {
      return true;
    }
    return version[2] < UnitDefinitionSanitizer.expectedUnitVersion[2];
  }

  static sanatizePage(page: Page): Page {
    return {
      ...page,
      sections: page.sections.map((section: Section) => UnitDefinitionSanitizer.sanatizeSection(section))
    };
  }

  static sanatizeSection(section: Section): Section {
    return {
      ...section,
      elements: section.elements.map((element: UIElement) => (
        UnitDefinitionSanitizer.sanatizeElement(element))) as PositionedElement[]
    };
  }

  static sanatizeElement(element: Record<string, UIElementValue>): UIElement {
    let newElement: Partial<UIElement> = {
      ...element,
      position: UnitDefinitionSanitizer.getPositionProps(element),
      styling: UnitDefinitionSanitizer.getStyleProps(element),
      player: UnitDefinitionSanitizer.getPlayerProps(element)
    };
    if (newElement.type === 'text') {
      newElement = UnitDefinitionSanitizer.handleTextElement(newElement);
    }
    if (['text-field', 'text-area']
      .includes(newElement.type as string)) {
      newElement = UnitDefinitionSanitizer.handleTextInputElement(newElement);
    }
    if (newElement.type === 'cloze') {
      newElement = UnitDefinitionSanitizer.handleClozeElement(newElement as Record<string, UIElementValue>);
    }
    if (newElement.type === 'drop-list') {
      newElement = UnitDefinitionSanitizer.handleDropListElement(newElement as Record<string, UIElementValue>);
    }
    if (['dropdown', 'radio', 'likert-row', 'radio-group-images', 'toggle-button']
      .includes(newElement.type as string)) {
      newElement = UnitDefinitionSanitizer.handlePlusOne(newElement as InputElement);
    }

    return newElement as unknown as UIElement;
  }

  private static getPositionProps(element: Record<string, any>): PositionProperties {
    if (element.position) {
      return {
        ...element.position,
        gridColumn: element.position.gridColumn !== undefined ?
          element.position.gridColumn : element.position.gridColumnStart,
        gridColumnRange: element.position.gridColumnEnd - element.position.gridColumnStart,
        gridRow: element.position.gridRow !== undefined ?
          element.position.gridRow : element.position.gridRowStart,
        gridRowRange: element.position.gridRowEnd - element.position.gridRowStart
      };
    }
    if (element.positionProps) {
      return {
        ...element.positionProps,
        gridColumn: element.positionProps.gridColumn !== undefined ?
          element.positionProps.gridColumn : element.positionProps.gridColumnStart,
        gridColumnRange: element.positionProps.gridColumnEnd - element.positionProps.gridColumnStart,
        gridRow: element.positionProps.gridRow !== undefined ?
          element.positionProps.gridRow : element.positionProps.gridRowStart,
        gridRowRange: element.positionProps.gridRowEnd - element.positionProps.gridRowStart
      };
    }
    return element as unknown as PositionProperties;
  }

  /* Style properties are expected to be in 'stylings'. If not they may be in fontProps and/or
  *  surfaceProps. Even older versions had them in the root of the object, which is uses as last resort.
  *  The styles object then has all other properties of the element, but that is not a problem
  *  since the factory methods only use the values they care for and all others are discarded. */
  private static getStyleProps(element: Record<string, UIElementValue>): ElementStyling {
    if (element.styling !== undefined) {
      return element.styling as ElementStyling;
    }
    if (element.fontProps !== undefined) {
      return {
        ...(element.fontProps as Record<string, any>),
        backgroundColor: (element.surfaceProps as Record<string, any>)?.backgroundColor,
        borderRadius: element.borderRadius as number | undefined,
        itemBackgroundColor: element.itemBackgroundColor as string | undefined,
        borderWidth: element.borderWidth as number | undefined,
        borderColor: element.borderColor as string | undefined,
        borderStyle: element.borderStyle as
          'solid' | 'dotted' | 'dashed' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | undefined,
        lineColoring: element.lineColoring as boolean | undefined,
        lineColoringColor: element.lineColoringColor as string | undefined
      };
    }
    return element as ElementStyling;
  }

  private static getPlayerProps(element: Record<string, UIElementValue>): PlayerProperties {
    if (element.playerProps !== undefined) {
      return element.playerProps as PlayerProperties;
    }
    return element as unknown as PlayerProperties;
  }

  private static handleTextElement(element: Record<string, UIElementValue>): TextElement {
    const newElement = { ...element };
    if (newElement.highlightable || newElement.interaction === 'highlightable') {
      newElement.highlightableYellow = true;
      newElement.highlightableTurquoise = true;
      newElement.highlightableOrange = true;
    }
    if (newElement.interaction === 'underlinable') {
      newElement.highlightableYellow = true;
    }
    return newElement as TextElement;
  }

  private static handleTextInputElement(element: Record<string, UIElementValue>): InputElement {
    const newElement = { ...element };
    if (newElement.restrictedToInputAssistanceChars === undefined && newElement.inputAssistancePreset === 'french') {
      newElement.restrictedToInputAssistanceChars = false;
    }
    return newElement as InputElement;
  }

  /*
  Replace raw text with backslash-markers with HTML tags.
  The TipTap editor module can create JSOM from the HTML. It needs plugins though to be able
  to create ui-elements.
  Afterwards element models are added to the JSON.
   */
  private static handleClozeElement(element: Record<string, UIElementValue>): ClozeElement {
    if (!element.document && (!element.parts || !element.text)) throw Error('Can\'t read Cloze Element');

    // Version 2.0.0 needs to be sanatized as well because child elements were not sanatized before
    if (UnitDefinitionSanitizer.unitDefinitionVersion && UnitDefinitionSanitizer.unitDefinitionVersion[0] >= 3) {
      return element as ClozeElement;
    }

    let childElements: UIElement[];
    let doc: ClozeDocument;

    if (element.document) {
      childElements = ClozeUtils.getClozeChildElements((element as ClozeElement).document);
      doc = element.document as ClozeDocument;
    } else {
      childElements = (element.parts as any[])
        .map((el: any) => el
          .filter((el2: { type: string; }) => ['text-field', 'drop-list', 'toggle-button'].includes(el2.type)).value)
        .flat();
      doc = UnitDefinitionSanitizer.createClozeDocument(element);
    }

    return {
      ...element,
      document: {
        ...doc,
        content: doc.content
          .map((paragraph: ClozeDocumentParagraph) => ({
            ...paragraph,
            content: paragraph.content
              .map((paraPart: ClozeDocumentParagraphPart) => (
                ['TextField', 'DropList', 'ToggleButton'].includes(paraPart.type) ?
                  {
                    ...paraPart,
                    attrs: {
                      ...paraPart.attrs,
                      model: UnitDefinitionSanitizer.sanatizeElement(childElements.shift()!)
                    }
                  } :
                  {
                    ...paraPart
                  }
              ))
          }))
      } as ClozeDocument
    } as ClozeElement;
  }

  private static createClozeDocument(element: Record<string, UIElementValue>): ClozeDocument {
    const replacedText = (element.text as string).replace(/\\i|\\z|\\r/g, (match: string) => {
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
      extensions: [StarterKit, ToggleButtonExtension, DropListExtension, TextFieldExtension],
      content: replacedText
    });
    return editor.getJSON() as ClozeDocument;
  }

  private static handleDropListElement(element: Record<string, UIElementValue>): DropListElement {
    const newElement = element;
    if (newElement.options) {
      newElement.value = [];
      (newElement.options as string[]).forEach(option => {
        (newElement.value as DragNDropValueObject[]).push({
          id: IdService.getInstance().getNewID('value'),
          stringValue: option
        });
      });
    }
    if (newElement.value && !((newElement.value as DragNDropValueObject[])[0] instanceof Object)) {
      const newValues: DragNDropValueObject[] = [];
      (newElement.value as string[]).forEach(value => {
        newValues.push({
          id: IdService.getInstance().getNewID('value'),
          stringValue: value
        });
      });
      newElement.value = newValues;
    }
    return newElement as DropListElement;
  }

  // version 1.1.0 is the only version where there was a plus one for values, which was rolled back afterwards.
  private static handlePlusOne(element: InputElement): InputElement {
    return ((UnitDefinitionSanitizer.unitDefinitionVersion === [1, 1, 0]) && (element.value && element.value > 0)) ?
      {
        ...element,
        value: (element.value as number) - 1
      } :
      element;
  }
}
