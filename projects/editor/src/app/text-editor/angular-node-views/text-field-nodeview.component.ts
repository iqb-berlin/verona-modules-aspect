import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-text-field',
  template: `
    <aspect-text-field-simple [style.display]="'inline-block'"
                              [elementModel]="node.attrs.model"
                              [matTooltip]="'ID: ' + node.attrs.model.id">
    </aspect-text-field-simple>
  `,
  styles: [
    ':host {display: inline-block;}'
  ]
})
export class TextFieldNodeviewComponent extends AngularNodeViewComponent {
}
