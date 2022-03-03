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
import { MessageService } from '../services/message.service';
import ToggleButtonExtension from '../tiptap-editor-extensions/toggle-button';
import DropListExtension from '../tiptap-editor-extensions/drop-list';
import TextFieldExtension from '../tiptap-editor-extensions/text-field';
import { ClozeDocument, ClozeDocumentParagraph, ClozeDocumentParagraphPart } from '../interfaces/cloze';

export abstract class UnitDefinitionSanitizer {
  private static unitVersion: [number, number, number] =
  packageJSON.config.unit_definition_version.split('.') as unknown as [number, number, number];

  static sanitizeUnitDefinition(unitDefinition: Unit & { veronaModuleVersion?: string }): Unit {
    if (UnitDefinitionSanitizer.checkVersion(unitDefinition)) return unitDefinition;

    const x = {
      ...unitDefinition,
      pages: unitDefinition.pages.map((page: Page) => UnitDefinitionSanitizer.sanatizePage(page))
    };
    return x as Unit;
  }

  private static checkVersion(unitDefinition: Unit & { veronaModuleVersion?: string }) : boolean {
    const defVersion: [number, number, number] =
      unitDefinition.veronaModuleVersion?.split('@')[1].split('.') as unknown as [number, number, number];
    if (!UnitDefinitionSanitizer.isVersionOlderThanCurrent(defVersion)) {
      return true;
    }
    MessageService.getInstance().showWarning('Loaded an outdated unit definition');
    return false;
  }

  private static isVersionOlderThanCurrent(version: [number, number, number]): boolean {
    if (version[0] < UnitDefinitionSanitizer.unitVersion[0]) {
      return true;
    }
    if (version[1] < UnitDefinitionSanitizer.unitVersion[1]) {
      return true;
    }
    return version[2] < UnitDefinitionSanitizer.unitVersion[2];
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

  private static getPositionProps(element: Record<string, UIElementValue>): PositionProperties {
    if (element.position !== undefined) {
      return element.position as PositionProperties;
    }
    if (element.positionProps !== undefined) {
      return element.positionProps as PositionProperties;
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

  /*
  Replace raw text with backslash-markers with HTML tags.
  The TipTap editor module can create JSOM from the HTML. It needs plugins though to be able
  to create ui-elements.
  Afterwards element models are added to the JSON.
   */
  private static handleClozeElement(element: Record<string, UIElementValue>): ClozeElement {
    if (!element.parts || !element.text) throw Error('Can\'t read Cloze Element');
    const uiElementParts = (element.parts as any[])
      .map((el: any) => el
        .filter((el2: { type: string; }) => ['text-field', 'drop-list', 'toggle-button'].includes(el2.type)))
      .flat();

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
    const doc: { type: string, content: ClozeDocumentParagraph[] } =
      editor.getJSON() as { type: string, content: ClozeDocumentParagraph[] };

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
                      model: UnitDefinitionSanitizer.sanatizeElement(uiElementParts.shift().value)
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
    return ((UnitDefinitionSanitizer.unitVersion === [1, 1, 0]) && (element.value && element.value > 0)) ?
      {
        ...element,
        value: (element.value as number) - 1
      } :
      element;
  }
}
