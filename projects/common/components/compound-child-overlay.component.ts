import {
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from '../directives/element-component.directive';
import {
  DropListSimpleElement,
  TextFieldSimpleElement,
  ToggleButtonElement,
  ValueChangeElement
} from '../interfaces/elements';

@Component({
  selector: 'aspect-compound-child-overlay',
  template: `
    <div [style.border]="isSelected ? 'purple solid 1px' : ''"
         [style.border-radius.px]="3"
         (click)="elementSelected.emit(this); $event.stopPropagation();">
      <aspect-toggle-button *ngIf="element.type === 'toggle-button'" #childComponent
                         [style.pointer-events]="editorMode ? 'none' : 'auto'"
                         [parentForm]="parentForm"
                         [style.display]="'inline-block'"
                         [style.vertical-align]="'middle'"
                         [elementModel]="$any(element)"
                         (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-toggle-button>
      <aspect-text-field-simple *ngIf="element.type === 'text-field'" #childComponent
                             [style.pointer-events]="editorMode ? 'none' : 'auto'"
                             [parentForm]="parentForm"
                             [style.display]="'inline-block'"
                             [elementModel]="$any(element)"
                             (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-text-field-simple>
      <aspect-drop-list-simple *ngIf="element.type === 'drop-list'" #childComponent
                            [style.pointer-events]="editorMode ? 'none' : 'auto'"
                            [parentForm]="parentForm"
                            [style.display]="'inline-block'"
                            [style.vertical-align]="'middle'"
                            [elementModel]="$any(element)"
                            (elementValueChanged)="elementValueChanged.emit($event)">
      </aspect-drop-list-simple>
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
