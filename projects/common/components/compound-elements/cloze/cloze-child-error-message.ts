import {
  AfterViewInit, Component, ElementRef, Input
} from '@angular/core';
import { InputElement } from 'common/models/elements/element';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'aspect-cloze-child-error-message',
  template: `
    {{elementFormControl.errors ? (elementFormControl.errors | errorTransform: elementModel) : null}}
  `,
  host: {
    '[style.top.px]': 'elementModel.dimensions ? elementModel.dimensions.height + 5 : undefined',
    '[style.bottom.px]': 'elementModel.dimensions ? undefined : -20'
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
export class ClozeChildErrorMessage implements AfterViewInit {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;

  elementHeight: number = 0;

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.elementHeight = rect.height;
  }
}
