import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Unit } from '../../../common/unit';
import { FormService } from '../../../common/form.service';
import { FormControlElement, ValueChangeElement } from '../../../common/form';
import { VeronaSubscriptionService } from './services/verona-subscription.service';
import { VeronaPostService } from './services/verona-post.service';
import { NativeEventService } from './services/native-event.service';

@Component({
  selector: 'player-aspect',
  template: `
      <form [formGroup]="form">
          <mat-tab-group mat-align-tabs="start">
              <mat-tab *ngFor="let page of unit.pages; let i = index" label="Seite {{i+1}}">
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
  unit: Unit = {
    pages: []
  };

  constructor(private formService: FormService,
              private veronaSubscriptionService: VeronaSubscriptionService,
              private veronaPostService: VeronaPostService,
              private nativeEventService: NativeEventService) {
    this.subscribe();
    veronaPostService.sendVopReadyNotification();
  }

  private subscribe(): void {
    this.formService.elementValueChanged
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    this.formService.controlAdded
      .subscribe((control: FormControlElement): void => this.addControl(control));

    this.veronaSubscriptionService.vopStartCommand
      .subscribe((data: any): void => this.onStart(data));
    this.veronaSubscriptionService.vopNavigationDeniedNotification
      .subscribe((data: any): void => this.onNavigationDenied(data));

    this.nativeEventService.scrollY
      .subscribe((y: number): void => this.onScrollY(y));
    this.nativeEventService.focus
      .subscribe((focused: boolean): void => this.onFocus(focused));
  }

  private onStart(data: any): void {
    console.log('player: onStart', data);
    this.veronaPostService.sessionId = data.sessionId;
    this.unit = JSON.parse(data.unitDefinition);
    // playerStartData.unitStateData = data.unitState?.dataParts?.all;
    this.initForm();
  }

  private initForm(): void {
    this.form = new FormGroup({});
    this.form.valueChanges.subscribe(v => this.onFormChanges(v));
  }

  private onNavigationDenied(data: any): void {
    console.log('player: onNavigationDenied', data);
    this.form.markAllAsTouched();
  }

  private addControl(control: FormControlElement): void {
    this.form.addControl(control.id, control.formControl);
  }

  private onElementValueChanges = (value: ValueChangeElement): void => {
    // eslint-disable-next-line no-console
    console.log(`Player: onElementValueChanges - ${value.id}: ${value.values[0]} -> ${value.values[1]}`);
  };

  private onFormChanges(value: unknown): void {
    const allValues: string = JSON.stringify(value);
    // eslint-disable-next-line no-console
    console.log('Player: emit valueChanged', allValues);
    this.veronaPostService.sendVopStateChangedNotification(allValues);
  }

  private onScrollY = (y: number): void => {
    console.log('player: onScrollY', y);
  };

  // TODO
  private onFocus(focused: boolean): void {
    console.log('player: onFocus', focused);
    this.veronaPostService.sendVopWindowFocusChangedNotification(focused);
  }

  /// ////////////////////// only for dev
  submit(): void {
    // eslint-disable-next-line no-console
    console.log('Player: form.value', this.form.value);
  }
}
