import { Directive, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { pairwise, startWith } from 'rxjs/operators';
import { UnitUIElement } from './unit';
import { FormService } from './form.service';

@Directive()
export abstract class CanvasElementComponent implements OnInit {
  elementModel!: UnitUIElement;
  formControl!: FormControl;
  style!: Record<string, string>;
  parentForm!: FormGroup;

  constructor(private formService: FormService) { }

  ngOnInit(): void {
    this.formService.registerFormControl(this.elementModel.id);
    this.formControl = this.getFormControl(this.elementModel.id);
    this.formControl.valueChanges
      .pipe(startWith(null), pairwise())
      .subscribe(
        ([prevValue, nextValue] : [unknown, unknown]) => this.onValueChange([prevValue, nextValue])
      );
  }

  private getFormControl(id: string): FormControl {
    return (this.parentForm) ? this.parentForm.controls[id] as FormControl : new FormControl();
  }

  private onValueChange(values: [unknown, unknown]): void {
    const element = this.elementModel.id;
    this.formService.changeElementValue({ element, values });
  }
}
