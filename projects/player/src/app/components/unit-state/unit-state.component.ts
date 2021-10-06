import {
  ChangeDetectorRef, Component, Input, OnDestroy, OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormArray, FormBuilder, FormGroup
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../../../../common/form.service';
import { VeronaSubscriptionService } from '../../services/verona-subscription.service';
import { VeronaPostService } from '../../services/verona-post.service';
import { MessageService } from '../../../../../common/message.service';
import { MetaDataService } from '../../services/meta-data.service';
import {
  FormControlElement, FormControlValidators, ChildFormGroup, ValueChangeElement
} from '../../../../../common/form';
import {
  PlayerConfig, Progress, UnitState, UnitStateElementCode, UnitStateElementCodeStatus, VopNavigationDeniedNotification
} from '../../models/verona';
import { UnitPage, UnitUIElement } from '../../../../../common/unit';
import { UnitStateService } from '../../services/unit-state.service';

@Component({
  selector: 'app-unit-state',
  templateUrl: './unit-state.component.html'
})
export class UnitStateComponent implements OnInit, OnDestroy {
  @Input() pages: UnitPage[] = [];
  @Input() playerConfig!: PlayerConfig;
  @Input() unitStateElementCodes!: UnitStateElementCode[];

  form!: FormGroup;
  presentedPages: number[] = [];

  private ngUnsubscribe = new Subject<void>();

  constructor(private formBuilder: FormBuilder,
              private formService: FormService,
              private unitStateService: UnitStateService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private messageService: MessageService,
              private metaDataService: MetaDataService,
              private translateService: TranslateService,
              protected changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      pages: this.formBuilder.array([])
    });
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.formService.groupAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((group: ChildFormGroup): void => this.addGroup(group));
    this.formService.controlAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((control: FormControlElement): void => this.addControl(control));
    this.formService.validatorsAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((validations: FormControlValidators): void => this.setValidators(validations));
    this.formService.elementValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    this.unitStateService.elementAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((element: UnitUIElement): void => this.addUnitStateElementCode(element));
    this.unitStateService.presentedPageAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((presentedPage: number): void => this.onPresentedPageAdded(presentedPage));
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((): void => this.onFormChanges());
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));
  }

  private get responseProgress(): Progress {
    if (this.form.valid) {
      return 'complete';
    }
    const pages: FormArray = this.form.get('pages') as FormArray;
    return (pages.controls.some((control: AbstractControl): boolean => control.value)) ? 'some' : 'none';
  }

  private get presentationProgress(): Progress {
    if (this.presentedPages.length === 0) {
      return 'none';
    }
    return (this.pages.length === this.presentedPages.length) ? 'complete' : 'some';
  }

  private addControl = (control: FormControlElement): void => {
    control.formGroup.addControl(control.id, control.formControl);
  };

  private setValidators = (validators: FormControlValidators): void => {
    validators.formGroup.controls[validators.id].setValidators(validators.validators);
    validators.formGroup.controls[validators.id].updateValueAndValidity();
    this.changeDetectorRef.detectChanges();
  };

  private onNavigationDenied(message: VopNavigationDeniedNotification): void {
    // eslint-disable-next-line no-console
    console.log('player: onNavigationDenied', message);
    const reasons = message.reason?.map((reason: string) => this.translateService.instant(reason));
    this.messageService.showWarning(reasons?.join(', ') || this.translateService.instant('noReason'));
    this.form.markAllAsTouched();
  }

  private addGroup = (group: ChildFormGroup): void => {
    const formArray: FormArray = group.parentForm.get(group.parentArray) as FormArray;
    if (group.parentArrayIndex < formArray.length) {
      formArray.insert(group.parentArrayIndex, group.formGroup);
    } else {
      formArray.push(group.formGroup);
    }
  };

  private onElementValueChanges = (value: ValueChangeElement): void => {
    // eslint-disable-next-line no-console
    console.log(`player: onElementValueChanges ${value.id}: old: ${value.values[0]}, new: ${value.values[1]}`);
    this.setUnitStateElementCodeStatus(value.id, 'VALUE_CHANGED');
    this.setUnitStateElementCodeValue(value.id, value.values[1]);
  };

  private onFormChanges(): void {
    // eslint-disable-next-line no-console
    console.log('player: onFormChanges', this.unitStateElementCodes);
    this.sendVopStateChangedNotification();
  }

  private onPresentedPageAdded(pagePresented: number): void {
    if (!this.presentedPages.includes(pagePresented)) {
      this.presentedPages.push(pagePresented);
    }
    // eslint-disable-next-line no-console
    console.log('player: onPresentedPageAdded', this.presentedPages);
    this.sendVopStateChangedNotification();
  }

  private sendVopStateChangedNotification(): void {
    const unitState: UnitState = {
      dataParts: {
        elementCodes: JSON.stringify(this.unitStateElementCodes)
      },
      presentationProgress: this.presentationProgress,
      responseProgress: this.responseProgress,
      unitStateDataType: this.metaDataService.playerMetadata.supportedUnitStateDataTypes
    };
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  private setUnitStateElementCodeValue(id: string, value: string | number | boolean | undefined) {
    const unitStateElementCode = this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === id);
    if (unitStateElementCode) {
      unitStateElementCode.value = value;
    }
  }

  private setUnitStateElementCodeStatus(id: string, status: UnitStateElementCodeStatus) {
    const unitStateElementCode = this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === id);
    if (unitStateElementCode) {
      unitStateElementCode.status = status;
    }
  }

  private addUnitStateElementCode(element: UnitUIElement) {
    const unitStateElementCode = this.unitStateElementCodes
      .find((elementCode: UnitStateElementCode): boolean => elementCode.id === element.id);
    if (!unitStateElementCode) {
      this.unitStateElementCodes.push({ id: element.id, value: element.value, status: 'NOT_REACHED' });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
