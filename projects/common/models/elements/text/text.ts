import { Type } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextComponent } from 'common/components/text/text.component';
import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService, UIElementProperties, UIElementType } from 'common/interfaces';
import { InstantiationEror } from 'common/errors';

export class TextElement extends UIElement implements TextProperties {
  type: UIElementType = 'text';
  text: string = 'Lorem ipsum dolor sit amet';
  markingMode: 'selection' | 'word' | 'range' = 'selection';
  markingPanels: string[] = [];
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
  hasSelectionPopup: boolean = false;
  columnCount: number = 1;
  position?: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
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
      if (element.position) this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Text instantiation', element);
      }
      if (element?.text !== undefined) this.text = element.text;
      if (element?.markingMode !== undefined) this.markingMode = element.markingMode;
      if (element?.markingPanels !== undefined) this.markingPanels = element.markingPanels;
      if (element?.highlightableOrange !== undefined) this.highlightableOrange = element.highlightableOrange;
      if (element?.highlightableTurquoise !== undefined) this.highlightableTurquoise = element.highlightableTurquoise;
      if (element?.highlightableYellow !== undefined) this.highlightableYellow = element.highlightableYellow;
      if (element?.hasSelectionPopup !== undefined) this.hasSelectionPopup = element.hasSelectionPopup;
      if (element?.columnCount !== undefined) this.columnCount = element.columnCount;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 98,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps({
        marginBottom: { value: 10, unit: 'px' },
        ...element?.position
      });
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 135
      };
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

  getElementComponent(): Type<ElementComponent> {
    return TextComponent;
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
  position?: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isTextProperties(blueprint?: Partial<TextProperties>): blueprint is TextProperties {
  if (!blueprint) return false;
  return blueprint.text !== undefined &&
    blueprint.markingMode !== undefined &&
    blueprint.markingPanels !== undefined &&
    blueprint.highlightableOrange !== undefined &&
    blueprint.highlightableTurquoise !== undefined &&
    blueprint.highlightableYellow !== undefined &&
    blueprint.hasSelectionPopup !== undefined &&
    blueprint.columnCount !== undefined &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling?.lineHeight !== undefined;
}
