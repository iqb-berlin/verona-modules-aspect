import { MathTableElement } from 'common/models/elements/input-elements/math-table';
import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ValueChangeElement } from 'common/models/elements/element';

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
            [style.height.px]="row.cells.length && row.isHelperRow ? elementModel.styling.fontSize * 1.5 :
                                                                            elementModel.styling.fontSize * 2"
            [style.font-size]="row.cells.length && row.isHelperRow && '70%'">
          <td *ngFor="let cell of row.cells" [attr.contenteditable]="cell.isEditable"
              [style.width.px]="elementModel.styling.fontSize * 2"
              [class.strike-through]="cell.isCrossedOut"
              [textContent]="cell.value"
              (paste)="$event.preventDefault()"
              (keydown)="onCharEnter($event, row, cell)"
              (dblclick)="toggleStrikeThrough(row, cell)">
          </td>
        </tr>
      </table>
      <button *ngIf="elementModel.operation === 'multiplication'"
              [matTooltip]="'weitere Zeile einfügen'"
              [style.margin-bottom.px]="elementModel.styling.fontSize * 2.5"
              [style.width.px]="elementModel.styling.fontSize * 2.5"
              [style.height.px]="elementModel.styling.fontSize * 2.5"
              (click)="addRow()">
        <mat-icon>add</mat-icon>
      </button>
      <button *ngIf="elementModel.operation === 'multiplication'"
              [matTooltip]="'letzte Zeile entfernen'"
              [disabled]="tableModel.length == 4"
              [style.margin-bottom.px]="elementModel.styling.fontSize * 2.5"
              [style.width.px]="elementModel.styling.fontSize * 2.5"
              [style.height.px]="elementModel.styling.fontSize * 2.5"
              (click)="removeRow()">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  `,
  styles: [
    '.wrapper {display: flex; flex-direction: row;}',
    '.wrapper button {align-self: end; border-radius: 50%; margin-left: 10px;}',
    'table {border-spacing: 0; border-collapse: collapse;}',
    'td {border: 1px solid grey; text-align: center; caret-color: transparent;}',
    'td.strike-through {text-decoration: line-through; text-decoration-thickness: 3px;}',
    'td:focus {background-color: #00606425; outline: unset;}',
    'table tr:last-child {border-top: 3px solid black;}',
    'table.multiplication tr:first-child {border-bottom: 3px solid black;}'
  ]
})
export class MathTableComponent extends ElementComponent implements OnInit {
  @Input() elementModel!: MathTableElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Input() tableModel: MathTableRow[] = [];

  ngOnInit() {
    if (!this.tableModel.length) this.createTableModel();
  }

  refresh(): void {
    this.createTableModel();
  }

  private createTableModel(): void {
    switch (this.elementModel.operation) {
      case 'addition': {
        this.tableModel = this.createAdditionModel();
        break;
      }
      case 'subtraction': {
        this.tableModel = this.createSubstractionModel();
        break;
      }
      case 'multiplication': {
        this.tableModel = this.createMultiplicationModel();
        break;
      }
      default:
        throw new Error(`Unknown math operation: ${this.elementModel.operation}`);
    }
  }

  private createAdditionModel(): MathTableRow[] {
    const operatorOffset = 1; // offset for operatorChar
    const width = Math.max(
      ...this.elementModel.terms.map(term => term.length + operatorOffset),
      this.elementModel.result.length
    );
    return [
      MathTableComponent.createHelperRow(width),
      ...this.elementModel.terms
        .map((term: string, i: number) => MathTableComponent.createNormalRow(
          term, width - operatorOffset, i > 0 ? '+' : ' '
        )),
      MathTableComponent.createHelperRow(width),
      MathTableComponent.createResultRow(this.elementModel.result, width)
    ];
  }

  private createSubstractionModel(): MathTableRow[] {
    const operatorOffset = 1; // offset for operatorChar
    const width = Math.max(
      ...this.elementModel.terms.map(term => term.length + operatorOffset),
      this.elementModel.result.length
    );
    return [
      MathTableComponent.createHelperRow(width, true),
      MathTableComponent.createHelperRow(width, true),
      ...this.elementModel.terms
        .map((term: string, i: number) => MathTableComponent.createNormalRow(
          term, width - operatorOffset, i > 0 ? '−' : ' ', i === 0
        )),
      MathTableComponent.createHelperRow(width),
      MathTableComponent.createResultRow(this.elementModel.result, width)
    ];
  }

  private createMultiplicationModel(): MathTableRow[] {
    const width = Math.max(this.elementModel.terms[0].length + this.elementModel.terms[1].length + 3,
      this.elementModel.result.length);
    return [
      MathTableComponent.createMultiplicationRow(this.elementModel.terms[0], this.elementModel.terms[1], width),
      MathTableComponent.createNormalRow('', width),
      MathTableComponent.createHelperRow(width),
      MathTableComponent.createResultRow(this.elementModel.result, width)
    ];
  }

  static createMultiplicationRow(term1: string, term2: string, width: number): MathTableRow {
    return {
      rowType: 'normal',
      cells: [
        ...Array(width - (term1.length + term2.length + 1))
          .fill({ value: '' }),
        ...term1.split('').map(char => ({ value: char })),
        { value: '•' },
        ...term2.split('').map(char => ({ value: char }))
      ]
    };
  }

  /* '1digit' also means no crossing out. '2digit' the opposite. */
  private static createHelperRow(width: number, is2DigitHelperRow: boolean = false): MathTableRow {
    return {
      rowType: 'helper',
      cells: [...Array(width).fill(undefined).map(() => ({
        value: '',
        isSmallCell: true,
        isEditable: true
      }))],
      isHelperRow: true,
      is2DigitHelperRow,
      canBeCrossedOut: is2DigitHelperRow
    };
  }

  /* Empty cells have to have an extra map to ensure new object refs. */
  private static createNormalRow(term: string, width: number, operatorChar?: string,
                                 isStrikable: boolean = false): MathTableRow {
    return {
      rowType: 'normal',
      cells: [
        ...operatorChar ? [{ value: operatorChar }] : [],
        ...Array(width - term.length).fill(undefined)
          .map(() => ({ value: '', isEditable: term === '' })),
        ...term.split('').map(char => ({
          value: char === '_' ? ' ' : char, // underscore acts as space alternative
          isEditable: char === ' ' || char === '_'
        }))
      ],
      canBeCrossedOut: isStrikable
    };
  }

  private static createResultRow(term: string, width: number): MathTableRow {
    return {
      rowType: 'result',
      cells: [
        ...Array(width - term.length).fill(undefined)
          .map(() => ({ value: '', isEditable: term === '' })),
        ...term.split('').map(char => ({
          value: char === '_' ? ' ' : char, // underscore acts as space alternative
          isEditable: char === ' ' || char === '_'
        }))
      ]
    };
  }

  addRow(): void {
    const width = this.elementModel.terms[0].length + this.elementModel.terms[1].length + 3;
    this.tableModel.splice(
      this.tableModel.length - 2,
      0,
      MathTableComponent.createNormalRow('', width)
    );
    this.emitModel();
  }

  removeRow() {
    this.tableModel.splice(this.tableModel.length - 3, 1);
    this.emitModel();
  }

  onCharEnter(event: KeyboardEvent, row: MathTableRow, cell: MathTableCell) {
    if (event.key === 'Tab') return; // allow normal Tab usage
    event.preventDefault();
    if (['Backspace', 'Delete'].includes(event.key)) {
      cell.value = '';
      (event.target as HTMLElement).textContent = '';
      cell.isCrossedOut = false;
    }
    const allowedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (this.elementModel.operation === 'multiplication' && !row.isHelperRow) {
      allowedKeys.push('+', '-', '*', ':', '/');
    }
    if (!allowedKeys.includes(event.key)) return;

    if (row.is2DigitHelperRow && cell.value.length === 1) {
      cell.value += event.key;
    } else {
      cell.value = MathTableComponent.getCharReplacement(event.key);
    }

    this.emitModel();
  }

  private static getCharReplacement(char: string): string {
    switch (char) {
      case '*':
        return '•';
      case '/':
        return ':';
      case '-':
        return '−';
      default:
        return char;
    }
  }

  toggleStrikeThrough(row: MathTableRow, cell: MathTableCell) {
    if (!(row.is2DigitHelperRow || row.canBeCrossedOut)) return;
    if (cell.value === '') return;
    cell.isCrossedOut = !cell.isCrossedOut;
    this.emitModel();
  }

  emitModel(): void {
    this.elementValueChanged.emit({ id: this.elementModel.id, value: this.tableModel });
  }
}

export interface MathTableCell {
  value: string;
  isCrossedOut?: boolean;
  isEditable?: boolean;
}

export interface MathTableRow {
  rowType: 'normal' | 'result' | 'helper';
  cells: MathTableCell[];
  isHelperRow?: boolean;
  is2DigitHelperRow?: boolean;
  canBeCrossedOut?: boolean;
}
