import { Component, EventEmitter, Output } from '@angular/core';
import { ClozeElement } from '../../models/compound-elements/cloze-element';
import { CompoundElementComponent } from './compound-element.directive';
import { InputElement } from '../../models/uI-element';

@Component({
  selector: 'app-cloze',
  template: `
    <p *ngFor="let paragraph of elementModel.parts; let i = index">
      <ng-container *ngFor="let part of paragraph; let j = index">

        <span *ngIf="part.type === 'text'"
             [innerHTML]="part.value">
        </span>

        <span (click)="selectElement($any(part.value), $event)">
          <app-dropdown *ngIf="part.type === 'dropdown'"
                        [style.display]="'inline-block'"
                        [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                        [elementModel]="$any(part.value)"></app-dropdown>
          <app-text-field *ngIf="part.type === 'text-field'"
                          [style.vertical-align]="'sub'"
                          [style.display]="'inline-block'"
                          [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
                          [elementModel]="$any(part.value)"></app-text-field>
          <div *ngIf="part.type === 'drop-list'" [style.display]="'inline-block'"
               [style.vertical-align]="'middle'"
               [style.pointerEvents]="allowClickThrough ? 'auto' : 'none'"
               [style.width.px]="$any(part.value).width"
               [style.height.px]="$any(part.value).height">
            <app-drop-list [style.pointerEvents]="'none'"
                           [elementModel]="$any(part.value)">
            </app-drop-list>
          </div>
        </span>
      </ng-container>
    </p>
  `,
  styles: [
    ':host ::ng-deep app-text-field .mat-form-field-wrapper {padding-bottom: 0; margin: 0}',
    ':host ::ng-deep app-drop-list .cdk-drop-list {height: 100%; width: 100%;}'
  ]
})
export class ClozeComponent extends CompoundElementComponent {
  elementModel!: ClozeElement;
  @Output() elementSelected = new EventEmitter<{ element: ClozeElement, event: MouseEvent }>();

  getFormElementModelChildren(): InputElement[] {
    return this.elementModel.childElements;
  }

  selectElement(element: ClozeElement, event: MouseEvent): void {
    this.elementSelected.emit({ element: element, event: event });
  }
}
