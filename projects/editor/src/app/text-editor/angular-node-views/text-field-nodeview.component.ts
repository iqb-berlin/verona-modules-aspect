import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'app-nodeview-text-field',
  template: `
    <app-text-field-simple [style.display]="'inline-block'"
                           [elementModel]="node.attrs.model"
                           [matTooltip]="'ID: ' + node.attrs.model.id">
    </app-text-field-simple>
  `
})
export class TextFieldNodeviewComponent extends AngularNodeViewComponent { }
