import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles,
  PositionedUIElement,
  PositionProperties, SchemerData, SchemerValue,
  UIElement
} from 'common/models/elements/element';
import { Type } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextComponent } from 'common/components/text/text.component';

export class TextElement extends UIElement implements PositionedUIElement {
  text: string = 'Lorem ipsum dolor sit amet';
  highlightableOrange: boolean = false;
  highlightableTurquoise: boolean = false;
  highlightableYellow: boolean = false;
  columnCount: number = 1;
  position: PositionProperties;
  styling: BasicStyles & {
    lineHeight: number;
  };

  constructor(element: Partial<TextElement>) {
    super({ height: 98, ...element });
    Object.assign(this, element);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: element.styling?.lineHeight || 135,
        ...element.styling
      })
    };
  }

  isHighlightable(): boolean {
    return this.highlightableYellow ||
        this.highlightableTurquoise ||
        this.highlightableOrange;
  }

  hasSchemerData(): boolean {
    return this.isHighlightable();
  }

  getSchemerData(): SchemerData {
    return {
      id: this.id,
      type: 'string',
      format: 'coloredSelectionRange',
      multiple: true,
      nullable: false,
      values: [],
      valuesComplete: false
    };
  }

  getComponentFactory(): Type<ElementComponent> {
    return TextComponent;
  }
}
