import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { UnitService } from 'editor/src/app/services/unit.service';
import { TextFieldProperties } from 'common/models/elements/text-field';
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
}
