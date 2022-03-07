import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-text-field',
  template: `
    <aspect-text-field [style.display]="'inline-block'"
                       [isClozeChild]="true"
                       [elementModel]="node.attrs.model"
                       [matTooltip]="'ID: ' + node.attrs.model.id">
    </aspect-text-field>
  `
})
export class TextFieldNodeviewComponent extends AngularNodeViewComponent {
}
