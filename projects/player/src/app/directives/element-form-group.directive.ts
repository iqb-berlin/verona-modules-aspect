import { Directive, OnDestroy } from '@angular/core';
import {
  FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { InputElement, InputElementValue, SliderElement } from '../../../../common/interfaces/elements';
import { UnitStateService } from '../services/unit-state.service';
import { UnitStateElementMapperService } from '../services/unit-state-element-mapper.service';
import { ElementGroupDirective } from './element-group.directive';
import { VopNavigationDeniedNotification } from '../models/verona';
import { MessageService } from '../../../../common/services/message.service';
import { VeronaSubscriptionService } from '../services/verona-subscription.service';

@Directive()
export abstract class ElementFormGroupDirective extends ElementGroupDirective implements OnDestroy {
  form!: FormGroup;
  abstract unitStateService: UnitStateService;
  abstract unitStateElementMapperService: UnitStateElementMapperService;
  abstract translateService: TranslateService;
  abstract messageService: MessageService;
  abstract veronaSubscriptionService: VeronaSubscriptionService;

  private ngUnsubscribe = new Subject<void>();

  createForm(elementModels: InputElement[]): void {
    this.form = new FormGroup({});
    elementModels.forEach(elementModel => {
      const initialValue = this.unitStateElementMapperService
        .fromUnitState(this.unitStateService.getUnitStateElement(elementModel.id)?.value, elementModel);
      this.form
        .addControl(elementModel.id, new FormControl(initialValue, this.getValidators(elementModel)));
      this.form.get(elementModel.id)?.valueChanges.subscribe((inputValue: InputElementValue) => {
        this.unitStateService.changeElementValue({
          id: elementModel.id,
          value: this.unitStateElementMapperService.toUnitState(inputValue, elementModel.type)
        });
      });
    });
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));
  }

  private onNavigationDenied(message: VopNavigationDeniedNotification): void {
    // eslint-disable-next-line no-console
    console.log('player: onNavigationDenied', message);
    const reasons = message.reason?.map((reason: string) => this.translateService.instant(reason));
    this.messageService.showWarning(reasons?.join(', ') || this.translateService.instant('noReason'));
    if (message.reason && message.reason.find(reason => reason === 'responsesIncomplete')) {
      this.form.markAllAsTouched();
    }
  }

  private getValidators = (elementModel: InputElement) => {
    const validators: ValidatorFn[] = [];
    if (elementModel.required) {
      switch (elementModel.type) {
        case 'checkbox':
          validators.push(Validators.requiredTrue);
          break;
        case 'slider':
          validators.push(Validators.min((elementModel as SliderElement).minValue + 1));
          break;
        default:
          validators.push(Validators.required);
      }
    }
    if (elementModel.minLength) {
      validators.push(Validators.minLength(<number> elementModel.minLength));
    }
    if (elementModel.maxLength) {
      validators.push(Validators.maxLength(<number> elementModel.maxLength));
    }
    if (elementModel.pattern) {
      validators.push(Validators.pattern(<string> elementModel.pattern));
    }
    return validators;
  };

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
