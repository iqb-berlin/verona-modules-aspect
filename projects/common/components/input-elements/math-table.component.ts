import { MathTableElement } from 'common/models/elements/input-elements/math-table';
import { Component, Input, OnInit } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-math-table',
  template: `
    <div class="wrapper">
      <table [class.multiplication]="elementModel.operation === 'multiplication'"
             [style.color]="elementModel.styling.fontColor"
             [style.background-color]="elementModel.styling.backgroundColor"
             [style.font-size.px]="elementModel.styling.fontSize"
             [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
             [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
             [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
        <tr *ngFor="let row of tableModel"
            [style.height.px]="row.length && row[0].smallCell ? elementModel.styling.fontSize * 1.5 :
                                                                elementModel.styling.fontSize * 2"
            [style.font-size]="row.length && row[0].smallCell && 'smaller'">
          <td *ngFor="let cell of row" [attr.contenteditable]="cell.editable"
              [style.width.px]="elementModel.styling.fontSize * 2"
              (keydown)="onCharEnter(cell, $event)">
            {{ cell.value }}<br>
          </td>
        </tr>
      </table>
      <button *ngIf="elementModel.operation === 'multiplication'"
              [matTooltip]="'weitere Zeile einfügen'"
              [style.margin-bottom.px]="elementModel.styling.fontSize * 2.5"
              [style.width.px]="elementModel.styling.fontSize * 2.5"
              [style.height.px]="elementModel.styling.fontSize * 2.5"
              (click)="addRow()">
        +
      </button>
    </div>
  `,
  styles: [
    '.wrapper {display: flex; flex-direction: row;}',
    '.wrapper button {align-self: end; border-radius: 50%; margin-left: 10px;}',
    'table {border-spacing: 0; border-collapse: collapse;}',
    'td {border: 1px solid black; text-align: center; caret-color: transparent;}',
    'td:focus {background-color: #00606425; outline: unset;}',
    'table tr:last-child {border-top: 3px solid black;}',
    'table.multiplication tr:first-child {border-bottom: 3px solid black;}'
  ]
})
export class MathTableComponent extends ElementComponent implements OnInit {
  @Input() elementModel!: MathTableElement;
  tableModel: MathTableCell[][] = [];

  ngOnInit() {
    this.updateTableModel();
  }

  refresh(): void {
    this.updateTableModel();
  }

  /* Empty cells have to have an extra map to ensure new object refs. */
  private updateTableModel(): void {
    if (this.elementModel.operation === 'multiplication') {
      this.tableModel = this.createMultiplicationModel();
    } else {
      const operatorChar = this.elementModel.operation === 'addition' ? '+' : '-';
      const widthOffset = 1; // offset for operatorChar
      const width = Math.max(
        ...this.elementModel.terms.map(term => term.length + widthOffset),
        this.elementModel.result.length
      );

      this.tableModel = [
        ...MathTableComponent.createHelperRows(this.elementModel.operation === 'addition' ? 1 : 2, width),
        ...this.elementModel.terms.map((term: string, i: number) => [ // slice because first term is already there
          { value: i > 0 ? operatorChar : '' },
          ...Array(width - widthOffset - term.length)
            .fill(undefined)
            .map(() => ({ value: '', editable: term === '' })),
          ...term.split('').map((char: string) => ({ value: char, editable: false }))
        ]),
        ...MathTableComponent.createHelperRows(1, width),
        this.createResultRow(width)
      ];
    }
  }

  private createMultiplicationModel(): MathTableCell[][] {
    const width = Math.max(this.elementModel.terms[0].length + this.elementModel.terms[1].length + 3,
      this.elementModel.result.length);
    return [
      [
        ...Array(width - (this.elementModel.terms[0].length + this.elementModel.terms[1].length + 1))
          .fill({ value: '' }),
        ...this.elementModel.terms[0].split('').map(char => ({ value: char })),
        { value: '*' },
        ...this.elementModel.terms[1].split('').map(char => ({ value: char }))
      ],
      [...Array(width).fill(undefined).map(() => ({ value: '', editable: true }))],
      ...MathTableComponent.createHelperRows(1, width),
      this.createResultRow(width)
    ];
  }

  private static createHelperRows(amount: number, width: number): MathTableCell[][] {
    return Array(amount)
      .fill([...Array(width).fill(undefined).map(() => ({ value: '', smallCell: true, editable: true }))]);
  }

  private createResultRow(width: number): MathTableCell[] {
    const editable = this.elementModel.result === '';
    return [
      ...Array(width - this.elementModel.result.length).fill(undefined)
        .map(() => ({ value: '', editable: editable })),
      ...this.elementModel.result.split('').map(char => ({ value: char }))
    ];
  }

  addRow(): void {
    const width = this.elementModel.terms[0].length + this.elementModel.terms[1].length + 1;
    this.tableModel.splice(
      this.tableModel.length - 2,
      0,
      [...Array(width + 2).fill(undefined)
        .map(() => ({ value: '', editable: true }))]
    );
  }

  // eslint-disable-next-line class-methods-use-this
  onCharEnter(cell: MathTableCell, event: KeyboardEvent) {
    console.log('onCharEnter', event.key);
    if (event.key === 'Tab') return; // allow normal Tab usage
    event.preventDefault();
    if (['Backspace', 'Delete'].includes(event.key)) cell.value = '';
    const allowedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (!allowedKeys.includes(event.key)) return;
    if (cell.smallCell && cell.value.length === 1) {
      cell.value += event.key;
    } else {
      cell.value = event.key;
    }
  }
}

interface MathTableCell {
  value: string;
  strikethrough?: boolean;
  smallCell?: boolean;
  editable?: boolean;
}
