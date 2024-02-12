import { MathTableCell, MathTableElement, MathTableRow } from 'common/models/elements/input-elements/math-table';
import {
  Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ValueChangeElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-math-table',
  template: `
    <div *ngIf="elementModel.terms.length == 0 ||
                elementModel.operation === 'multiplication' && elementModel.terms.length < 2; else elseBlock"
         class="terms-missing-warning">
      Weitere Termzeilen benötigt
    </div>
    <ng-template #elseBlock>
      <div class="wrapper">
        <table [class.underline-first-row]="elementModel.operation === 'multiplication' ||
                                            (elementModel.operation === 'variable' &&
                                              elementModel.variableLayoutOptions.isFirstLineUnderlined &&
                                              !elementModel.variableLayoutOptions.showTopHelperRows)"
               [class.underline-third-row]="elementModel.operation === 'variable' &&
                                            elementModel.variableLayoutOptions.isFirstLineUnderlined &&
                                            elementModel.variableLayoutOptions.showTopHelperRows"
               [class.has-result-row]="elementModel.operation !== 'variable' ||
                                       elementModel.variableLayoutOptions.showResultRow"
               [style.color]="elementModel.styling.fontColor"
               [style.background-color]="elementModel.styling.backgroundColor"
               [style.font-size.px]="elementModel.styling.fontSize"
               [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
               [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
               [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <tr *ngFor="let row of tableModel; let index = index"
              [style.height.px]="row.cells.length && row.isHelperRow ? elementModel.styling.fontSize * 1.5 :
                                                                              elementModel.styling.fontSize * 2"
              [style.font-size]="row.cells.length && row.isHelperRow && '70%'"
              [style.background-color]="row.isHelperRow ?
                                        elementModel.styling.helperRowColor : 'transparent'">
            <td *ngFor="let cell of row.cells" [attr.contenteditable]="cell.isEditable"
                #input
                [style.width.px]="elementModel.styling.fontSize * 2"
                [class.strike-through]="cell.isCrossedOut"
                [textContent]="cell.value"
                [attr.inputmode]="elementModel.showSoftwareKeyboard ||
                                    elementModel.hideNativeKeyboard ? 'none' : 'text'"
                (focus)="focusChanged.emit({ inputElement: input, row, cell, focused: true })"
                (selectstart)="preventSelection($event)"
                (blur)="focusChanged.emit({ inputElement: input, row, cell, focused: false })"
                (paste)="$event.preventDefault()"
                (keydown)="onKeyDown.emit(); onCharEnter($event, row, cell); "
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
    </ng-template>
  `,
  styles: [
    '.wrapper {display: flex; flex-direction: row;}',
    '.wrapper button {align-self: end; border-radius: 50%; margin-left: 10px;}',
    'table {border-spacing: 0; border-collapse: collapse;}',
    'td {border: 1px solid grey; text-align: center; caret-color: transparent;}',
    'td.strike-through {text-decoration: line-through; text-decoration-thickness: 3px;}',
    'td:focus {background-color: #00606425; outline: unset;}',
    'table.underline-first-row tr:first-child {border-bottom: 3px solid black;}',
    'table.underline-third-row tr:nth-child(3) {border-bottom: 3px solid black;}',
    'table.has-result-row tr:last-child {border-top: 3px solid black;}',
    '.terms-missing-warning {font-size: larger; color: red;}'
  ]
})
export class MathTableComponent extends ElementComponent implements OnInit {
  @ViewChildren('input') cells!: QueryList<ElementRef>;

  @Input() elementModel!: MathTableElement;
  @Input() tableModel: MathTableRow[] = [];

  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() onKeyDown = new EventEmitter<void>();
  @Output() focusChanged = new EventEmitter<{
    inputElement: HTMLTableCellElement;
    row: MathTableRow,
    cell: MathTableCell,
    focused: boolean
  }>();

  ngOnInit() {
    if (!this.tableModel.length) this.createTableModel();
  }

  refresh(): void {
    this.createTableModel();
  }

  private createTableModel(): void {
    switch (this.elementModel.operation) {
      case 'variable': {
        this.tableModel = this.createVariableModel();
        break;
      }
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

  private createVariableModel(): MathTableRow[] {
    const operatorOffset = 0; // offset for operatorChar
    const width = Math.max(
      ...this.elementModel.terms.map(term => term.length + operatorOffset),
      this.elementModel.result.length,
      this.elementModel.resultHelperRow.length,
      1 // have at least one empty column, so the table does not disappear completely when terms are empty
    );
    return [
      ...this.elementModel.variableLayoutOptions.showTopHelperRows ?
        [MathTableComponent.createHelperRow(width, true)] : [],
      ...this.elementModel.variableLayoutOptions.showTopHelperRows ?
        [MathTableComponent.createHelperRow(width, true)] : [],
      ...this.elementModel.terms
        .map((term: string, i: number) => MathTableComponent.createNormalRow(
          width - operatorOffset, term, undefined, i === 0
        )),
      ...this.elementModel.variableLayoutOptions.showResultRow ?
        [MathTableComponent.createHelperRow(width, false, this.elementModel.resultHelperRow)] : [],
      ...this.elementModel.variableLayoutOptions.showResultRow ?
        [MathTableComponent.createResultRow(width, this.elementModel.result)] : []
    ];
  }

  private createAdditionModel(): MathTableRow[] {
    const operatorOffset = 1; // offset for operatorChar
    const width = Math.max(
      ...this.elementModel.terms.map(term => term.length + operatorOffset),
      this.elementModel.result.length,
      this.elementModel.resultHelperRow.length
    );
    return [
      ...this.elementModel.terms
        .map((term: string, i: number) => MathTableComponent.createNormalRow(
          width - operatorOffset, term, i > 0 ? '+' : ' '
        )),
      MathTableComponent.createHelperRow(width, false, this.elementModel.resultHelperRow),
      MathTableComponent.createResultRow(width, this.elementModel.result)
    ];
  }

  private createSubstractionModel(): MathTableRow[] {
    const operatorOffset = 1; // offset for operatorChar
    const width = Math.max(
      ...this.elementModel.terms.map(term => term.length + operatorOffset),
      this.elementModel.result.length,
      this.elementModel.resultHelperRow.length
    );
    return [
      MathTableComponent.createHelperRow(width, true),
      MathTableComponent.createHelperRow(width, true),
      ...this.elementModel.terms
        .map((term: string, i: number) => MathTableComponent.createNormalRow(
          width - operatorOffset, term, i > 0 ? '−' : ' ', i === 0
        )),
      MathTableComponent.createHelperRow(width, false, this.elementModel.resultHelperRow),
      MathTableComponent.createResultRow(width, this.elementModel.result)
    ];
  }

  private createMultiplicationModel(): MathTableRow[] {
    if (this.elementModel.terms.length < 2) return [];
    const width = Math.max(this.elementModel.terms[0].length + this.elementModel.terms[1].length + 3,
      this.elementModel.result.length,
      this.elementModel.resultHelperRow.length);
    return [
      MathTableComponent.createMultiplicationRow(width, this.elementModel.terms[0], this.elementModel.terms[1]),
      MathTableComponent.createNormalRow(width, ''),
      MathTableComponent.createHelperRow(width, false, this.elementModel.resultHelperRow),
      MathTableComponent.createResultRow(width, this.elementModel.result)
    ];
  }

  static createMultiplicationRow(width: number, term1: string, term2: string): MathTableRow {
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
  private static createHelperRow(width: number, is2DigitHelperRow: boolean, term?: string): MathTableRow {
    return {
      rowType: 'helper',
      cells: [
        ...MathTableComponent.createCharCells(width, term),
        ...MathTableComponent.fillCharCells(term)
      ],
      isHelperRow: true,
      is2DigitHelperRow,
      canBeCrossedOut: is2DigitHelperRow
    };
  }

  /* Empty cells have to have an extra map to ensure new object refs. */
  private static createNormalRow(width: number, term: string, operatorChar?: string,
                                 isStrikable: boolean = false): MathTableRow {
    return {
      rowType: 'normal',
      cells: [
        ...operatorChar ? [{ value: operatorChar }] : [],
        ...MathTableComponent.createCharCells(width, term),
        ...MathTableComponent.fillCharCells(term)
      ],
      canBeCrossedOut: isStrikable
    };
  }

  private static createResultRow(width: number, term: string): MathTableRow {
    return {
      rowType: 'result',
      cells: [
        ...MathTableComponent.createCharCells(width, term),
        ...MathTableComponent.fillCharCells(term)
      ]
    };
  }

  addRow(): void {
    const width = this.elementModel.terms[0].length + this.elementModel.terms[1].length + 3;
    this.tableModel.splice(
      this.tableModel.length - 2,
      0,
      MathTableComponent.createNormalRow(width, '')
    );
    this.emitModel();
  }

  removeRow() {
    this.tableModel.splice(this.tableModel.length - 3, 1);
    this.emitModel();
  }

  onCharEnter(event: KeyboardEvent, row: MathTableRow, cell: MathTableCell): void {
    // Prevent Dead keys
    if (['Dead', 'Process', 'Unidentified'].includes(event.key)) {
      const input = event.target as HTMLTableCellElement;
      input.blur();
      setTimeout(() => input.focus());
    } else {
      if (event.key === 'Tab') return; // allow normal Tab usage
      event.preventDefault();
      this.setCellValue(event.key, cell, row);
    }
  }

  private getNextCellIndexInRow(cellIndex: number, rowIndex: number): number {
    if (cellIndex < this.tableModel[rowIndex].cells.length - 1) {
      if (this.tableModel[rowIndex].cells[cellIndex + 1].isEditable) {
        return this.getFlatCellIndex(cellIndex + 1, rowIndex);
      }
      return this.getNextCellIndexInRow(cellIndex + 1, rowIndex);
    }
    return -1;
  }

  private getPreviousCellIndexInRow(cellIndex: number, rowIndex: number): number {
    if (cellIndex) {
      if (this.tableModel[rowIndex].cells[cellIndex - 1].isEditable) {
        return this.getFlatCellIndex(cellIndex - 1, rowIndex);
      }
      return this.getPreviousCellIndexInRow(cellIndex - 1, rowIndex);
    }
    return -1;
  }

  private getCellIndexInNextRow(cellIndex: number, rowIndex: number): number {
    if (rowIndex < this.tableModel.length - 1) {
      if (this.tableModel[rowIndex + 1].cells[cellIndex].isEditable) {
        return this.getFlatCellIndex(cellIndex, rowIndex + 1);
      }
      return this.getCellIndexInNextRow(cellIndex, rowIndex + 1);
    }
    return -1;
  }

  private getCellIndexInPreviousRow(cellIndex: number, rowIndex: number): number {
    if (rowIndex) {
      if (this.tableModel[rowIndex - 1].cells[cellIndex].isEditable) {
        return this.getFlatCellIndex(cellIndex, rowIndex - 1);
      }
      return this.getCellIndexInPreviousRow(cellIndex, rowIndex - 1);
    }
    return -1;
  }

  private getFlatCellIndex(cellIndex: number, rowIndex: number): number {
    const tableRowLength = this.tableModel[0].cells.length;
    const flatIndex = (tableRowLength * rowIndex) + cellIndex;
    if (flatIndex <= tableRowLength * this.tableModel.length - 1 + tableRowLength) {
      return flatIndex;
    }
    return -1;
  }

  private focusCell(index: number): void {
    if (index > -1) {
      const allCells: HTMLTableCellElement[] = this.cells
        .toArray().map(e => e.nativeElement as HTMLTableCellElement);
      allCells[index].focus();
    }
  }

  setCellValue(char: string, cell: MathTableCell, row: MathTableRow): void {
    if (['Backspace', 'Delete'].includes(char)) {
      cell.value = '';
      cell.isCrossedOut = false;
    }
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(char)) {
      const currentRowIndex = this.tableModel.findIndex(tableRow => row === tableRow);
      const currentCellIndex = row.cells.findIndex(rowCell => rowCell === cell);

      if (char === 'ArrowRight') {
        this.focusCell(this.getNextCellIndexInRow(currentCellIndex, currentRowIndex));
      }

      if (char === 'ArrowLeft') {
        this.focusCell(this.getPreviousCellIndexInRow(currentCellIndex, currentRowIndex));
      }

      if (char === 'ArrowDown') {
        this.focusCell(this.getCellIndexInNextRow(currentCellIndex, currentRowIndex));
      }

      if (char === 'ArrowUp') {
        this.focusCell(this.getCellIndexInPreviousRow(currentCellIndex, currentRowIndex));
      }
    }
    const allowedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    if (this.elementModel.operation === 'multiplication' && !row.isHelperRow) {
      allowedKeys.push('+', '-', '*', ':', '/');
    }
    if (this.elementModel.operation === 'variable' && this.elementModel.variableLayoutOptions.allowArithmeticChars) {
      allowedKeys.push('+', '-', '*', ':', '/', '=');
    }
    if (!allowedKeys.includes(char)) return;

    if (row.is2DigitHelperRow && cell.value.length === 1) {
      cell.value += MathTableComponent.getCharReplacement(char);
    } else {
      cell.value = MathTableComponent.getCharReplacement(char);
    }
    this.emitModel();
  }

  private static fillCharCells(term: string | undefined): MathTableCell[] {
    if (!term) return [];
    return term.split('').map(char => ({
      value: char === '_' ? ' ' : MathTableComponent.getCharReplacement(char), // underscore as space alternative
      isEditable: char === ' ' || char === '_'
    }));
  }

  private static createCharCells(width: number, term: string | undefined): MathTableCell[] {
    const termLength = term ? term.length : 0;
    return Array(width - termLength).fill(null)
      .map(() => ({ value: '', isEditable: !term }));
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

  // eslint-disable-next-line class-methods-use-this
  preventSelection(event: Event): void {
    const selection = window.getSelection() as Selection;
    setTimeout(() => selection.removeAllRanges());
    event.preventDefault();
    event.stopPropagation();
  }
}
