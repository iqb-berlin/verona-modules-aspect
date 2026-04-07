import {
  CompoundElement, InputElement, UIElement
} from 'common/models/elements/element';
import { ButtonElement } from 'common/models/elements/button/button';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import {
  BasicStyles, PositionProperties, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { ModelRegistry } from 'common/utils/model-registry';
import {
  AbstractIDService, UIElementProperties, UIElementType, UIElementValue
} from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class ClozeElement extends CompoundElement implements ClozeProperties {
  type: UIElementType = 'cloze';
  document: ClozeDocument = structuredClone(ELEMENT_DEFAULTS.cloze.document) as ClozeDocument;
  columnCount: number = ELEMENT_DEFAULTS.cloze.columnCount as number;
  position!: PositionProperties;
  styling!: BasicStyles & {
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
      this.instantiateChildElements(idService);
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at Cloze instantiation', element);
    } else {
      this.document = structuredClone(element?.document) ||
        structuredClone(ELEMENT_DEFAULTS.cloze.document) as ClozeDocument;
      this.instantiateChildElements(idService);
    }
  }

  setProperty(property: string, value: UIElementValue): void {
    if (property === 'document') {
      const deletedElements = this.getRemovedClozeElements(value as ClozeDocument);
      deletedElements.forEach(el => el.unregisterIDs());

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

  getBlueprint(): ClozeProperties {
    const newDoc = structuredClone(this.document);
    ClozeElement.getCustomNodes(newDoc.content).forEach((node: CustomDocumentNode) => {
      node.attrs.model.id = undefined as unknown as string;
      node.attrs.model.alias = undefined as unknown as string;
      if (node.attrs.model.type === 'drop-list') {
        node.attrs.model.value = (node.attrs.model as DropListElement).value
          .map(val => ({ ...val, id: undefined, alias: undefined }));
      }
    });
    return {
      ...this, document: newDoc, id: undefined, alias: undefined
    };
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

  instantiateChildElements(idService?: AbstractIDService) {
    ClozeElement.getCustomNodes(this.document.content)
      .forEach((customNode: CustomDocumentNode) => {
        customNode.attrs.model = ClozeElement.createChildElement(customNode.attrs.model, idService);
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

  getChildElements(): UIElement[] {
    return ClozeElement.getCustomNodes(this.document.content).map(el => el.attrs.model);
  }

  static getDocumentChildElements(doc: ClozeDocument): UIElement[] {
    return ClozeElement.getCustomNodes(doc.content).map(el => el.attrs.model);
  }

  private static createChildElement(elementModel: Partial<UIElement>, idService?: AbstractIDService)
    : InputElement | ButtonElement {
    const newElement = ModelRegistry.createElement(
      elementModel as { type: UIElementType } & Partial<UIElementProperties>, idService
    ) as InputElement | ButtonElement;

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
