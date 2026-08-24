import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MathTableElement, MathTableProperties
} from 'common/models/elements/interactive-group-elements/math-table';
import { MathTableComponent } from './math-table.component';

describe('MathTableComponent', () => {
  let component: MathTableComponent;
  let fixture: ComponentFixture<MathTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MathTableComponent],
      imports: [
        MatIconModule,
        MatTooltipModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MathTableComponent);
    component = fixture.componentInstance;
    component.elementModel = new MathTableElement({
      type: 'math-table',
      id: 'test-id',
      alias: 'test-alias',
      operation: 'addition',
      terms: ['12', '34'],
      result: '46',
      resultHelperRow: ''
    } as Partial<MathTableProperties>);
    fixture.detectChanges();
  });

  const setOperation = (operation: 'variable' | 'addition' | 'subtraction' | 'multiplication',
                        terms: string[]): void => {
    component.elementModel.operation = operation;
    component.elementModel.terms = terms;
    component.refresh();
    fixture.detectChanges();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create an addition model with term, helper and result rows', () => {
    expect(component.tableModel.length).toBe(4);
    expect(component.tableModel[0].rowType).toBe('normal');
    expect(component.tableModel[1].cells[0].value).toBe('+');
    expect(component.tableModel[2].rowType).toBe('helper');
    expect(component.tableModel[3].rowType).toBe('result');
    expect(fixture.nativeElement.querySelectorAll('tr').length).toBe(4);
  });

  it('should show a warning for multiplication with less than 2 terms', () => {
    setOperation('multiplication', ['12']);
    expect(fixture.nativeElement.querySelector('.terms-missing-warning')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should set an allowed cell value and emit the table model', () => {
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    const helperRow = component.tableModel[2];
    const cell = helperRow.cells[0];
    component.setCellValue('5', cell, helperRow);
    expect(cell.value).toBe('5');
    expect(emitSpy).toHaveBeenCalledWith({ id: 'test-id', value: component.tableModel });
  });

  it('should ignore disallowed characters', () => {
    const emitSpy = vi.spyOn(component.elementValueChanged, 'emit');
    const helperRow = component.tableModel[2];
    const cell = helperRow.cells[0];
    component.setCellValue('a', cell, helperRow);
    expect(cell.value).toBe('');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should clear the cell value on Backspace', () => {
    const helperRow = component.tableModel[2];
    const cell = helperRow.cells[0];
    component.setCellValue('7', cell, helperRow);
    component.setCellValue('Backspace', cell, helperRow);
    expect(cell.value).toBe('');
    expect(cell.isCrossedOut).toBe(false);
  });

  it('should replace "*" with "•" in multiplication rows', () => {
    setOperation('multiplication', ['12', '13']);
    const normalRow = component.tableModel[1];
    const cell = normalRow.cells[0];
    component.setCellValue('*', cell, normalRow);
    expect(cell.value).toBe('•');
  });

  it('should add and remove rows for multiplication', () => {
    setOperation('multiplication', ['12', '13']);
    expect(component.tableModel.length).toBe(4);
    component.addRow();
    expect(component.tableModel.length).toBe(5);
    component.removeRow();
    expect(component.tableModel.length).toBe(4);
  });

  it('should append a second digit and allow crossing out in 2-digit helper rows', () => {
    setOperation('subtraction', ['45', '12']);
    const helperRow = component.tableModel[0];
    expect(helperRow.is2DigitHelperRow).toBe(true);
    const cell = helperRow.cells[0];
    component.setCellValue('1', cell, helperRow);
    component.setCellValue('2', cell, helperRow);
    expect(cell.value).toBe('12');
    component.toggleStrikeThrough(helperRow, cell);
    expect(cell.isCrossedOut).toBe(true);
  });

  it('should not cross out empty cells', () => {
    setOperation('subtraction', ['45', '12']);
    const helperRow = component.tableModel[0];
    const cell = helperRow.cells[0];
    component.toggleStrikeThrough(helperRow, cell);
    expect(cell.isCrossedOut).toBeUndefined();
  });
});
