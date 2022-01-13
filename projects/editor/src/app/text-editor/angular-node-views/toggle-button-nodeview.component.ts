import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'app-nodeview-toggle-button',
  template: `
    <app-toggle-button [style.display]="'inline-block'"
                       [elementModel]="node.attrs.model"
                       [matTooltip]="'ID: ' + node.attrs.model.id">
    </app-toggle-button>
  `
})
export class ToggleButtonNodeviewComponent extends AngularNodeViewComponent { }
