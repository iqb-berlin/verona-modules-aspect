import {
  Component, EventEmitter, forwardRef, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { TableComponent } from 'common/components/compound-group-elements/table/table.component';
import { UIElement } from 'common/models/elements/element';
import { TableElement, TableProperties } from 'common/models/elements/compound-group-elements/table/table';
import {
  TableChildOverlay
} from 'common/components/compound-group-elements/table-child-overlay/table-child-overlay.component';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  TableEditDialogComponent
} from 'editor/src/app/components/dialogs/table-edit-dialog/table-edit-dialog.component';

@Component({
  selector: 'aspect-table',
  template: '',
  standalone: false,
  providers: [{ provide: TableComponent, useExisting: forwardRef(() => MockTableComponent) }]
})
class MockTableComponent {
  @Input() elementModel!: TableElement;
  @Input() editorMode: boolean = false;
  @Input() allowElementEditing: boolean = false;
  @Input() contentRowHeight: string | null = null;
  @Output() elementAdded = new EventEmitter<{ elementType: UIElementType, row: number, col: number }>();
  @Output() elementRemoved = new EventEmitter<{ row: number, col: number }>();
  refresh = vi.fn();
}

describe('TableEditDialogComponent', () => {
  let component: TableEditDialogComponent;
  let fixture: ComponentFixture<TableEditDialogComponent>;
  let idService: SpyObj<IDService>;
  let dialogRefMock: { close: Mock };
  let table: TableElement;

  const createTable = (): TableElement => new TableElement({
    type: 'table',
    id: 'table_1',
    alias: 'table_1',
    elements: [],
    gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }],
    tableEdgesEnabled: false
  } as Partial<TableProperties>);

  const getTableMock = (): MockTableComponent => fixture.debugElement
    .query(By.directive(MockTableComponent)).componentInstance as MockTableComponent;

  /* The real table component is replaced by a mock, so the ViewChild query is satisfied explicitly. */
  const useTableMockAsViewChild = (): MockTableComponent => {
    const tableMock = getTableMock();
    component.tableComp = tableMock as unknown as TableComponent;
    return tableMock;
  };

  beforeEach(async () => {
    table = createTable();
    idService = createSpyObj<IDService>(['getAndRegisterNewID', 'register', 'unregister', 'isAliasAvailable']);
    idService.getAndRegisterNewID.mockImplementation((idType: string, alias?: boolean) => (
      alias ? `${idType}_alias` : `${idType}_1`
    ));
    idService.isAliasAvailable.mockReturnValue(true);
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [
        TableEditDialogComponent,
        MockTableComponent
      ],
      imports: [
        MatDialogModule,
        MatButtonModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { table } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: IDService, useValue: idService },
        { provide: DialogService, useValue: createSpyObj<DialogService>(['showImageResizeDialog']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hand the injected table over to the table component', () => {
    expect(component.newTable).toBe(table);
    expect(getTableMock().elementModel).toBe(table);
    expect(getTableMock().editorMode).toBe(true);
    expect(getTableMock().allowElementEditing).toBe(true);
  });

  it('should add a drop list with its table specific defaults at the given cell', async () => {
    const tableMock = useTableMockAsViewChild();

    await component.addElement({ elementType: 'drop-list', row: 1, col: 2 });

    expect(component.newTable.elements.length).toBe(1);
    const newElement = component.newTable.elements[0] as DropListElement;
    expect(newElement.type).toBe('drop-list');
    expect(newElement.onlyOneItem).toBe(true);
    expect(newElement.allowReplacement).toBe(true);
    expect(newElement.highlightReceivingDropList).toBe(true);
    expect(newElement.gridRow).toBe(2);
    expect(newElement.gridColumn).toBe(3);
    expect(tableMock.refresh).toHaveBeenCalled();
  });

  it('should strip position and dimension properties from new elements', async () => {
    useTableMockAsViewChild();

    await component.addElement({ elementType: 'checkbox', row: 0, col: 0 });

    const newElement = component.newTable.elements[0];
    expect(newElement.position).toBeUndefined();
    expect(newElement.dimensions).toBeUndefined();
  });

  it('should remove the element of the given cell and unregister its IDs', () => {
    const element = {
      gridRow: 2,
      gridColumn: 1,
      unregisterIDs: vi.fn()
    } as unknown as UIElement;
    const otherElement = { gridRow: 1, gridColumn: 1, unregisterIDs: vi.fn() } as unknown as UIElement;
    component.newTable.elements = [otherElement, element];

    component.removeElement({ row: 1, col: 0 });

    expect(element.unregisterIDs).toHaveBeenCalled();
    expect(component.newTable.elements).toEqual([otherElement]);
  });

  /* The dialog edits the table itself, so the cell leaves the unit here. A selected cell keeps the
     properties panel offering its controls, and its overlay is destroyed with it, so nothing else
     would take it out of the selection (#1261). */
  it('should take the removed cell out of the selection', () => {
    const selectionService = TestBed.inject(SelectionService);
    const element = { gridRow: 2, gridColumn: 1, unregisterIDs: vi.fn() } as unknown as UIElement;
    component.newTable.elements = [element];
    selectionService.selectElement({
      elementComponent: { element, setSelected: () => {} } as unknown as TableChildOverlay,
      multiSelect: false
    });

    component.removeElement({ row: 1, col: 0 });

    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  it('should react on the table component outputs', () => {
    const removeSpy = vi.spyOn(component, 'removeElement').mockImplementation(() => {});
    const addSpy = vi.spyOn(component, 'addElement').mockResolvedValue(undefined);

    getTableMock().elementAdded.emit({ elementType: 'text', row: 0, col: 0 });
    getTableMock().elementRemoved.emit({ row: 0, col: 0 });

    expect(addSpy).toHaveBeenCalledWith({ elementType: 'text', row: 0, col: 0 });
    expect(removeSpy).toHaveBeenCalledWith({ row: 0, col: 0 });
  });

  it('should close with the elements and header rows of the edited table', () => {
    const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

    saveButton.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith({
      elements: component.newTable.elements,
      headerRows: component.newTable.headerRows
    });
  });
});
