import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
    selector: 'aspect-nodeview-checkbox',
    template: `
    <aspect-checkbox [style.display]="'inline-block'"
                   [elementModel]="node.attrs.model"
                   [matTooltip]="'ID: ' + node.attrs.model.id">
    </aspect-checkbox>
  `,
    styles: [
        ':host {display: inline-block;}',
        ':host ::ng-deep mat-checkbox .mdc-form-field {vertical-align: baseline;}',
        ':host ::ng-deep mat-checkbox .mdc-checkbox {display: none;}'
    ],
    standalone: false
})
export class CheckboxNodeviewComponent extends AngularNodeViewComponent { }
