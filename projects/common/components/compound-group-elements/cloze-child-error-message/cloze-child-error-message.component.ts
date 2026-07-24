import {
  AfterViewInit, Component, ElementRef, Input
} from '@angular/core';
import { InputElement } from 'common/models/elements/element';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'aspect-cloze-child-error-message',
  templateUrl: './cloze-child-error-message.component.html',
  styleUrls: ['./cloze-child-error-message.component.scss'],
  host: {
    '[style.top.px]': 'elementModel.dimensions ? elementModel.dimensions.height + 5 : undefined',
    '[style.bottom.px]': 'elementModel.dimensions ? undefined : -20'
  },
  standalone: false
})
export class ClozeChildErrorMessageComponent implements AfterViewInit {
  @Input() elementModel!: InputElement;
  @Input() elementFormControl!: UntypedFormControl;

  elementHeight: number = 0;

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.elementHeight = rect.height;
  }
}
