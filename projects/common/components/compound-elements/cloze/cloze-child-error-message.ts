import { Component, Input } from '@angular/core';
import { InputElement } from 'common/models/elements/element';
import { UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'aspect-cloze-child-error-message',
    template: `
    {{elementFormControl.errors ? (elementFormControl.errors | errorTransform: elementModel) : null}}
  `,
    host: {
        '[style.top.px]': 'elementModel.dimensions.height + 5'
    },
    styles: [`
    :host {
      padding: 0 5px;
      position: absolute;
      border: 1px solid #f44336;
      font-size: 12px;
      background-color: rgb(255, 255, 255, 0.9);
      color: #f44336;
      z-index: 1;
    }
  `],
    standalone: false
})
export class ClozeChildErrorMessage {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;
}
