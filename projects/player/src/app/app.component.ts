import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Unit, UnitPage } from '../../../common/unit';
import { FormService } from '../../../common/form.service';
import { FormControlElement, ValueChangeElement } from '../../../common/form';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';
import {
  PlayerConfig, RunningState,
  VopNavigationDeniedNotification,
  VopStartCommand
} from './models/verona';

@Component({
  selector: 'player-aspect',
  template: `
      <form [formGroup]="form">
          <mat-tab-group mat-align-tabs="start">
              <mat-tab *ngFor="let page of pages; let i = index" label="Seite {{i+1}}">
                  <app-page [parentForm]="form" [page]="page"></app-page>
              </mat-tab>
          </mat-tab-group>
      </form>
      <button class="form-item" mat-flat-button color="primary" (click)="submit()">Print
          form.value
      </button>
  `
})
export class AppComponent {
  form: FormGroup = new FormGroup({});
  pages: UnitPage[] = [];
  playerConfig!: PlayerConfig;

  constructor(private formService: FormService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private nativeEventService: NativeEventService) {
    this.initSubscriptions();
    veronaPostService.sendVopReadyNotification();
  }

  private initSubscriptions(): void {
    this.formService.elementValueChanged
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    this.formService.controlAdded
      .subscribe((control: FormControlElement): void => this.addControl(control));

    this.veronaSubscriptionService.vopStartCommand
      .subscribe((message: VopStartCommand): void => this.onStart(message));
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .subscribe((message: VopNavigationDeniedNotification): void => this.onNavigationDenied(message));

    this.nativeEventService.scrollY
      .subscribe((y: number): void => this.onScrollY(y));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private get validPages():Record<string, string>[] {
    return this.pages.map((page:UnitPage, index:number) => {
      const validPage: Record<string, string> = {};
      validPage[`page${index}`] = `Seite ${index + 1}`;
      return validPage;
    });
  }

  private onStart(message: VopStartCommand): void {
    // eslint-disable-next-line no-console
    console.log('player: onStart', message);
    this.initForm();
    this.initPlayer(message);
    const values = {
      playerState:
        {
          state: 'running' as RunningState,
          validPages: this.validPages,
          currentPage: 'page0'
        }
    };
    this.veronaPostService.sendVopStateChangedNotification(values);
  }

  private initForm(): void {
    this.form = new FormGroup({});
    this.form.valueChanges
      .subscribe((formValues: any): void => this.onFormChanges(formValues));
  }

  private initPlayer(message: VopStartCommand): void {
    this.veronaPostService.sessionId = message.sessionId;
    const unit: Unit = message.unitDefinition ? JSON.parse(message.unitDefinition) : [];
    this.pages = unit.pages;
    this.playerConfig = message.playerConfig || {};
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
    const values = {
      unitState: {
        dataParts: {
          all: JSON.stringify(formValues)
        }
      }
    };
    this.veronaPostService.sendVopStateChangedNotification(values);
  }

  private onScrollY = (y: number): void => {
    // eslint-disable-next-line no-console
    console.log('player: onScrollY', y);
  };

  private onFocus(focused: boolean): void {
    // eslint-disable-next-line no-console
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }

  /// ////////////////////// only for dev
  submit(): void {
    // eslint-disable-next-line no-console
    console.log('Player: form.value', this.form.value);
  }
}
