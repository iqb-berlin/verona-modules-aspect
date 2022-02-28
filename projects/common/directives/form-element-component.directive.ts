import { Directive, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';

@Directive()
export abstract class FormElementComponent extends ElementComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  elementFormControl!: FormControl;

  ngOnInit(): void {
    this.elementFormControl = (this.parentForm) ?
      this.parentForm.controls[this.elementModel.id] as FormControl :
      new FormControl({});
  }
}
