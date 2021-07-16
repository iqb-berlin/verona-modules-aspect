import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Unit } from '../../../common/unit';
import { FormService } from '../../../common/form.service';
import { FormControlElement, ValueChangeElement } from '../../../common/form';

interface StartData {
  unitDefinition: string;
  unitStateData: string;
}

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
      <button class="form-item" mat-flat-button color="primary" (click)="markAsTouch()" >markAsTouch
      </button>
      <pre>{{unit | json}}</pre>
  `
})
export class AppComponent {
  form: FormGroup = new FormGroup({});
  unit: Unit = {
    pages: []
  };

  @Input()
  set startData(startData: StartData) {
    this.unit = JSON.parse(startData.unitDefinition);
    this.initForm();
  }

  @Output() valueChanged = new EventEmitter<string>();

  constructor(private formService: FormService) {
    formService.elementValueChanged
      .subscribe((value: ValueChangeElement): void => this.onElementValueChanges(value));
    formService.controlAdded
      .subscribe((control: FormControlElement): void => this.addControl(control));
  }

  private initForm(): void {
    this.form = new FormGroup({});
    this.form.valueChanges.subscribe(v => this.onFormChanges(v));
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
    this.valueChanged.emit(allValues);
  }

  submit(): void {
    // eslint-disable-next-line no-console
    console.log('Player: form.value', this.form.value);
  }

  markAsTouch(): void {
    this.form.markAllAsTouched();
  }

  // exampleUnit = {
  //   pages: [
  //     {
  //       sections: [
  //         {
  //           elements: [
  //             {
  //               label: 'Label Dropdown',
  //               options: [
  //                 'op1',
  //                 'op2'
  //               ],
  //               type: 'dropdown',
  //               id: 'dummyID',
  //               xPosition: 124,
  //               yPosition: 26,
  //               width: 180,
  //               height: 60,
  //               backgroundColor: 'grey',
  //               fontColor: 'blue',
  //               font: 'Arial',
  //               fontSize: 18,
  //               bold: true,
  //               italic: false,
  //               underline: false
  //             }
  //           ],
  //           width: 1200,
  //           height: 200,
  //           backgroundColor: '#FFFAF0'
  //         },
  //         {
  //           elements: [
  //             {
  //               label: 'Button Text',
  //               type: 'button',
  //               id: 'dummyID',
  //               xPosition: 440,
  //               yPosition: 77,
  //               width: 180,
  //               height: 60,
  //               backgroundColor: 'grey',
  //               fontColor: 'blue',
  //               font: 'Arial',
  //               fontSize: 18,
  //               bold: true,
  //               italic: false,
  //               underline: false
  //             }
  //           ],
  //           width: 1200,
  //           height: 200,
  //           backgroundColor: '#FFFAF0'
  //         }
  //       ],
  //       width: 1200,
  //       height: 550,
  //       backgroundColor: '#FFFAF0'
  //     },
  //     {
  //       sections: [
  //         {
  //           elements: [],
  //           width: 1200,
  //           height: 200,
  //           backgroundColor: '#FFFAF0'
  //         }
  //       ],
  //       width: 1200,
  //       height: 550,
  //       backgroundColor: '#FFFAF0'
  //     }
  //   ]
  // };
}
