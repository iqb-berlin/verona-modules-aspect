import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';
import { TextFieldSimpleElement } from '../../../../../common/ui-elements/textfield-simple/text-field-simple-element';

@Component({
  selector: 'app-nodeview-text-field',
  template: `
    <app-text-field-simple [style.display]="'inline-block'"
                           [elementModel]="model"
                           [matTooltip]="'ID: ' + node.attrs.id">
    </app-text-field-simple>
  `
})
export class NodeviewTextFieldComponent extends AngularNodeViewComponent {
  model: TextFieldSimpleElement = new TextFieldSimpleElement({
    type: 'text-field'
  });
}
