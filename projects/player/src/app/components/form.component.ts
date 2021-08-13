import {
  ChangeDetectorRef, Component, Input, OnDestroy, OnInit
} from '@angular/core';
import {
  FormArray, FormBuilder, FormGroup
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../../../common/form.service';
import { VeronaSubscriptionService } from '../services/verona-subscription.service';
import { VeronaPostService } from '../services/verona-post.service';
import { MessageService } from '../../../../common/message.service';
import { MetaDataService } from '../services/meta-data.service';
import {
  FormControlElement, FormControlValidators, ChildFormGroup, ValueChangeElement, FormModel
} from '../../../../common/form';
import {
  PlayerConfig, UnitState, VopNavigationDeniedNotification
} from '../models/verona';
import { UnitPage } from '../../../../common/unit';

@Component({
  selector: 'app-form',
  template: `
    <form [formGroup]="form">
      <app-player-state [parentForm]="form"
                        [playerConfig]="playerConfig"
                        [pages]="pages">
      </app-player-state>
    </form>
  `
})
export class FormComponent implements OnInit, OnDestroy {
  @Input() pages: UnitPage[] = [];
  @Input() playerConfig!: PlayerConfig;
  form!: FormGroup;
  private ngUnsubscribe = new Subject<void>();

  constructor(private formBuilder: FormBuilder,
              private formService: FormService,
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
    this.formService.elementValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    this.formService.groupAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((group: ChildFormGroup): void => this.addGroup(group));
    this.formService.controlAdded.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((control: FormControlElement): void => this.addControl(control));
    this.formService.validatorsAdded.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((validations: FormControlValidators): void => this.setValidators(validations));
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((formModel: FormModel): void => this.onFormChanges(formModel));
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
    console.log(`player: onElementValueChanges - ${value.id}: ${value.values[0]} -> ${value.values[1]}`);
  };

  private onFormChanges(formModel: FormModel): void {
    // eslint-disable-next-line no-console
    console.log('player: onFormChanges', formModel);
    const unitState: UnitState = {
      dataParts: {
        pages: JSON.stringify(formModel.pages)
      },
      unitStateDataType: this.metaDataService.playerMetadata.supportedUnitStateDataTypes
    };
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
