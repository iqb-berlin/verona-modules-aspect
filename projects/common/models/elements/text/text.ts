import { Type } from '@angular/core';
import {
  PositionedUIElement,
  UIElement
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextComponent } from 'common/components/text/text.component';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import { BasicStyles, DimensionProperties, PositionProperties } from 'common/models/elements/property-group-interfaces';

export class TextElement extends UIElement implements PositionedUIElement {
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

  constructor(element: Partial<TextElement>) {
    super({ dimensions: { height: 98 } as DimensionProperties, ...element });
    if (element.text) this.text = element.text;
    if (element.highlightableOrange) this.highlightableOrange = element.highlightableOrange;
    if (element.highlightableTurquoise) this.highlightableTurquoise = element.highlightableTurquoise;
    if (element.highlightableYellow) this.highlightableYellow = element.highlightableYellow;
    if (element.hasSelectionPopup !== undefined) this.hasSelectionPopup = element.hasSelectionPopup;
    if (element.columnCount) this.columnCount = element.columnCount;
    this.position = UIElement.initPositionProps(element.position);
    this.styling = {
      ...UIElement.initStylingProps({
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
      format: 'text-selection',
      multiple: true,
      nullable: false,
      values: [],
      valuesComplete: false
    };
  }

  getElementComponent(): Type<ElementComponent> {
    return TextComponent;
  }
}
