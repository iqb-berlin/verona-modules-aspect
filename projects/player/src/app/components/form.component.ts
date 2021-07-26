import { Component, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormService } from '../../../../common/form.service';
import { VeronaSubscriptionService } from '../services/verona-subscription.service';
import { VeronaPostService } from '../services/verona-post.service';
import { FormControlElement, ValueChangeElement } from '../../../../common/form';
import {
  PlayerConfig, UnitState, VopNavigationDeniedNotification
} from '../models/verona';
import { UnitPage } from '../../../../common/unit';

@Component({
  selector: 'app-form',
  template: `
      <form [formGroup]="form">
          <app-player-state [parenForm]="form" [pages]="pages" [validPages]="validPages"></app-player-state>
      </form>
      <button class="form-item" mat-flat-button color="primary" (click)="submit()">Print
          form.value
      </button>
  `
})
export class FormComponent implements OnDestroy {
  @Input() pages: UnitPage[] = [];
  @Input() playerConfig!: PlayerConfig;
  form = new FormGroup({});
  private ngUnsubscribe = new Subject<void>();

  constructor(private formService: FormService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService) {
    this.initSubscriptions();
  }

  get validPages():Record<string, string>[] {
    return this.pages.map((page:UnitPage, index:number) => {
      const validPage: Record<string, string> = {};
      validPage[`page${index}`] = `Seite ${index + 1}`;
      return validPage;
    });
  }

  private initSubscriptions(): void {
    this.formService.elementValueChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    this.formService.controlAdded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((control: FormControlElement): void => this.addControl(control));
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((formValues: any): void => this.onFormChanges(formValues));
  }

  private onNavigationDenied(message: VopNavigationDeniedNotification): void {
    // eslint-disable-next-line no-console
    console.log('player: onNavigationDenied', message);
    this.form.markAllAsTouched();
  }

  private addControl(control: FormControlElement): void {
    this.form.addControl(control.id, control.formControl);
  }

  private onElementValueChanges = (value: ValueChangeElement): void => {
    // eslint-disable-next-line no-console
    console.log(`player: onElementValueChanges - ${value.id}: ${value.values[0]} -> ${value.values[1]}`);
  };

  private onFormChanges(formValues: unknown): void {
    // eslint-disable-next-line no-console
    console.log('player: onFormChanges', formValues);
    // TODO: map by page and? section not all
    const unitState: UnitState = {
      dataParts: {
        all: JSON.stringify(formValues)
      }
    };
    this.veronaPostService.sendVopStateChangedNotification({ unitState });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /// ////////////////////// only for dev
  submit(): void {
    // eslint-disable-next-line no-console
    console.log('player: form.value', this.form.value);
  }
}
