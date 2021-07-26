import {
  Directive, EventEmitter, OnDestroy, OnInit, Output
} from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn
} from '@angular/forms';
import { Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs/operators';
import { FormService } from './form.service';
import { ValueChangeElement } from './form';
import { ElementComponent } from './element-component.directive';

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
    const formControl = new FormControl(this.elementModel.value, this.getValidations());
    const id = this.elementModel.id;
    this.formService.registerFormControl({ id, formControl });
    this.elementFormControl = this.getFormControl(id);
    this.elementFormControl.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith([this.elementModel.value, this.elementModel.value]),
        pairwise()
      )
      .subscribe(([prevValue, nextValue] : [string | number | boolean | undefined, string | number | boolean]) => {
        if (nextValue != null) { // invalid input on number fields generates event with null TODO find a better solution
          this.formValueChanged.emit({ id: this.elementModel.id, values: [prevValue, nextValue] });
        }
      });
  }

  // TODO: get from elementModel examples, example: [Validators.requiredTrue, Validators.required]
  private getValidations = (): ValidatorFn[] => [];

  private getFormControl(id: string): FormControl {
    // workaround for editor
    return (this.parentForm) ? this.parentForm.controls[id] as FormControl : new FormControl();
  }

  updateFormValue(newValue: string | number | boolean): void {
    this.elementFormControl?.setValue(newValue, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
