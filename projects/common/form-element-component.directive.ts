import {
  Directive, EventEmitter, OnDestroy, OnInit, Output
} from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ElementComponent } from './element-component.directive';
import { InputElement, InputElementValue, ValueChangeElement } from './models/uI-element';

@Directive()
export abstract class FormElementComponent extends ElementComponent implements OnInit, OnDestroy {
  @Output() formValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() setValidators = new EventEmitter<ValidatorFn[]>();
  parentForm!: FormGroup;
  defaultValue!: InputElementValue;
  elementFormControl!: FormControl;

  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.elementFormControl = this.formControl;
    this.updateFormValue((this.elementModel as InputElement).value);
    this.setValidators.emit(this.validators);
    this.elementFormControl.valueChanges
      .pipe(
        startWith((this.elementModel as InputElement).value),
        pairwise(),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(([prevValue, nextValue]: [InputElementValue, InputElementValue]) => {
        if (nextValue != null) { // invalid input on number fields generates event with null TODO find a better solution
          this.formValueChanged.emit({ id: this.elementModel.id, values: [prevValue, nextValue] });
        }
      });
  }

  get validators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if ((this.elementModel as InputElement).required) {
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

  updateFormValue(newValue: InputElementValue): void {
    this.elementFormControl?.setValue(newValue, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
