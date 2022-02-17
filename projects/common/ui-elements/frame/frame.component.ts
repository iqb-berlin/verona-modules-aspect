import { Component, Input } from '@angular/core';
import { FrameElement } from './frame-element';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'aspect-frame',
  template: `
    <div [style.width]="'calc(100% - ' + (elementModel.borderWidth * 2) + 'px)'"
         [style.height]="'calc(100% - ' + (elementModel.borderWidth * 2) + 'px)'"
         [style.border-style]="elementModel.borderStyle"
         [style.border-width.px]="elementModel.borderWidth"
         [style.border-color]="elementModel.borderColor"
         [style.border-radius.px]="elementModel.borderRadius"
         [style.background-color]="elementModel.surfaceProps.backgroundColor">
    </div>
  `
})
export class FrameComponent extends ElementComponent {
  @Input() elementModel!: FrameElement;
}
