import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-toggle-button',
  template: `
    <aspect-toggle-button [style.display]="'inline-block'"
                          [style.vertical-align]="'middle'"
                          [elementModel]="node.attrs.model"
                          [matTooltip]="'ID: ' + node.attrs.model.id">
    </aspect-toggle-button>
  `
})
export class ToggleButtonNodeviewComponent extends AngularNodeViewComponent { }
