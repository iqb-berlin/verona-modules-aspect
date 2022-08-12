import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, CompoundElement, UIElement,
  PositionedUIElement, PositionProperties, UIElementValue, TextImageLabel, OptionElement
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { ElementComponent } from 'common/directives/element-component.directive';
import { LikertComponent } from 'common/components/compound-elements/likert/likert.component';

export class LikertElement extends CompoundElement implements PositionedUIElement, OptionElement {
  rows: LikertRowElement[] = [];
  options: TextImageLabel[] = [];
  firstColumnSizeRatio: number = 5;
  label: string = 'Optionentabelle Beschriftung';
  label2: string = 'Beschriftung Erste Spalte';
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };

  constructor(element: Partial<LikertElement>, ...args: unknown[]) {
    super({ width: 250, height: 200, ...element }, ...args);
    if (element.options) this.options = [...element.options];
    if (element.firstColumnSizeRatio) this.firstColumnSizeRatio = element.firstColumnSizeRatio;
    this.rows = element.rows !== undefined ? element.rows?.map(row => new LikertRowElement(row, ...args)) : [];
    this.label = element.label !== undefined ? element.label : 'Optionentabelle Beschriftung';
    this.label2 = element.label2 !== undefined ? element.label2 : 'Optionentabelle Erste Spalte';
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: 135,
        lineColoring: true,
        lineColoringColor: '#c9e0e0',
        ...element.styling
      })
    };
  }

  getNewOptionLabel(optionText: string): TextImageLabel {
    return ElementFactory.createOptionLabel(optionText, true) as TextImageLabel;
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
