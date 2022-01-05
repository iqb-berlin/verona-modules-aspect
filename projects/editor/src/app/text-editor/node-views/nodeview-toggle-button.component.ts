import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';
import { ToggleButtonElement } from '../../../../../common/ui-elements/toggle-button/toggle-button';

@Component({
  selector: 'app-nodeview-toggle-button',
  template: `
    <app-toggle-button [style.display]="'inline-block'"
                       [elementModel]="model"
                       [matTooltip]="'ID: ' + node.attrs.id">
    </app-toggle-button>
  `
})
export class NodeviewToggleButtonComponent extends AngularNodeViewComponent {
  model: ToggleButtonElement = new ToggleButtonElement({
    type: 'toggle-button'
  });
}
