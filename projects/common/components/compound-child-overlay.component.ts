import {
  ChangeDetectorRef,
  Component, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from '../directives/element-component.directive';
import {
  DropListSimpleElement, TextFieldSimpleElement, ToggleButtonElement, ValueChangeElement
} from '../interfaces/elements';

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
      <aspect-drop-list-simple *ngIf="element.type === 'drop-list-simple'" #childComponent
                               [style.pointer-events]="editorMode ? 'none' : 'auto'"
                               [parentForm]="parentForm"
                               [elementModel]="$any(element)"
                               [style.width.px]="element.width"
                               [style.height.px]="element.height">
      </aspect-drop-list-simple>
      <aspect-toggle-button *ngIf="element.type === 'toggle-button'" #childComponent
                            [style.pointer-events]="editorMode ? 'none' : 'auto'"
                            [parentForm]="parentForm"
                            [elementModel]="$any(element)"
                            [style.width]="element.dynamicWidth ? 'unset' : element.width+'px'"
                            [style.height.px]="element.height">
      </aspect-toggle-button>
    </div>
  `,
  styles: [
    ':host {vertical-align: middle;}',
    ':host > div {border-radius: 3px;}',
    ':host div > * {display: inline-block; padding-bottom: 2px; box-sizing: border-box;}',
    'aspect-drop-list-simple, aspect-text-field-simple {width: 100%; height: 100%;}',
    'aspect-drop-list-simple {line-height: unset; vertical-align: top;}'
  ]
})
export class CompoundChildOverlayComponent {
  @Input() element!: ToggleButtonElement | TextFieldSimpleElement | DropListSimpleElement;
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
