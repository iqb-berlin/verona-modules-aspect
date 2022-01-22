import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ValueChangeElement } from '../models/uI-element';
import { ToggleButtonElement } from '../ui-elements/toggle-button/toggle-button';
import { TextFieldSimpleElement } from '../ui-elements/textfield-simple/text-field-simple-element';
import { DropListSimpleElement } from '../ui-elements/drop-list-simple/drop-list-simple';
import { ElementComponent } from '../directives/element-component.directive';

@Component({
  selector: 'app-compound-child-overlay',
  template: `
    <div [style.border]="isSelected ? 'purple solid 1px' : ''"
         [style.border-radius.px]="3"
         (click)="elementSelected.emit(this); $event.stopPropagation();">
      <app-toggle-button *ngIf="element.type === 'toggle-button'" #childComponent
                         [style.pointer-events]="editorMode ? 'none' : 'auto'"
                         [parentForm]="parentForm"
                         [style.display]="'inline-block'"
                         [style.vertical-align]="'middle'"
                         [elementModel]="$any(element)"
                         (elementValueChanged)="elementValueChanged.emit($event)">
      </app-toggle-button>
      <app-text-field-simple *ngIf="element.type === 'text-field'" #childComponent
                             [style.pointer-events]="editorMode ? 'none' : 'auto'"
                             [parentForm]="parentForm"
                             [style.display]="'inline-block'"
                             [elementModel]="$any(element)"
                             (elementValueChanged)="elementValueChanged.emit($event)">
      </app-text-field-simple>
      <app-drop-list-simple *ngIf="element.type === 'drop-list'" #childComponent
                            [style.pointer-events]="editorMode ? 'none' : 'auto'"
                            [parentForm]="parentForm"
                            [style.display]="'inline-block'"
                            [style.vertical-align]="'middle'"
                            [elementModel]="$any(element)"
                            (elementValueChanged)="elementValueChanged.emit($event)">
      </app-drop-list-simple>
    </div>
  `
})
export class CompoundChildOverlayComponent {
  @Input() element!: ToggleButtonElement | TextFieldSimpleElement | DropListSimpleElement;
  @Input() parentForm!: FormGroup;
  @Input() editorMode: boolean = false;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() elementSelected = new EventEmitter<CompoundChildOverlayComponent>();
  @ViewChild('childComponent') childComponent!: ElementComponent;

  isSelected: boolean = false;

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
  }
}
