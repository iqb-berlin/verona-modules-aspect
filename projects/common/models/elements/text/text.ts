import { Type } from '@angular/core';
import {
  PositionedUIElement,
  UIElement, UIElementProperties, UIElementType
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextComponent } from 'common/components/text/text.component';

import { AnswerScheme } from 'common/models/elements/answer-scheme-interfaces';
import {
  BasicStyles,
  PositionProperties
} from 'common/models/elements/property-group-interfaces';

export class TextElement extends UIElement implements PositionedUIElement, TextProperties {
  type: UIElementType = 'text';
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

  constructor(element: TextProperties) {
    super(element);
    this.text = element.text;
    this.highlightableOrange = element.highlightableOrange;
    this.highlightableTurquoise = element.highlightableTurquoise;
    this.highlightableYellow = element.highlightableYellow;
    this.hasSelectionPopup = element.hasSelectionPopup;
    this.columnCount = element.columnCount;
    this.position = element.position;
    this.styling = element.styling;
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
