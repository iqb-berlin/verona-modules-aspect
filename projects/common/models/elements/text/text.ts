import { Type } from '@angular/core';
import {
  PositionedUIElement,
  UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextComponent } from 'common/components/text/text.component';

import { VariableInfo } from '@iqb/responses';
import {
  BasicStyles, PositionProperties, PropertyGroupGenerators, PropertyGroupValidators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { InstantiationEror } from 'common/util/errors';

export class TextElement extends UIElement implements PositionedUIElement, TextProperties {
  type: UIElementType = 'text';
  text: string = 'Lorem ipsum dolor sit amet';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
  hasSelectionPopup: boolean = true;
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element?: TextProperties) {
    super(element);
    if (element && isValid(element)) {
      this.text = element.text;
      this.highlightableOrange = element.highlightableOrange;
      this.highlightableTurquoise = element.highlightableTurquoise;
      this.highlightableYellow = element.highlightableYellow;
      this.hasSelectionPopup = element.hasSelectionPopup;
      this.columnCount = element.columnCount;
      this.position = { ...element.position };
      this.styling = { ...element.styling };
    } else {
      if (environment.strictInstantiation) {
        throw new InstantiationEror('Error at Text instantiation', element);
      }
      if (element?.text !== undefined) this.text = element.text;
      if (element?.highlightableOrange !== undefined) this.highlightableOrange = element.highlightableOrange;
      if (element?.highlightableTurquoise !== undefined) this.highlightableTurquoise = element.highlightableTurquoise;
      if (element?.highlightableYellow !== undefined) this.highlightableYellow = element.highlightableYellow;
      if (element?.hasSelectionPopup !== undefined) this.hasSelectionPopup = element.hasSelectionPopup;
      if (element?.columnCount !== undefined) this.columnCount = element.columnCount;
      this.dimensions = PropertyGroupGenerators.generateDimensionProps({
        height: 98,
        ...element?.dimensions
      });
      this.position = PropertyGroupGenerators.generatePositionProps(element?.position);
      this.styling = {
        ...PropertyGroupGenerators.generateBasicStyleProps(element?.styling),
        lineHeight: element?.styling?.lineHeight || 135
      };
    }
  }

  getDuplicate(): TextElement {
    return new TextElement(this);
  }

  private isHighlightable(): boolean {
    return this.highlightableYellow ||
        this.highlightableTurquoise ||
        this.highlightableOrange;
  }

  getVariableInfos(): VariableInfo[] {
    if (!this.isHighlightable()) return [];
    return [{
      id: this.id,
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
  highlightableOrange: boolean;
  highlightableTurquoise: boolean;
  highlightableYellow: boolean;
  hasSelectionPopup: boolean;
  columnCount: number;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };
}

function isValid(blueprint?: TextProperties): boolean {
  if (!blueprint) return false;
  return blueprint.text !== undefined &&
    blueprint.highlightableOrange !== undefined &&
    blueprint.highlightableTurquoise !== undefined &&
    blueprint.highlightableYellow !== undefined &&
    blueprint.hasSelectionPopup !== undefined &&
    blueprint.columnCount !== undefined &&
    PropertyGroupValidators.isValidPosition(blueprint.position) &&
    PropertyGroupValidators.isValidBasicStyles(blueprint.styling) &&
    blueprint.styling.lineHeight !== undefined;
}
