import { Injectable } from '@angular/core';
import packageJSON from '../../../package.json';
import { Page, Section, Unit } from 'common/interfaces/unit';
import {
  ClozeElement, DragNDropValueObject, DropListElement,
  ElementStyling,
  InputElement, LikertElement, LikertRowElement, PlayerProperties,
  PositionedElement, PositionProperties, RadioButtonGroupElement, TextElement,
  ToggleButtonElement,
  UIElement,
  UIElementValue
} from 'common/interfaces/elements';
import { ClozeDocument, ClozeDocumentParagraph, ClozeDocumentParagraphPart } from 'common/interfaces/cloze';
import { ClozeUtils } from 'common/util/cloze';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import ToggleButtonExtension from 'common/tiptap-editor-extensions/toggle-button';
import DropListExtension from 'common/tiptap-editor-extensions/drop-list';
import TextFieldExtension from 'common/tiptap-editor-extensions/text-field';
import { IDService } from './id.service';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {

  constructor(private iDService: IDService) { }

  private static expectedUnitVersion: [number, number, number] =
    packageJSON.config.unit_definition_version.split('.') as unknown as [number, number, number];

  private static unitDefinitionVersion: [number, number, number] | undefined;

  // TODO: isUnitDefinitionOutdated must not set the unitDefinitionVersion
  static isUnitDefinitionOutdated(unitDefinition: Unit): boolean {
    SanitizationService.unitDefinitionVersion =
      SanitizationService.readUnitDefinitionVersion(unitDefinition as unknown as Record<string, string>);
    return SanitizationService.isVersionOlderThanCurrent(SanitizationService.unitDefinitionVersion);
  }

  sanitizeUnitDefinition(unitDefinition: Unit): Unit {
    return {
      ...unitDefinition,
      pages: unitDefinition.pages.map((page: Page) => this.sanitizePage(page))
    };
  }

  private static readUnitDefinitionVersion(unitDefinition: Record<string, string>): [number, number, number] {
    return (
      unitDefinition.version ||
      (unitDefinition.unitDefinitionType && unitDefinition.unitDefinitionType.split('@')[1]) ||
      (unitDefinition.veronaModuleVersion && unitDefinition.veronaModuleVersion.split('@')[1]))
      .split('.') as unknown as [number, number, number];
  }

  private static isVersionOlderThanCurrent(version: [number, number, number]): boolean {
    if (!version) return true;
    if (version[0] < SanitizationService.expectedUnitVersion[0]) {
      return true;
    }
    if (version[1] < SanitizationService.expectedUnitVersion[1]) {
      return true;
    }
    return version[2] < SanitizationService.expectedUnitVersion[2];
  }

  private sanitizePage(page: Page): Page {
    return {
      ...page,
      sections: page.sections.map((section: Section) => this.sanitizeSection(section))
    };
  }

  private sanitizeSection(section: Section): Section {
    return {
      ...section,
      elements: section.elements.map((element: UIElement) => (
        this.sanitizeElement(element, section.dynamicPositioning))) as PositionedElement[]
    };
  }

  private sanitizeElement(element: Record<string, UIElementValue>,
                          sectionDynamicPositioning?: boolean): UIElement {
    let newElement: Partial<UIElement> = {
      ...element,
      position: SanitizationService.getPositionProps(element, sectionDynamicPositioning),
      styling: SanitizationService.getStyleProps(element),
      player: SanitizationService.getPlayerProps(element)
    };
    if (newElement.type === 'text') {
      newElement = SanitizationService.handleTextElement(newElement);
    }
    if (['text-field', 'text-area', 'text-field-simple', 'spell-correct']
      .includes(newElement.type as string)) {
      newElement = SanitizationService.sanitizeTextInputElement(newElement);
    }
    if (newElement.type === 'cloze') {
      newElement = this.handleClozeElement(newElement as Record<string, UIElementValue>);
    }
    if (newElement.type === 'toggle-button') {
      newElement = SanitizationService.handleToggleButtonElement(newElement as ToggleButtonElement);
    }
    if (newElement.type === 'drop-list') {
      newElement = this.handleDropListElement(newElement as Record<string, UIElementValue>);
    }
    if (['dropdown', 'radio', 'likert-row', 'radio-group-images', 'toggle-button']
      .includes(newElement.type as string)) {
      newElement = SanitizationService.handlePlusOne(newElement as InputElement);
    }
    if (['radio'].includes(newElement.type as string)) {
      newElement = SanitizationService.handleRadioButtonGroupElement(newElement as RadioButtonGroupElement);
    }
    if (['likert'].includes(newElement.type as string)) {
      newElement = this.handleLikertElement(newElement as LikertElement);
    }
    if (['likert-row', 'likert_row'].includes(newElement.type as string)) {
      newElement = SanitizationService.handleLikertRowElement(newElement as LikertRowElement);
    }

    return newElement as unknown as UIElement;
  }

  private static getPositionProps(element: Record<string, any>,
                                  sectionDynamicPositioning?: boolean): PositionProperties {
    if (element.position && element.position.gridColumnEnd) {
      return {
        ...element.position,
        dynamicPositioning: sectionDynamicPositioning,
        gridColumn: element.position.gridColumn !== undefined ?
          element.position.gridColumn : element.position.gridColumnStart,
        gridColumnRange: element.position.gridColumnEnd - element.position.gridColumnStart,
        gridRow: element.position.gridRow !== undefined ?
          element.position.gridRow : element.position.gridRowStart,
        gridRowRange: element.position.gridRowEnd - element.position.gridRowStart
      };
    }
    if (element.position) {
      return {
        ...element.position,
        dynamicPositioning: sectionDynamicPositioning
      };
    }
    if (element.positionProps) {
      return {
        ...element.positionProps,
        dynamicPositioning: sectionDynamicPositioning,
        gridColumn: element.positionProps.gridColumn !== undefined ?
          element.positionProps.gridColumn : element.positionProps.gridColumnStart,
        gridColumnRange: element.positionProps.gridColumnEnd - element.positionProps.gridColumnStart,
        gridRow: element.positionProps.gridRow !== undefined ?
          element.positionProps.gridRow : element.positionProps.gridRowStart,
        gridRowRange: element.positionProps.gridRowEnd - element.positionProps.gridRowStart
      };
    }
    return {
      ...element,
      dynamicPositioning: sectionDynamicPositioning,
      gridColumn: element.gridColumn !== undefined ?
        element.gridColumn : element.gridColumnStart,
      gridColumnRange: element.gridColumnEnd - element.gridColumnStart,
      gridRow: element.gridRow !== undefined ?
        element.gridRow : element.gridRowStart,
      gridRowRange: element.gridRowEnd - element.gridRowStart
    } as PositionProperties;
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
        // additional props that were neither fontProp nor surfaceProp before
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
    } else if (element.player !== undefined) {
      return element.player as PlayerProperties;
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

  private static sanitizeTextInputElement(element: Record<string, UIElementValue>): InputElement {
    const newElement = { ...element };
    if (newElement.restrictedToInputAssistanceChars === undefined && newElement.inputAssistancePreset === 'french') {
      newElement.restrictedToInputAssistanceChars = false;
    }
    if (newElement.inputAssistancePreset === 'none') {
      newElement.inputAssistancePreset = null;
    }
    return newElement as InputElement;
  }

  /*
  Replace raw text with backslash-markers with HTML tags.
  The TipTap editor module can create JSOM from the HTML. It needs plugins though to be able
  to create ui-elements.
  Afterwards element models are added to the JSON.
   */
  private handleClozeElement(element: Record<string, UIElementValue>): ClozeElement {
    if (!element.document && (!element.parts || !element.text)) throw Error('Can\'t read Cloze Element');

    let childElements: UIElement[];
    let doc: ClozeDocument;

    // TODO: Put this after repair child element types and create a sub method
    if (element.document) {
      childElements = ClozeUtils.getClozeChildElements((element as ClozeElement));
      doc = element.document as ClozeDocument;
    } else {
      childElements = (element.parts as any[])
        .map((el: any) => el
          .filter((el2: { type: string; }) => [
            'text-field', 'text-field-simple', 'drop-list', 'drop-list-simple', 'toggle-button'
          ].includes(el2.type)).value)
        .flat();
      doc = SanitizationService.createClozeDocument(element);
    }

    // TODO: Put this before the previous section and create a sub method
    // repair child element types
    childElements.forEach(childElement => {
      childElement.type = childElement.type === 'text-field' ? 'text-field-simple' : childElement.type;
      childElement.type = childElement.type === 'drop-list' ? 'drop-list-simple' : childElement.type;
    });

    // TODO: create a sub method
    return {
      ...element,
      document: {
        ...doc,
        content: doc.content
          .map((paragraph: ClozeDocumentParagraph) => ({
            ...paragraph,
            content: paragraph.content ? paragraph.content
              .map((paraPart: ClozeDocumentParagraphPart) => (
                ['TextField', 'DropList', 'ToggleButton'].includes(paraPart.type) ?
                  {
                    ...paraPart,
                    attrs: {
                      ...paraPart.attrs,
                      model: this.sanitizeElement(childElements.shift()!)
                    }
                  } :
                  {
                    ...paraPart
                  }
              )) : undefined
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

  /* before: simple string[]; after: DragNDropValueObject with ID and value.
  * Needs to be done to selectable options and the possibly set preset (value). */
  private handleDropListElement(element: Record<string, UIElementValue>): DropListElement {
    const newElement = element;
    if (newElement.options) {
      console.warn('New dropList value IDs have been generated');
      newElement.value = [];
      (newElement.options as string[]).forEach(option => {
        (newElement.value as DragNDropValueObject[]).push({
          id: this.iDService.getNewID('value'),
          stringValue: option
        });
      });
    }
    if (newElement.value && !((newElement.value as DragNDropValueObject[])[0] instanceof Object)) {
      const newValues: DragNDropValueObject[] = [];
      (newElement.value as string[]).forEach(value => {
        newValues.push({
          id: this.iDService.getNewID('value'),
          stringValue: value
        });
      });
      newElement.value = newValues;
    }
    return newElement as DropListElement;
  }

  private handleLikertElement(element: LikertElement): LikertElement {
    return {
      ...element,
      rows: element.rows.map((row: LikertRowElement) => this.sanitizeElement(row))
    } as LikertElement;
  }

  private static handleLikertRowElement(element: LikertRowElement): LikertRowElement {
    const newElement = element;
    if (newElement.rowLabel) {
      return newElement;
    }
    return {
      ...newElement,
      rowLabel: {
        text: newElement.text,
        imgSrc: null,
        position: 'above'
      }
    } as LikertRowElement;
  }

  // version 1.1.0 is the only version where there was a plus one for values, which was rolled back afterwards.
  private static handlePlusOne(element: InputElement): InputElement {
    return ((SanitizationService.unitDefinitionVersion === [1, 1, 0]) && (element.value && element.value > 0)) ?
      {
        ...element,
        value: (element.value as number) - 1
      } :
      element;
  }

  private static handleRadioButtonGroupElement(element: RadioButtonGroupElement): RadioButtonGroupElement {
    if (element.richTextOptions) {
      return element;
    }
    return {
      ...element,
      richTextOptions: element.options as string[]
    };
  }

  private static handleToggleButtonElement(element: ToggleButtonElement): ToggleButtonElement {
    if (element.richTextOptions) {
      return element;
    }
    return {
      ...element,
      richTextOptions: element.options as string[]
    };
  }
}
