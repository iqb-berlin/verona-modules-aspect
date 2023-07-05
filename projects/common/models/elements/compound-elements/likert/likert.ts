import { Type } from '@angular/core';
import {
  CompoundElement, UIElement,
  PositionedUIElement, UIElementValue, OptionElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { ElementComponent } from 'common/directives/element-component.directive';
import { LikertComponent } from 'common/components/compound-elements/likert/likert.component';
import {
  BasicStyles, PositionProperties
} from 'common/models/elements/property-group-interfaces';
import { TextImageLabel } from 'common/models/elements/label-interfaces';

export class LikertElement extends CompoundElement implements PositionedUIElement, OptionElement, LikertProperties {
  type: UIElementType = 'likert';
  rows: LikertRowElement[];
  options: TextImageLabel[];
  firstColumnSizeRatio: number;
  label: string;
  label2: string;
  stickyHeader: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };

  constructor(element: LikertProperties) {
    super(element);
    this.options = element.options;
    this.firstColumnSizeRatio = element.firstColumnSizeRatio;
    this.rows = element.rows.map(row => new LikertRowElement(row));
    this.label = element.label;
    this.label2 = element.label2;
    this.stickyHeader = element.stickyHeader;
    this.position = element.position;
    this.styling = element.styling;
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return UIElement.createOptionLabel(optionText, true) as TextImageLabel;
  }

  setProperty(property: string, value: UIElementValue): void {
    super.setProperty(property, value);
    if (property === 'rows') {
      this.rows = value as LikertRowElement[];
    }
    if (property === 'options') {
      this.getChildElements().forEach(childElement => childElement.setProperty('columnCount', this.options.length));
    }
    if (property === 'readOnly') {
      this.getChildElements().forEach(childElement => childElement.setProperty('readOnly', value));
    }
  }

  getElementComponent(): Type<ElementComponent> {
    return LikertComponent;
  }

  getChildElements(): UIElement[] {
    return this.rows;
  }
}

export interface LikertProperties extends UIElementProperties {
  rows: LikertRowElement[];
  options: TextImageLabel[];
  firstColumnSizeRatio: number;
  label: string;
  label2: string;
  stickyHeader: boolean;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };
}
