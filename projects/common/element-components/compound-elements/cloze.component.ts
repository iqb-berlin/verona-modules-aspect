import {
  Component, EventEmitter, Output, QueryList, ViewChildren
} from '@angular/core';
import { ClozeElement } from '../../models/compound-elements/cloze-element';
import { CompoundElementComponent } from './compound-element.directive';
import { InputElement } from '../../models/uI-element';
import { FormElementComponent } from '../../form-element-component.directive';

@Component({
  selector: 'app-cloze',
  template: `
    <p *ngFor="let paragraph of elementModel.parts; let i = index"
       [style.line-height.px]="elementModel.fontSize + 15"
       [style.color]="elementModel.fontColor"
       [style.font-family]="elementModel.font"
       [style.font-size.px]="elementModel.fontSize"
       [style.font-weight]="elementModel.bold ? 'bold' : ''"
       [style.font-style]="elementModel.italic ? 'italic' : ''"
       [style.text-decoration]="elementModel.underline ? 'underline' : ''">
      <ng-container *ngFor="let part of paragraph; let j = index">

        <span *ngIf="part.type === 'text'"
             [innerHTML]="part.value">
        </span>

        <span (click)="allowClickThrough || selectElement($any(part.value), $event)">
          <app-dropdown *ngIf="part.type === 'dropdown'" #drowdownComponent
                        [parentForm]="parentForm"
                        [style.display]="'inline-block'"
                        [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                        [elementModel]="$any(part.value)"
                        (elementValueChanged)="elementValueChanged.emit($event)">
          </app-dropdown>
          <app-text-field *ngIf="part.type === 'text-field'" #textfieldComponent
                          [parentForm]="parentForm"
                          [style.vertical-align]="'sub'"
                          [style.display]="'inline-block'"
                          [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                          [elementModel]="$any(part.value)"
                          (elementValueChanged)="elementValueChanged.emit($event)">
          </app-text-field>
          <div *ngIf="part.type === 'drop-list'" [style.display]="'inline-block'"
               [style.vertical-align]="'middle'"
               [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
               [style.width.px]="$any(part.value).width"
               [style.height.px]="$any(part.value).height">
            <app-drop-list #droplistComponent
                           [parentForm]="parentForm"
                           (elementValueChanged)="elementValueChanged.emit($event)"
                           [elementModel]="$any(part.value)">
            </app-drop-list>
          </div>
        </span>
      </ng-container>
    </p>
  `,
  styles: [
    ':host ::ng-deep app-text-field .mat-form-field-wrapper {padding-bottom: 0; margin: 0}',
    ':host ::ng-deep app-drop-list .cdk-drop-list {height: 100%; width: 100%;}',
    ':host ::ng-deep app-drop-list .item {padding: 0 10px; height: 30px; line-height: 30px; text-align: center;}',
    'p {margin: 0}'
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
