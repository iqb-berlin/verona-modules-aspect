import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-drop-list',
  template: `
    <div [style.display]="'inline-block'"
         [style.vertical-align]="'middle'"
         [style.width.px]="node.attrs.model.width"
         [style.height.px]="node.attrs.model.height">
      <aspect-drop-list-simple [elementModel]="node.attrs.model"
                            [matTooltip]="'ID: ' + node.attrs.model.id">
      </aspect-drop-list-simple>
    </div>
  `
})
export class DropListNodeviewComponent extends AngularNodeViewComponent {}
