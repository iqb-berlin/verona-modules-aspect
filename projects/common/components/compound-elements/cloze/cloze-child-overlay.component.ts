import {
  ChangeDetectorRef,
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { ValueChangeElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-compound-child-overlay',
  template: `
    <div [style.border]="isSelected ? 'purple solid 1px' : ''"
         [style.display]="'flex'"
         [style.width]="element.dimensions.isWidthFixed ? element.dimensions.width+'px' : null"
         [style.height]="element.dimensions.isHeightFixed ? element.dimensions.height + 'px' : null"
         [style.min-width]="element.dimensions.minWidth ? element.dimensions.minWidth + 'px' : null"
         [style.max-width]="element.dimensions.maxWidth ? element.dimensions.maxWidth + 'px' : null"
         [style.min-height]="element.dimensions.minHeight ? element.dimensions.minHeight + 'px' : null"
         [style.max-height]="element.dimensions.maxHeight ? element.dimensions.maxHeight + 'px' : null"
         (click)="elementSelected.emit(this); $event.stopPropagation();">
      <aspect-text-field-simple *ngIf="element.type === 'text-field-simple'" #childComponent
                                [style.pointer-events]="editorMode ? 'none' : 'auto'"
                                [parentForm]="parentForm"
                                [elementModel]="$any(element)">
      </aspect-text-field-simple>
      <aspect-drop-list *ngIf="element.type === 'drop-list'" #childComponent
                               [clozeContext]="true"
                               [style.pointer-events]="editorMode ? 'none' : 'auto'"
                               [parentForm]="parentForm"
                               [elementModel]="$any(element)">
      </aspect-drop-list>
      <aspect-toggle-button *ngIf="element.type === 'toggle-button'" #childComponent
                            [style.pointer-events]="editorMode ? 'none' : 'auto'"
                            [parentForm]="parentForm"
                            [elementModel]="$any(element)">
      </aspect-toggle-button>
      <aspect-button *ngIf="element.type === 'button'" #childComponent
                     [style.pointer-events]="editorMode ? 'none' : 'auto'"
                     [elementModel]="$any(element)">
      </aspect-button>
      <aspect-checkbox *ngIf="element.type === 'checkbox'" #childComponent
                       [style.pointer-events]="editorMode ? 'none' : 'auto'"
                       [parentForm]="parentForm"
                       [elementModel]="$any(element)">
      </aspect-checkbox>
    </div>
  `,
  styles: [
    ':host div > * {display: block;}',
    ':host ::ng-deep mat-checkbox .mdc-form-field {vertical-align: baseline;}',
    ':host ::ng-deep mat-checkbox .mdc-checkbox {display: none;}'
  ]
})
export class ClozeChildOverlay {
  @Input() element!: ToggleButtonElement | TextFieldSimpleElement | DropListElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() editorMode: boolean = false;
  @Input() lineHeight!: number;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() elementSelected = new EventEmitter<ClozeChildOverlay>();
  @ViewChild('childComponent') childComponent!: ElementComponent;

  isSelected: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
