import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormControl, NgModel } from '@angular/forms';
import { UnitService } from 'editor/src/app/services/unit.service';
import { TextFieldProperties } from 'common/models/elements/text-input-group-elements/text-field';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-text-field-element-properties',
  templateUrl: './text-field-element-properties.component.html',
  standalone: false
})

export class TextFieldElementPropertiesComponent implements OnInit, OnChanges {
  @Input() combinedProperties!: Merged<TextFieldProperties>;
  @Output() updateModel = new EventEmitter<{
    property: keyof TextFieldProperties;
    value: string | number | boolean | string[] | null;
    isInputValid?: boolean | null;
  }>();

  regexPatternFormControl!: FormControl;

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.regexPatternFormControl = new FormControl(this.combinedProperties.pattern);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.combinedProperties && this.regexPatternFormControl) {
      this.regexPatternFormControl.setValue(this.combinedProperties.pattern, { emitEvent: false });
    }
  }

  validateRegex(event: FocusEvent) {
    const value = (event?.target as HTMLInputElement).value;
    try {
      // eslint-disable-next-line no-new
      new RegExp(value);
      this.updateModel.emit({ property: 'pattern', value: value });
    } catch (e) {
      this.regexPatternFormControl.setErrors({ invalidPattern: true });
    }
  }

  /**
   * A length limit field has been left.
   *
   * Unlike the `number` properties elsewhere in the panel these are `number | null`, where an empty
   * box legitimately means "no limit" - so there is nothing to substitute. What is needed is the
   * other half: `min="0"` makes -1 invalid, the guard in the host refuses it, and the box must not
   * go on showing a value the model never took (#1154).
   */
  // eslint-disable-next-line class-methods-use-this
  revertIfInvalid(control: NgModel, modelValue: number | null | undefined): void {
    // `emitViewToModelChange: false`, or putting the box back would emit the refused value again.
    if (control.invalid) control.control.setValue(modelValue, { emitViewToModelChange: false, emitEvent: false });
  }
}
