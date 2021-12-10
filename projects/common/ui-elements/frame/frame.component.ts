import { Component, Input } from '@angular/core';
import { FrameElement } from './frame-element';
import { ElementComponent } from '../../directives/element-component.directive';

@Component({
  selector: 'app-frame',
  template: `
    <div [style.width]="elementModel.borderStyle !== 'hidden' ?
                            'calc(100% - ' + (elementModel.borderWidth * 2) + 'px)' :
                            '100%'"
         [style.height]="elementModel.borderStyle !== 'hidden' ?
                            'calc(100% - ' + (elementModel.borderWidth * 2) + 'px)' :
                            '100%'"
         [style.border-style]="elementModel.borderStyle"
         [style.border-width.px]="elementModel.borderStyle !== 'hidden' ? elementModel.borderWidth : ''"
         [style.border-color]="elementModel.borderColor"
         [style.border-radius.px]="elementModel.borderRadius"
         [style.background-color]="elementModel.surfaceProps.backgroundColor">
  </div>
  `
})
export class FrameComponent extends ElementComponent {
  @Input() elementModel!: FrameElement;
}
