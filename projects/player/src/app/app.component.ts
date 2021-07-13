import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChangeElement, Unit } from '../../../common/unit';
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
                  <app-page [parentForm]="form" [page]="page"></app-page>
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

  @Output() valueChanged = new EventEmitter<string>();

  constructor(private formService: FormService) {
    formService.elementValueChanged$.subscribe((value: ChangeElement) :void => this.onElementValueChanges(value));
    formService.controlAdded$.subscribe((value: string): void => this.addControl(value));
  }

  private initForm(): void {
    this.form = new FormGroup({});
    this.form.valueChanges.subscribe(v => this.onFormChanges(v));
  }

  private addControl(id: string): void {
    this.form.addControl(id, new FormControl());
  }

  private onElementValueChanges = (value: ChangeElement): void => {
    console.log(`Player: onElementValueChanges - ${value.element}: ${value.values[0]} -> ${value.values[1]}`);
  };

  private onFormChanges(value: unknown): void {
    const allValues: string = JSON.stringify(value);
    console.log('Player: emit valueChanged', allValues);
    this.valueChanged.emit(allValues);
  }

  submit(): void {
    console.log('Player: form.value', this.form.value);
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
