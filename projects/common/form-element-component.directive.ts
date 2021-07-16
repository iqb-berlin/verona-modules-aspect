import { Directive, OnInit } from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn
} from '@angular/forms';
import { pairwise } from 'rxjs/operators';
import { UnitUIElement } from './unit';
import { FormService } from './form.service';

@Directive()
export abstract class FormElementComponent implements OnInit {
  abstract elementModel: UnitUIElement;
  parentForm!: FormGroup;
  defaultValue!: unknown;
  formElementControl!: FormControl;

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    const formControl = new FormControl(this.defaultValue, this.getValidations());
    const id = this.elementModel.id;
    this.formService.registerFormControl({ id, formControl });
    this.formElementControl = this.getFormControl(id);
    this.formElementControl.valueChanges
      .pipe(pairwise())
      .subscribe(
        ([prevValue, nextValue] : [unknown, unknown]) => this.onValueChange([prevValue, nextValue])
      );
  }

  // TODO: get from elementModel examples, example: [Validators.requiredTrue, Validators.required]
  private getValidations = (): ValidatorFn[] => [];

  private getFormControl(id: string): FormControl {
    // workaround for editor
    return (this.parentForm) ? this.parentForm.controls[id] as FormControl : new FormControl();
  }

  private onValueChange(values: [unknown, unknown]): void {
    const element = this.elementModel.id;
    this.formService.changeElementValue({ id: element, values });
  }
}
