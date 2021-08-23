import { Component } from '@angular/core';
import { CanvasElementOverlay } from './canvas-element-overlay';

@Component({
  selector: 'app-dynamic-view-only-element-overlay',
  template: `
    <div #draggableElement [style.height.%]="100">
      <ng-template #elementContainer></ng-template>
    </div>
  `
})
export class DynamicViewOnlyElementOverlayComponent extends CanvasElementOverlay { }
