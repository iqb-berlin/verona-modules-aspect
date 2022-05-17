import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, CompoundElement,
  PositionedUIElement,
  PositionProperties,
  TextImageLabel,
  UIElement
} from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { LikertComponent } from 'common/components/compound-elements/likert/likert.component';

export class LikertElement extends CompoundElement implements PositionedUIElement {
  rows: LikertRowElement[] = [];
  columns: TextImageLabel[] = [];
  firstColumnSizeRatio: number = 5;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
    lineColoring: boolean;
    lineColoringColor: string;
  };

  constructor(element: Partial<LikertElement>) {
    super({ width: 250, height: 200, ...element });
    Object.assign(this, element);
    this.rows = element.rows !== undefined ? element.rows?.map(row => new LikertRowElement(row)) : [];
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

  getComponentFactory(): Type<ElementComponent> {
    return LikertComponent;
  }

  getChildElements(): UIElement[] {
    return this.rows;
  }
}
