import { Component, OnInit } from '@angular/core';
import { FileService } from '../../../common/file.service';
import { Unit } from '../../../common/unit';

@Component({
  template: `
        PLAYER ALIVE
        <mat-tab-group mat-align-tabs="start">
          <mat-tab *ngFor="let page of unitJSON.pages; let i = index" label="Seite {{i+1}}">
            <app-page [page]="page"></app-page>
          </mat-tab>
        </mat-tab-group>
    `
})
export class AppComponent implements OnInit {
  unitJSON: Unit = {
    pages: []
  };

  async ngOnInit(): Promise<void> {
    // const rawUnit = await FileService.loadFile(['.json']);
    this.unitJSON = this.exampleUnit;
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
