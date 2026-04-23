import { UIElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';
import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';

export class TextElement extends UIElement implements TextProperties {
  type: UIElementType = 'text';
  text: string = ELEMENT_DEFAULTS.text.text as string;
  markingMode: 'selection' | 'word' | 'range' = ELEMENT_DEFAULTS.text.markingMode as 'selection' | 'word' | 'range';
  markingPanels: string[] = ELEMENT_DEFAULTS.text.markingPanels as string[];
  highlightableOrange: boolean = ELEMENT_DEFAULTS.text.highlightableOrange as boolean;
  highlightableTurquoise: boolean = ELEMENT_DEFAULTS.text.highlightableTurquoise as boolean;
  highlightableYellow: boolean = ELEMENT_DEFAULTS.text.highlightableYellow as boolean;
  hasSelectionPopup: boolean = ELEMENT_DEFAULTS.text.hasSelectionPopup as boolean;
  columnCount: number = ELEMENT_DEFAULTS.text.columnCount as number;
  position: PositionProperties = PropertyGroupGenerators.generatePositionProps(ELEMENT_DEFAULTS.text);

  dimensions: DimensionProperties = PropertyGroupGenerators.generateDimensionProps(ELEMENT_DEFAULTS.text);

  styling: BasicStyles & {
    lineHeight: number;
  } = {
      ...PropertyGroupGenerators.generateBasicStyleProps(ELEMENT_DEFAULTS.text),
      lineHeight: ELEMENT_DEFAULTS.text.lineHeight as number
    };

  static title: string = 'Text';
  static icon: string = 'text_snippet';
  static selectionColors: Record<string, string> = {
    yellow: '#f9f871', turquoise: '#9de8eb', orange: '#ffa06a', delete: 'lightgrey'
  };

  constructor(element?: Partial<TextProperties>, idService?: AbstractIDService) {
    super({ type: 'text', ...element }, idService);
    if (isTextProperties(element)) {
      this.text = element.text;
      this.markingMode = element.markingMode;
      this.markingPanels = element.markingPanels;
      this.highlightableOrange = element.highlightableOrange;
      this.highlightableTurquoise = element.highlightableTurquoise;
      this.highlightableYellow = element.highlightableYellow;
      this.hasSelectionPopup = element.hasSelectionPopup;
      this.columnCount = element.columnCount;
      this.position = PropertyGroupGenerators.generatePositionProps(element.position);
      this.dimensions = PropertyGroupGenerators.generateDimensionProps(element.dimensions);
      this.styling = { ...element.styling };
    } else if (environment.strictInstantiation && element?.isRelevantForPresentationComplete !== undefined) {
      throw new InstantiationEror('Error at Text instantiation', element);
    }
  }

  private isSelectable(): boolean {
    return this.markingPanels.length > 0 ||
        (this.highlightableYellow ||
        this.highlightableTurquoise ||
        this.highlightableOrange
        );
  }

  getVariableInfos(): VariableInfo[] {
    if (!this.isSelectable()) return super.getVariableInfos();
    return [{
      id: this.id,
      alias: this.alias,
      type: 'string',
      format: 'text-selection',
      multiple: true,
      nullable: false,
      values: [],
      valuePositionLabels: [],
      page: '',
      valuesComplete: false
    }];
  }

  getAnchorIDs(): string[] {
    return TextElement.getAnchorIDs(this.text);
  }

  static getAnchorIDs(text: string): string[] {
    const parser = new DOMParser();
    return Array.from(parser.parseFromString(text, 'text/html')
      .getElementsByTagName('aspect-anchor'))
      .map(element => element.getAttribute('data-anchor-id') as string);
  }
}

export interface TextProperties extends UIElementProperties {
  text: string;
  markingMode: 'selection' | 'word' | 'range';
  markingPanels: string[];
  highlightableOrange: boolean;
  highlightableTurquoise: boolean;
  highlightableYellow: boolean;
  hasSelectionPopup: boolean;
  columnCount: number;
  position: PositionProperties;
  dimensions: DimensionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextProperties(blueprint?: Partial<TextProperties>): blueprint is TextProperties {
  if (!blueprint) return false;
  return blueprint.text !== undefined &&
    blueprint.type === 'text';
}
