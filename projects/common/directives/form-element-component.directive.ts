import {
  Directive, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ElementComponent } from './element-component.directive';
import { InputElement, InputElementValue, ValueChangeElement } from '../models/uI-element';

@Directive()
export abstract class FormElementComponent extends ElementComponent implements OnInit, OnDestroy {
  @Input() parentForm!: FormGroup;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() setValidators = new EventEmitter<ValidatorFn[]>();
  elementFormControl!: FormControl;

  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.elementFormControl = this.formControl;
    this.elementFormControl?.setValue((this.elementModel as InputElement).value, { emitEvent: false });
    this.setFormControlValidator();
    this.elementFormControl.valueChanges
      .pipe(
        startWith((this.elementModel as InputElement).value),
        pairwise(),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(([prevValue, nextValue]: [InputElementValue, InputElementValue]) => {
        this.elementValueChanged.emit({ id: this.elementModel.id, values: [prevValue, nextValue] });
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

  setFormValue(value: InputElementValue, option: { emitEvent: boolean } = { emitEvent: true }): void {
    this.elementFormControl.setValue(value, option);
  }

  setFormControlValidator(): void {
    if (this.validators.length) {
      this.setValidators.emit(this.validators);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
