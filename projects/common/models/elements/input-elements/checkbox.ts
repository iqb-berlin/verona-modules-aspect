import { Type } from '@angular/core';
import { ElementFactory } from 'common/util/element.factory';
import {
  BasicStyles, InputElement, PositionedUIElement, PositionProperties, AnswerScheme, AnswerSchemeValue
} from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';

export class CheckboxElement extends InputElement implements PositionedUIElement {
  position: PositionProperties;
  styling: BasicStyles;

  constructor(element: Partial<CheckboxElement>, ...args: unknown[]) {
    super({ width: 215, ...element }, ...args);
    this.position = ElementFactory.initPositionProps(element.position);
    this.styling = ElementFactory.initStylingProps(element.styling);
  }

  hasAnswerScheme(): boolean {
    return Boolean(this.getAnswerScheme);
  }

  getAnswerScheme(): AnswerScheme {
    return {
      id: this.id,
      type: 'boolean',
      format: '',
      multiple: false,
      nullable: false,
      values: this.getAnswerSchemeValues(),
      valuesComplete: true
    };
  }

  private getAnswerSchemeValues(): AnswerSchemeValue[] {
    return [
      { value: 'true', label: `Angekreuzt: ${this.label}` },
      { value: 'false', label: `Nicht Angekreuzt: ${this.label}` }
    ];
  }

  getElementComponent(): Type<ElementComponent> {
    return CheckboxComponent;
  }
}
