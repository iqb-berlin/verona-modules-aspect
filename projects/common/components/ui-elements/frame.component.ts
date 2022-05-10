import { Component, Input } from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { FrameElement } from 'common/classes/element';

@Component({
  selector: 'aspect-frame',
  template: `
    <div [style.width]="'calc(100% - ' + (elementModel.styling.borderWidth * 2) + 'px)'"
         [style.height]="'calc(100% - ' + (elementModel.styling.borderWidth * 2) + 'px)'"
         [style.border-style]="elementModel.styling.borderStyle"
         [style.border-width.px]="elementModel.styling.borderWidth"
         [style.border-color]="elementModel.styling.borderColor"
         [style.border-radius.px]="elementModel.styling.borderRadius"
         [style.background-color]="elementModel.styling.backgroundColor">
    </div>
  `
})
export class FrameComponent extends ElementComponent {
  @Input() elementModel!: FrameElement;
}
