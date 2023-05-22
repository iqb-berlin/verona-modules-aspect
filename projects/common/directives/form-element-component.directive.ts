import { Directive, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';

@Directive()
export abstract class FormElementComponent extends ElementComponent implements OnInit {
  @Input() parentForm!: UntypedFormGroup;
  elementFormControl!: UntypedFormControl;

  ngOnInit(): void {
    this.elementFormControl = this.parentForm ?
      this.parentForm.controls[this.elementModel.id] as UntypedFormControl :
      new UntypedFormControl(this.elementModel.value);
  }
}
