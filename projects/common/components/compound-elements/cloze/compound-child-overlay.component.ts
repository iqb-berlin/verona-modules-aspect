import {
  ChangeDetectorRef,
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { ValueChangeElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

@Component({
  selector: 'aspect-compound-child-overlay',
  template: `
    <div [style.border]="isSelected ? 'purple solid 1px' : ''"

         (click)="elementSelected.emit(this); $event.stopPropagation();">
      <aspect-text-field-simple *ngIf="element.type === 'text-field-simple'" #childComponent
                                [style.pointer-events]="editorMode ? 'none' : 'auto'"
                                [parentForm]="parentForm"
                                [elementModel]="$any(element)"
                                [style.width.px]="element.width"
                                [style.height.px]="element.height">
      </aspect-text-field-simple>
      <aspect-drop-list *ngIf="element.type === 'drop-list'" #childComponent
                               [clozeContext]="true"
                               [style.pointer-events]="editorMode ? 'none' : 'auto'"
                               [parentForm]="parentForm"
                               [elementModel]="$any(element)"
                               [style.width.px]="element.width"
                               [style.height.px]="element.height">
      </aspect-drop-list>
      <aspect-toggle-button *ngIf="element.type === 'toggle-button'" #childComponent
                            [style.pointer-events]="editorMode ? 'none' : 'auto'"
                            [parentForm]="parentForm"
                            [elementModel]="$any(element)"
                            [style.width]="element.dynamicWidth ? 'unset' : element.width+'px'"
                            [style.height.px]="element.height">
      </aspect-toggle-button>
      <aspect-button *ngIf="element.type === 'button'" #childComponent
                     [style.pointer-events]="editorMode ? 'none' : 'auto'"
                     [elementModel]="$any(element)"
                     [style.width.px]="element.width"
                     [style.height.px]="element.height">
      </aspect-button>
    </div>
  `,
  styles: [
    ':host div > * {display: block;}'
  ]
})
export class CompoundChildOverlayComponent { // TODO rename to ClozeChildOverlay
  @Input() element!: ToggleButtonElement | TextFieldSimpleElement | DropListElement;
  @Input() parentForm!: FormGroup;
  @Input() editorMode: boolean = false;
  @Input() lineHeight!: number;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() elementSelected = new EventEmitter<CompoundChildOverlayComponent>();
  @ViewChild('childComponent') childComponent!: ElementComponent;

  isSelected: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
