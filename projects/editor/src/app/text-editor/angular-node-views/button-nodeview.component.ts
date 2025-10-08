import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
    selector: 'aspect-nodeview-button',
    template: `
    <aspect-button [style.display]="'inline-block'"
                   [elementModel]="node.attrs.model"
                   [matTooltip]="'ID: ' + node.attrs.model.id">
    </aspect-button>
  `,
    styles: [
        ':host {display: inline-block;}'
    ],
    standalone: false
})
export class ButtonNodeviewComponent extends AngularNodeViewComponent { }
