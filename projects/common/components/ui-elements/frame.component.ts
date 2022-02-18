import { Component, Input } from '@angular/core';
import { ElementComponent } from '../../directives/element-component.directive';
import { FrameElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-frame',
  template: `
    <div [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                 elementModel.positionProps.fixedSize"
         [style.width]="elementModel.positionProps.fixedSize ?
            elementModel.width + 'px' :
            'calc(100% - ' + (elementModel.styles.borderWidth * 2) + 'px)'"
         [style.height]="elementModel.positionProps.fixedSize ?
            elementModel.height + 'px' :
            'calc(100% - ' + (elementModel.styles.borderWidth * 2) + 'px)'"
         [style.border-style]="elementModel.styles.borderStyle"
         [style.border-width.px]="elementModel.styles.borderWidth"
         [style.border-color]="elementModel.styles.borderColor"
         [style.border-radius.px]="elementModel.styles.borderRadius"
         [style.background-color]="elementModel.styles.backgroundColor">
  </div>
  `
})
export class FrameComponent extends ElementComponent {
  @Input() elementModel!: FrameElement;
}
