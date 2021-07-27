import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UnitPage } from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';
import { FormControlElement, FormControlValidators } from '../../../../common/form';

@Component({
  selector: 'app-page',
  template: `
      <app-section *ngFor="let section of page.sections; let i = index"
                   [parentForm]="pageForm"
                   [section]="section"
                   [ngStyle]="{
                position: 'relative',
                display: 'inline-block',
                'background-color': section.backgroundColor,
                'height.px': section.height,
                'width.px': section.width }">
          {{section.height}}
      </app-section>
  `
})

export class PageComponent implements OnInit, OnDestroy {
  @Input() page!: UnitPage;
  @Input() parentForm!: FormGroup;
  pageForm!: FormGroup;
  private ngUnsubscribe = new Subject<void>();

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    this.pageForm = new FormGroup({});
    this.formService.registerFormGroup({ id: this.page.id, formGroup: this.pageForm });
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.formService.controlAdded.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((control: FormControlElement): void => this.addControl(control));
    this.formService.validationsAdded.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((validations: FormControlValidators): void => this.setValidators(validations));
  }

  private addControl(control: FormControlElement): void {
    // we need to check that the control belongs to the page
    if (this.pageForm === control.formGroup) {
      this.pageForm.addControl(control.id, control.formControl);
    }
  }

  private setValidators(validators: FormControlValidators): void {
    // we need to check that the control belongs to the page
    if (this.pageForm === validators.formGroup) {
      this.pageForm.controls[validators.id].setValidators(validators.validators);
      this.pageForm.controls[validators.id].updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
