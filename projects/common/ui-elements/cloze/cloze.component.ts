import {
  Component, EventEmitter, Output, QueryList, ViewChildren
} from '@angular/core';
import { ClozeElement } from './cloze-element';
import { CompoundElementComponent } from '../../directives/compound-element.directive';
import { InputElement } from '../../models/uI-element';
import { FormElementComponent } from '../../directives/form-element-component.directive';

@Component({
  selector: 'app-cloze',
  template: `
    <p *ngFor="let paragraph of elementModel.parts; let i = index"
       [style.line-height.%]="elementModel.fontProps.lineHeight"
       [style.color]="elementModel.fontProps.fontColor"
       [style.font-family]="elementModel.fontProps.font"
       [style.font-size.px]="elementModel.fontProps.fontSize"
       [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
       [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
       [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
      <ng-container *ngFor="let part of paragraph; let j = index">

        <span *ngIf="part.type === 'p'"
             [innerHTML]="part.value"
             [style]="part.style">
        </span>

        <h1 *ngIf="part.type === 'h1'"
            [innerHTML]="part.value"
            [style.display]="'inline'"
            [style]="part.style">
        </h1>
        <h2 *ngIf="part.type === 'h2'"
            [innerHTML]="part.value"
            [style.display]="'inline'"
            [style]="part.style">
        </h2>
        <h3 *ngIf="part.type === 'h3'"
            [innerHTML]="part.value"
            [style.display]="'inline'"
            [style]="part.style">
        </h3>
        <h4 *ngIf="part.type === 'h4'"
            [innerHTML]="part.value"
            [style.display]="'inline'"
            [style]="part.style">
        </h4>

        <span (click)="allowClickThrough || selectElement($any(part.value), $event)">
          <app-dropdown *ngIf="part.type === 'dropdown'" #drowdownComponent
                        [parentForm]="parentForm"
                        [style.display]="'inline-block'"
                        [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                        [elementModel]="$any(part.value)"
                        (elementValueChanged)="elementValueChanged.emit($event)">
          </app-dropdown>
          <app-text-field-simple *ngIf="part.type === 'text-field'" #textfieldComponent
                          [parentForm]="parentForm"
                          [style.display]="'inline-block'"
                          [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                          [elementModel]="$any(part.value)"
                          (elementValueChanged)="elementValueChanged.emit($event)">
          </app-text-field-simple>
          <div *ngIf="part.type === 'drop-list'"
               [style.display]="'inline-block'"
               [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
               [style.vertical-align]="'middle'"
               [style.width.px]="$any(part.value).width"
               [style.height.px]="$any(part.value).height">
            <app-drop-list-simple #droplistComponent
                           [parentForm]="parentForm"
                           (elementValueChanged)="elementValueChanged.emit($event)"
                           [elementModel]="$any(part.value)">
            </app-drop-list-simple>
          </div>
        </span>
      </ng-container>
    </p>
  `,
  styles: [
    ':host ::ng-deep app-text-field {vertical-align: middle}',
    ':host ::ng-deep app-text-field .mat-form-field-wrapper {height: 100%; padding-bottom: 0; margin: 0}',
    ':host ::ng-deep app-text-field .mat-form-field {height: 100%}',
    ':host ::ng-deep app-text-field .mat-form-field-flex {height: 100%}',
    'p {margin: 0}',
    'p span {font-size: inherit}'
  ]
})
export class ClozeComponent extends CompoundElementComponent {
  elementModel!: ClozeElement;
  @Output() elementSelected = new EventEmitter<{ element: ClozeElement, event: MouseEvent }>();
  @ViewChildren('drowdownComponent, textfieldComponent, droplistComponent')
  compoundChildren!: QueryList<FormElementComponent>;

  getFormElementModelChildren(): InputElement[] {
    return this.elementModel.childElements;
  }

  selectElement(element: ClozeElement, event: MouseEvent): void {
    this.elementSelected.emit({ element: element, event: event });
  }
}
