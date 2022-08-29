import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, PositionedUIElement,
  PositionProperties, AnswerScheme, UIElement
} from 'common/models/elements/element';
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

  constructor(element: Partial<TextElement>, ...args: unknown[]) {
    super({ height: 98, ...element }, ...args);
    if (element.text) this.text = element.text;
    if (element.highlightableOrange) this.highlightableOrange = element.highlightableOrange;
    if (element.highlightableTurquoise) this.highlightableTurquoise = element.highlightableTurquoise;
    if (element.highlightableYellow) this.highlightableYellow = element.highlightableYellow;
    if (element.columnCount) this.columnCount = element.columnCount;
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = {
      ...ElementFactory.initStylingProps({
        backgroundColor: 'transparent',
        lineHeight: element.styling?.lineHeight || 135,
        ...element.styling
      })
    };
  }

  private isHighlightable(): boolean {
    return this.highlightableYellow ||
        this.highlightableTurquoise ||
        this.highlightableOrange;
  }

  hasAnswerScheme(): boolean {
    return this.isHighlightable();
  }

  getAnswerScheme(): AnswerScheme {
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
