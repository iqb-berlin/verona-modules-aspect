import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';
import { DropListSimpleElement } from '../../../../../common/ui-elements/drop-list-simple/drop-list-simple';

@Component({
  selector: 'app-nodeview-drop-list',
  template: `
    <div [style.display]="'inline-block'"
         [style.vertical-align]="'middle'"
         [style.width.px]="model.width"
         [style.height.px]="model.height">
      <app-drop-list-simple [elementModel]="model"
                            [matTooltip]="'ID: ' + node.attrs.id">
      </app-drop-list-simple>
    </div>
  `
})
export class NodeviewDropListComponent extends AngularNodeViewComponent {
  model: DropListSimpleElement = new DropListSimpleElement({
    type: 'drop-list',
    height: 25,
    width: 100
  });
}
