import { Injectable } from '@angular/core';
import { Editor } from '@tiptap/core';
import ToggleButtonExtension from
  'common/models/elements/compound-elements/cloze/tiptap-editor-extensions/toggle-button';
import DropListExtension from 'common/models/elements/compound-elements/cloze/tiptap-editor-extensions/drop-list';
import TextFieldExtension from 'common/models/elements/compound-elements/cloze/tiptap-editor-extensions/text-field';
import { Unit } from 'common/models/unit';
import {
  InputElement, PositionedUIElement, UIElement, UIElementValue
} from 'common/models/elements/element';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { TextElement } from 'common/models/elements/text/text';
import {
  ClozeDocument,
  ClozeDocumentParagraph,
  ClozeDocumentParagraphPart,
  ClozeElement
} from 'common/models/elements/compound-elements/cloze/cloze';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { MessageService } from 'common/services/message.service';
import { IDService } from 'editor/src/app/services/id.service';
import packageJSON from '../../../package.json';
import {
  BasicStyles,
  ExtendedStyles,
  PlayerProperties,
  PositionProperties
} from 'common/models/elements/property-group-interfaces';

import { DragNDropValueObject, TextImageLabel } from 'common/models/elements/label-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SanitizationService {
  private static expectedUnitVersion: [number, number, number] =
    packageJSON.config.unit_definition_version.split('.') as unknown as [number, number, number];

  private static unitDefinitionVersion: [number, number, number] | undefined;

  repairLog: string[] = [];

  // TODO: isUnitDefinitionOutdated must not set the unitDefinitionVersion
  static isUnitDefinitionOutdated(unitDefinition: Partial<Unit>): boolean {
    SanitizationService.unitDefinitionVersion =
      SanitizationService.readUnitDefinitionVersion(unitDefinition as unknown as Record<string, string>);
    return SanitizationService.isVersionOlderThanCurrent(SanitizationService.unitDefinitionVersion);
  }

  sanitizeUnitDefinition(unitDefinition: Partial<Unit>): Partial<Unit> {
    return {
      ...unitDefinition,
      pages: unitDefinition.pages?.map((page: Page) => this.sanitizePage(page)) as Page[]
    };
  }

  checkAndRepairIDs(unitDefinition: Partial<Unit>, idManager: IDService, messageService: MessageService): Partial<Unit> {
    this.repairLog = [];
    unitDefinition.pages?.forEach(page => {
      page.sections.forEach(section => {
        section.elements.forEach(element => {
          this.checkIDList(element, idManager, messageService);
          if (element.type === 'likert') {
            (element as LikertElement).rows.forEach(row => this.checkIDList(row, idManager, messageService));
          }
          if (element.type === 'cloze') {
            ClozeElement.getDocumentChildElements((element as ClozeElement).document)
              .forEach(clozeChild => this.checkIDList(clozeChild, idManager, messageService));
          }
        });
      });
    });
    if (this.repairLog.length > 0) {
      messageService.showPrompt(
        `Doppelte IDs gefunden: \n${this.repairLog.join('\n')}\n\n Es wurden neue IDs generiert.`);
    }
    idManager.reset();
    return unitDefinition;
  }

  private checkIDList(element: UIElement | DragNDropValueObject,
                      idManager: IDService,
                      messageService: MessageService): void {
    if (!idManager.isIdAvailable(element.id)) {
      console.warn(`Id already in: ${element.id}! Generating a new one...`);
      this.repairLog.push(element.id);
      element.id = idManager.getNewID((element as UIElement).type || 'value');
    }
    idManager.addID(element.id);

    if (['drop-list', 'drop-list-simple'].includes((element as UIElement).type as string)) {
      (element as DropListElement).value.forEach(value => {
        this.checkIDList(value, idManager, messageService);
      });
    }
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
    if (Number(version[0]) < Number(SanitizationService.expectedUnitVersion[0])) {
      return true;
    }
    if (Number(version[1]) < Number(SanitizationService.expectedUnitVersion[1])) {
      return true;
    }
    return Number(version[2]) < Number(SanitizationService.expectedUnitVersion[2]);
  }

  private sanitizePage(page: Page): Partial<Page> {
    return {
      ...page,
      sections: page.sections.map((section: Section) => this.sanitizeSection(section))
    };
  }

  /* Transform grid sizes from string to array with value and unit. */
  private sanitizeSection(section: any): Section {
    return {
      ...section,
      gridColumnSizes: typeof section.gridColumnSizes === 'string' ?
        (section.gridColumnSizes as string)
          .split(' ')
          .map(size => ({ value: size.slice(0, -2), unit: size.slice(-2) })) :
        section.gridColumnSizes,
      gridRowSizes: typeof section.gridRowSizes === 'string' ?
        (section.gridRowSizes as string)
          .split(' ')
          .map(size => ({ value: size.slice(0, -2), unit: size.slice(-2) })) :
        section.gridRowSizes,
      elements: section.elements.map((element: UIElement) => (
        this.sanitizeElement(
          element as Record<string, UIElementValue>,
          section.dynamicPositioning
        ))) as PositionedUIElement[]
    } as Section;
  }

  private sanitizeElement(element: Record<string, UIElementValue>,
                          sectionDynamicPositioning?: boolean): UIElement {
    let newElement: Partial<UIElement> = {
      ...element,
      position: SanitizationService.getPositionProps(element, sectionDynamicPositioning),
      styling: SanitizationService.getStyleProps(element) as unknown as BasicStyles & ExtendedStyles,
      player: SanitizationService.getPlayerProps(element)
    };
    if (newElement.type === 'text') {
      newElement = SanitizationService.handleTextElement(newElement as Record<string, UIElementValue>);
    }
    if (['text-field', 'text-area', 'text-field-simple', 'spell-correct']
      .includes(newElement.type as string)) {
      newElement = SanitizationService.sanitizeTextInputElement(newElement as Record<string, UIElementValue>);
    }
    if (newElement.type === 'cloze') {
      newElement = this.handleClozeElement(newElement as Record<string, UIElementValue>);
    }
    if (newElement.type === 'toggle-button') {
      newElement = SanitizationService.handleToggleButtonElement(newElement as Record<string, UIElementValue>);
    }
    if (['drop-list', 'drop-list-simple'].includes(newElement.type as string)) {
      newElement = SanitizationService.handleDropListElement(newElement as Record<string, UIElementValue>);
    }
    if (['radio'].includes(newElement.type as string)) {
      newElement = SanitizationService.handleRadioGroup(newElement as RadioButtonGroupElement);
    }
    if (['radio-group-images'].includes(newElement.type as string)) {
      newElement = SanitizationService.fixImageLabel(newElement as RadioButtonGroupComplexElement);
    }
    if (['likert'].includes(newElement.type as string)) {
      newElement = this.handleLikertElement(newElement as LikertElement);
    }
    if (['likert-row', 'likert_row'].includes(newElement.type as string)) {
      newElement = SanitizationService.handleLikertRowElement(newElement as Record<string, UIElementValue>);
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
  private static getStyleProps(element: Record<string, UIElementValue>): Record<string, UIElementValue> {
    if (element.styling !== undefined) {
      return element.styling as Record<string, UIElementValue>;
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
    return element;
  }

  private static getPlayerProps(element: Record<string, UIElementValue>): PlayerProperties {
    if (element.playerProps !== undefined) {
      return element.playerProps as PlayerProperties;
    }
    if (element.player !== undefined) {
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

    // TODO: create a sub method
    if (element.document) {
      doc = element.document as ClozeDocument;
      childElements = ClozeElement.getDocumentChildElements(doc);
    } else {
      childElements = (element.parts as any[])
        .map((el: any) => el
          .filter((el2: { type: string; }) => [
            'text-field', 'text-field-simple', 'drop-list', 'drop-list-simple', 'toggle-button'
          ].includes(el2.type)).value)
        .flat();
      doc = SanitizationService.createClozeDocument(element);
    }

    // TODO: and create a sub method
    // repair child element types
    childElements.forEach(childElement => {
      childElement.type = childElement.type === 'text-field' ? 'text-field-simple' : childElement.type;
    });

    return {
      ...element,
      document: {
        ...doc,
        content: doc.content
          .map((paragraph: ClozeDocumentParagraph) => ({
            ...paragraph,
            content: paragraph.content ? paragraph.content
              .map((paraPart: ClozeDocumentParagraphPart) => (
                ['TextField', 'DropList', 'ToggleButton', 'Button'].includes(paraPart.type) ?
                  {
                    ...paraPart,
                    attrs: {
                      ...paraPart.attrs,
                      model: this.sanitizeElement(childElements.shift() as Record<string, UIElementValue>)
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
      extensions: [ToggleButtonExtension, DropListExtension, TextFieldExtension],
      content: replacedText
    });
    return editor.getJSON() as ClozeDocument;
  }

  /* before: simple string[]; after: DragNDropValueObject with ID and value.
  * Needs to be done to selectable options and the possibly set preset (value). */
  private static handleDropListElement(element: Record<string, UIElementValue>): DropListElement {
    const newElement = { ...element };
    if (newElement.options) {
      console.warn('New dropList value IDs have been generated');
      newElement.value = [];
      (newElement.options as string[]).forEach((option, index) => {
        (newElement.value as DragNDropValueObject[]).push({
          id: 'id_placeholder',
          text: option,
          imgSrc: null,
          imgPosition: 'above',
          originListID: newElement.id as string,
          originListIndex: index
        });
      });
    }
    if (newElement.value &&
        (newElement.value as []).length > 0 &&
        !((newElement.value as DragNDropValueObject[])[0] instanceof Object)) {
      const newValues: DragNDropValueObject[] = [];
      (newElement.value as string[]).forEach((value, index) => {
        newValues.push({
          id: 'id_placeholder',
          text: value,
          imgSrc: null,
          imgPosition: 'above',
          originListID: newElement.id as string,
          originListIndex: index
        });
      });
      // fix DragNDropValueObject stringValue -> text
      //  imgSrcValue -> imgSrc
      (newElement as DropListElement).value.forEach((valueObject: any) => {
        valueObject.text = valueObject.text || valueObject.stringValue;
        valueObject.imgSrc = valueObject.text || valueObject.imgSrcValue;
        valueObject.imgPosition = valueObject.imgPosition || valueObject.position;
      });
      newElement.value = newValues;
    }

    if (newElement.value && (newElement.value as any)[0]?.stringValue !== undefined) {
      type OldDragNDropValueObject = {
        id: string;
        stringValue?: string;
        imgSrcValue?: string;
      };
      newElement.value = (newElement.value as OldDragNDropValueObject[])
        .map((value: OldDragNDropValueObject, index) => ({
          text: value.stringValue,
          id: value.id,
          imgSrc: value.imgSrcValue,
          imgPosition: 'above'
        } as DragNDropValueObject));
    }
    // originListID and originListIndex are mandatory and need to be added to all values
    if (newElement.value &&
        (newElement.value as DragNDropValueObject[]).length &&
        !(newElement.value as DragNDropValueObject[])[0].originListID) {
      newElement.value = (newElement.value as DragNDropValueObject[])
        .map((value: DragNDropValueObject, index) => ({
          ...value,
          originListID: newElement.id as string,
          originListIndex: index
        } as DragNDropValueObject));
    }
    return newElement as DropListElement;
  }

  private handleLikertElement(element: Partial<LikertElement>): LikertElement {
    element.options = element.options || element.columns as any;
    return {
      ...element,
      options: element.options?.map(option => ({
        text: option.text,
        imgSrc: option.imgSrc,
        imgPosition: option.imgPosition || (option as any).position
      })),
      rows: element.rows
        ?.map((row: LikertRowElement) => (
          this.sanitizeElement(row as Record<string, UIElementValue>) as LikertRowElement))
    } as LikertElement;
  }

  private static handleLikertRowElement(element: Record<string, UIElementValue>): Partial<LikertRowElement> {
    return {
      ...element,
      rowLabel: {
        text: (element.rowLabel as TextImageLabel).text,
        imgSrc: (element.rowLabel as TextImageLabel).imgSrc,
        imgPosition: (element.rowLabel as TextImageLabel).imgPosition || element.position || 'above'
      } as TextImageLabel
    };
  }

  private static handleToggleButtonElement(element: Record<string, UIElementValue>): ToggleButtonElement {
    if (element.richTextOptions) {
      return new ToggleButtonElement({
        ...element,
        options: (element.richTextOptions as string[])
          .map(richTextOption => ({ text: richTextOption }))
      });
    }
    if (element.options && (element.options as unknown[]).length) {
      if (typeof (element.options as unknown[])[0] === 'string') {
        return new ToggleButtonElement({
          ...element,
          options: (element.options as string[])
            .map(options => ({ text: options }))
        });
      }
    }
    return element as ToggleButtonElement;
  }

  private static fixImageLabel(element: Partial<RadioButtonGroupComplexElement>): RadioButtonGroupComplexElement {
    return {
      ...element,
      options: element.options ?
        element.options :
        (element.columns as TextImageLabel[])
          .map((column: TextImageLabel) => ({
            ...column, imgPosition: column.imgPosition || (column as any).position || 'above'
          }))
    } as RadioButtonGroupComplexElement;
  }

  private static handleRadioGroup(element: Partial<RadioButtonGroupElement>): RadioButtonGroupElement {
    return {
      ...element,
      options: element.options ?
        element.options :
        (element.richTextOptions as string[])
          .map((option: string) => ({
            text: option
          }))
    } as RadioButtonGroupElement;
  }
}
