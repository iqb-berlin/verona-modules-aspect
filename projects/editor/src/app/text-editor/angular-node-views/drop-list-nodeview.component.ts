import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-drop-list',
  template: `
    <div [style.display]="'inline-block'"
         [style.vertical-align]="'middle'"
         [style.width.px]="node.attrs.model.dimensions.width"
         [style.height.px]="node.attrs.model.dimensions.height">
      <aspect-drop-list [elementModel]="node.attrs.model"
                        [matTooltip]="'ID: ' + node.attrs.model.id">
      </aspect-drop-list>
    </div>
  `
})
export class DropListNodeviewComponent extends AngularNodeViewComponent {}
