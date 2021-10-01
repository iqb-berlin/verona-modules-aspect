import {
  Directive, EventEmitter, OnDestroy, OnInit, Output
} from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { FormService } from './form.service';
import { ValueChangeElement } from './form';
import { ElementComponent } from './element-component.directive';
import { InputUIElement } from './unit';

@Directive()
export abstract class FormElementComponent extends ElementComponent implements OnInit, OnDestroy {
  @Output() formValueChanged = new EventEmitter<ValueChangeElement>();
  parentForm!: FormGroup;
  defaultValue!: string | number | boolean | undefined;
  elementFormControl!: FormControl;

  private ngUnsubscribe = new Subject<void>();

  constructor(private formService: FormService) {
    super();
  }

  ngOnInit(): void {
    this.formService.registerFormControl({
      id: this.elementModel.id,
      formControl: new FormControl(this.elementModel.value),
      formGroup: this.parentForm
    });
    this.elementFormControl = this.formControl;
    this.updateFormValue((this.elementModel as InputUIElement).value);
    this.formService.setValidators({
      id: this.elementModel.id,
      validators: this.validators,
      formGroup: this.parentForm
    });
    this.elementFormControl.valueChanges
      .pipe(
        startWith(this.elementModel.value),
        pairwise(),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(([prevValue, nextValue] : [string | number | boolean | undefined, string | number | boolean]) => {
        if (nextValue != null) { // invalid input on number fields generates event with null TODO find a better solution
          this.formValueChanged.emit({ id: this.elementModel.id, values: [prevValue, nextValue] });
        }
      });
  }

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (this.elementModel.required) {
      validators.push(Validators.required);
    }
    return validators;
  }

  private get formControl(): FormControl {
    // workaround for editor
    return (this.parentForm) ?
      this.parentForm.controls[this.elementModel.id] as FormControl :
      new FormControl({});
  }

  updateFormValue(newValue: string | number | boolean | undefined): void {
    this.elementFormControl?.setValue(newValue, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
