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
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { ValueChangeElement } from 'common/interfaces';

@Component({
  selector: 'aspect-compound-child-overlay',
  templateUrl: './cloze-child-overlay.component.html',
  styleUrls: ['./cloze-child-overlay.component.scss'],
  standalone: false
})
export class ClozeChildOverlayComponent {
  @Input() element!: ToggleButtonElement | TextFieldSimpleElement | DropListElement | DropdownElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() editorMode: boolean = false;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() elementSelected = new EventEmitter<ClozeChildOverlayComponent>();
  @ViewChild('childComponent') childComponent!: ElementComponent;

  isSelected: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
