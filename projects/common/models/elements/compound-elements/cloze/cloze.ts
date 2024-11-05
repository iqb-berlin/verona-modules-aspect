import {
  CompoundElement, InputElement, UIElement
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import {
  TextFieldSimpleElement, TextFieldSimpleProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import {
  ToggleButtonElement, ToggleButtonProperties
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { ButtonElement, ButtonProperties } from 'common/models/elements/button/button';
import { DropListElement, DropListProperties } from 'common/models/elements/input-elements/drop-list';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { CheckboxElement, CheckboxProperties } from 'common/models/elements/input-elements/checkbox';
import {
  AbstractIDService, UIElementProperties, UIElementType, UIElementValue
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class ClozeElement extends CompoundElement implements ClozeProperties {
  type: UIElementType = 'cloze';
  document: ClozeDocument = { type: 'doc', content: [] };
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  static title: string = 'Lückentext';
  static icon: string = 'vertical_split';

  static validChildElements = ['TextField', 'DropList', 'ToggleButton', 'Button', 'Checkbox'];

  constructor(element?: Partial<ClozeProperties>, idService?: AbstractIDService) {
    super({ type: 'cloze', ...element }, idService);
    if (isClozeProperties(element)) {
      this.columnCount = element.columnCount;
      this.document = structuredClone(element.document);
      this.instantiateChildElements();
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Cloze instantiation', element);
      }
      if (element?.columnCount !== undefined) this.columnCount = element.columnCount;
      this.document = structuredClone(element?.document) || ClozeElement.getDefaultDocument();
      this.instantiateChildElements();
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 200,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 35, unit: 'px' },
        ...element?.position
      });
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 180
      };
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    if (property === 'document') {
      this.document = value as ClozeDocument;

      // Instantiate new elements
      const newElements: CustomDocumentNode[] = ClozeElement.getCustomNodes((value as ClozeDocument).content)
        .filter((customNode: CustomDocumentNode) => customNode.attrs.model.id === 'cloze-child-id-placeholder');
      newElements.forEach((node: CustomDocumentNode) => {
        // Remove ID and Alias, so it can be created by the Element constructor
        node.attrs.model = ClozeElement.createChildElement(
          { ...node.attrs.model, id: undefined, alias: undefined }, this.idService
        );
      });
    } else {
      super.setProperty(property, value);
    }
  }

  getRemovedClozeElements(newClozeDoc: ClozeDocument): UIElement[] {
    const newElements = ClozeElement.getDocumentChildElements(newClozeDoc);
    return this.getChildElements()
      .filter(element => !newElements.includes(element));
  }

  static getCustomNodes(content: (ClozeDocumentWrapperNode | ClozeDocumentContentNode)[]): CustomDocumentNode[] {
    if (!content) return [];
    return content
      .reduce((accumulator: CustomDocumentNode[], node: ClozeDocumentWrapperNode | ClozeDocumentContentNode) => {
        if (node.type && ClozeElement.validChildElements.includes(node.type)) {
          accumulator.push(node as CustomDocumentNode);
        }
        accumulator.push(...ClozeElement.getCustomNodes((node as ClozeDocumentWrapperNode).content));
        return accumulator;
      }, []);
  }

  instantiateChildElements() {
    ClozeElement.getCustomNodes(this.document.content).forEach((customNode: CustomDocumentNode) => {
      customNode.attrs.model = ClozeElement.createChildElement(customNode.attrs.model);
    });
  }

  static getDefaultDocument(): ClozeDocument {
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
          indent: null,
          indentSize: 20,
          hangingIndent: false,
          margin: 0
        },
        content: [
          {
            text: 'Lorem Ipsum',
            type: 'text'
          }
        ]
      }]
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return ClozeComponent;
  }

  getDuplicate(): ClozeElement {
    return new ClozeElement(this);
  }

  getChildElements(): UIElement[] {
    return ClozeElement.getCustomNodes(this.document.content).map(el => el.attrs.model);
  }

  static getDocumentChildElements(doc: ClozeDocument): UIElement[] {
    return ClozeElement.getCustomNodes(doc.content).map(el => el.attrs.model);
  }

  private static createChildElement(elementModel: Partial<UIElement>): InputElement | ButtonElement {
    let newElement: InputElement | ButtonElement;
    switch (elementModel.type) {
      case 'text-field-simple':
        newElement = new TextFieldSimpleElement(elementModel as unknown as TextFieldSimpleProperties);
        break;
      case 'drop-list':
        newElement = new DropListElement(elementModel as unknown as DropListProperties);
        break;
      case 'toggle-button':
        newElement = new ToggleButtonElement(elementModel as unknown as ToggleButtonProperties);
        break;
      case 'button':
        newElement = new ButtonElement(elementModel as unknown as ButtonProperties);
        break;
      case 'checkbox':
        newElement = new CheckboxElement(elementModel as unknown as CheckboxProperties);
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    delete newElement.position; // Cloze children do not have a position, they are inline
    return newElement;
  }
}

export interface ClozeProperties extends UIElementProperties {
  document: ClozeDocument;
  columnCount: number;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isClozeProperties(blueprint?: Partial<ClozeProperties>): blueprint is ClozeProperties {
  if (!blueprint) return false;
  return blueprint.document !== undefined &&
    blueprint.columnCount !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}

export interface ClozeDocument {
  type: string;
  content: ClozeDocumentWrapperNode[]
}

export interface ClozeDocumentWrapperNode {
  type: string;
  attrs: Record<string, unknown>;
  content: (ClozeDocumentWrapperNode | ClozeDocumentContentNode)[];
}

export interface ClozeDocumentContentNode {
  type: string;
  text?: string;
  marks?: Record<string, unknown>[];
  attrs?: Record<string, string | number | boolean | UIElement>;
}

export interface ClozeMarks {
  'font-weight'?: string;
  'font-style'?: string;
  'text-decoration'?: string;
  fontSize?: string;
  color?: string;
  'background-color'?: string;
}

interface CustomDocumentNode extends ClozeDocumentContentNode {
  type: 'TextField' | 'DropList' | 'ToggleButton' | 'Button';
  attrs: {
    model: UIElement
  }
}
