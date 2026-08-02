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
   * other half: `min="0"` makes -1 invalid, nothing is written while it is being typed, and the box
   * must not go on showing a value the model never took (#1154).
   *
   * The warning is raised from here rather than on every keystroke, because typing `-50` passes
   * through `-5` and put one warning on screen after the other for a single edit.
   */
  revertIfInvalid(control: NgModel, property: keyof TextFieldProperties,
                  modelValue: number | null | undefined): void {
    if (!control.invalid) return;
    this.updateModel.emit({ property, value: control.value, isInputValid: false });
    // `emitViewToModelChange: false`, or putting the box back would emit the refused value again.
    control.control.setValue(modelValue, { emitViewToModelChange: false, emitEvent: false });
  }
}
