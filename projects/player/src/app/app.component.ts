import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Unit } from '../../../common/unit';
import { FormService } from '../../../common/form.service';

interface StartData {
  unitDefinition: string;
  unitStateData: string;
}

@Component({
  selector: 'player-aspect',
  template: `
      <form *ngIf="form" [formGroup]="form">
          <mat-tab-group mat-align-tabs="start">
              <mat-tab *ngFor="let page of unitJSON.pages; let i = index" label="Seite {{i+1}}">
                  <app-page [page]="page"></app-page>
              </mat-tab>
          </mat-tab-group>
          <button class="form-item" mat-flat-button color="primary" (click)="submit()" [disabled]="!form.valid">Print
              form.value
          </button>
          <pre>{{unitJSON | json}}</pre>
      </form>
    `
})
export class AppComponent {
  form!: FormGroup;
  unitJSON: Unit = {
    pages: []
  };

  @Input()
  set startData(startData: StartData) {
    this.unitJSON = JSON.parse(startData.unitDefinition);
    this.initForm();
  }

  constructor(private formService: FormService) {
    formService.elementValueChanged$.subscribe(value => console.log(value));
    formService.controlAdded$.subscribe((value: string) => this.addControl(value));
  }

  addControl(id: string): void {
    this.form.addControl(id, new FormControl());
  }

  initForm(): void {
    this.form = new FormGroup({});
    this.formService.formRef = this.form;
  }

  submit(): void {
    console.log('form.value', this.form.value);
  }


  exampleUnit = {
    pages: [
      {
        sections: [
          {
            elements: [
              {
                label: 'Label Dropdown',
                options: [
                  'op1',
                  'op2'
                ],
                type: 'dropdown',
                id: 'dummyID',
                xPosition: 124,
                yPosition: 26,
                width: 180,
                height: 60,
                backgroundColor: 'grey',
                fontColor: 'blue',
                font: 'Arial',
                fontSize: 18,
                bold: true,
                italic: false,
                underline: false
              }
            ],
            width: 1200,
            height: 200,
            backgroundColor: '#FFFAF0'
          },
          {
            elements: [
              {
                label: 'Button Text',
                type: 'button',
                id: 'dummyID',
                xPosition: 440,
                yPosition: 77,
                width: 180,
                height: 60,
                backgroundColor: 'grey',
                fontColor: 'blue',
                font: 'Arial',
                fontSize: 18,
                bold: true,
                italic: false,
                underline: false
              }
            ],
            width: 1200,
            height: 200,
            backgroundColor: '#FFFAF0'
          }
        ],
        width: 1200,
        height: 550,
        backgroundColor: '#FFFAF0'
      },
      {
        sections: [
          {
            elements: [],
            width: 1200,
            height: 200,
            backgroundColor: '#FFFAF0'
          }
        ],
        width: 1200,
        height: 550,
        backgroundColor: '#FFFAF0'
      }
    ]
  };
}
