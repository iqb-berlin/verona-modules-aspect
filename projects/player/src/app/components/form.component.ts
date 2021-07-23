import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormService } from '../../../../common/form.service';
import { VeronaSubscriptionService } from '../services/verona-subscription.service';
import { VeronaPostService } from '../services/verona-post.service';
import { FormControlElement, ValueChangeElement } from '../../../../common/form';
import {
  PlayerConfig, RunningState, VopNavigationDeniedNotification
} from '../models/verona';
import { UnitPage } from '../../../../common/unit';

@Component({
  selector: 'app-form',
  template: `
      <form [formGroup]="form">
          <mat-tab-group mat-align-tabs="start">
              <mat-tab *ngFor="let page of pages; let i = index" label="{{validPages[i]['page'+i]}}">
                  <app-page [parentForm]="form" [page]="page"></app-page>
              </mat-tab>
          </mat-tab-group>
      </form>
      <button class="form-item" mat-flat-button color="primary" (click)="submit()">Print
          form.value
      </button>
  `
})
export class FormComponent {
  form = new FormGroup({});
  @Input() pages: UnitPage[] = [];
  @Input() playerConfig!: PlayerConfig;

  constructor(private formService: FormService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService) {
    this.initSubscriptions();
    this.veronaPostService.sendVopStateChangedNotification({
      playerState:
        {
          state: 'running' as RunningState,
          validPages: this.validPages,
          currentPage: 'page0'
        }
    });
  }

  private initSubscriptions(): void {
    this.formService.elementValueChanged
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    this.formService.controlAdded
      .subscribe((control: FormControlElement): void => this.addControl(control));

    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));

    this.form.valueChanges
      .subscribe((formValues: any): void => this.onFormChanges(formValues));
  }

  get validPages():Record<string, string>[] {
    return this.pages.map((page:UnitPage, index:number) => {
      const validPage: Record<string, string> = {};
      validPage[`page${index}`] = `Seite ${index + 1}`;
      return validPage;
    });
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
    console.log(`Player: onElementValueChanges - ${value.id}: ${value.values[0]} -> ${value.values[1]}`);
  };

  private onFormChanges(formValues: unknown): void {
    // eslint-disable-next-line no-console
    console.log('player: onFormChanges', formValues);
    // TODO: map by page and? section not all
    this.veronaPostService.sendVopStateChangedNotification({
      unitState: {
        dataParts: {
          all: JSON.stringify(formValues)
        }
      }
    });
  }

  /// ////////////////////// only for dev
  submit(): void {
    // eslint-disable-next-line no-console
    console.log('Player: form.value', this.form.value);
  }
}
