import { Component } from '@angular/core';
import { CanvasElementOverlay } from './canvas-element-overlay';

@Component({
  selector: 'app-view-only-element-overlay',
  template: `
    <div [style.position]="'absolute'"
         [style.width.px]="element.width"
         [style.height.px]="element.height"
         [style.left.px]="element.xPosition"
         [style.top.px]="element.yPosition"
         [style.z-index]="element.zIndex">
      <ng-template #elementContainer></ng-template>
    </div>
  `
})
export class StaticViewOnlyElementOverlayComponent extends CanvasElementOverlay {

}
