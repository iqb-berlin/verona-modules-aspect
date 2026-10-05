/* eslint-disable max-classes-per-file -- the dialog's two children are mocked side by side. */
import {
  Component, EventEmitter, forwardRef, Input, OnInit, Output, TemplateRef, ViewContainerRef
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { TableComponent } from 'common/components/elements/table/table.component';
import { UIElement } from 'common/models/elements/element';
import { TableElement, TableHeaderCell, TableProperties } from 'common/models/elements/table';
import {
  TableChildOverlay
} from 'common/components/table-child-overlay/table-child-overlay.component';
import { DropListElement } from 'common/models/elements/drop-list';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import {
  TableEditDialogComponent
} from 'editor/src/app/components/dialogs/table-edit-dialog/table-edit-dialog.component';

/** Renders the header cell editor the dialog hands in once per header cell, as the real table does in
   the dialog. It does so from code: an inline template of a spec-local component is compiled without
   a module, so `ngTemplateOutlet` would be unknown there. */
@Component({
  selector: 'aspect-table',
  template: '',
  standalone: false,
  providers: [{ provide: TableComponent, useExisting: forwardRef(() => MockTableComponent) }]
})
class MockTableComponent implements OnInit {
  @Input() elementModel!: TableElement;
  @Input() editorMode: boolean = false;
  @Input() allowElementEditing: boolean = false;
  @Input() contentRowHeight: string | null = null;
  @Input() headerCellEditor: TemplateRef<{ $implicit: TableHeaderCell }> | null = null;
  @Output() elementAdded = new EventEmitter<{ elementType: UIElementType, row: number, col: number }>();
  @Output() elementRemoved = new EventEmitter<{ row: number, col: number }>();
  refresh = vi.fn();

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit(): void {
    const editor = this.headerCellEditor;
    if (!editor) return;
    this.elementModel.headerRows.flat()
      .forEach(cell => this.viewContainerRef.createEmbeddedView(editor, { $implicit: cell }));
  }
}

@Component({
  selector: 'aspect-rich-text-editor',
  template: '',
  standalone: false
})
class MockRichTextEditorComponent {
  @Input() content!: string;
  @Input() showReducedControls: boolean = false;
  @Input() defaultFontSize!: number;
  @Output() contentChange = new EventEmitter<string>();
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
        MockTableComponent,
        MockRichTextEditorComponent
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

  /* The dialog edits a copy, so that cancelling can leave the table as it was (#1270). The copy is
     not a duplicate: the cells in it are the very same objects, which is what keeps the selection and
     the references pointing at what the unit holds. */
  it('should edit a copy that holds the same cells as the injected table', () => {
    const cell = { gridRow: 1, gridColumn: 1 } as unknown as UIElement;
    table.elements = [cell];

    const dialog = TestBed.createComponent(TableEditDialogComponent).componentInstance;

    expect(dialog.newTable).not.toBe(table);
    expect(dialog.newTable.elements).not.toBe(table.elements);
    expect(dialog.newTable.elements[0]).toBe(cell);
    expect(dialog.newTable).toBeInstanceOf(TableElement);
  });

  it('should hand its copy over to the table component', () => {
    expect(getTableMock().elementModel).toBe(component.newTable);
    expect(getTableMock().editorMode).toBe(true);
    expect(getTableMock().allowElementEditing).toBe(true);
  });

  /* Header cells are edited in place, so the copy needs its own -- otherwise cancelling would keep a
     changed caption. */
  it('should copy the header rows down to their cells', () => {
    table.headerRows = [[{ text: 'Kopf' }]];

    const copy = TestBed.createComponent(TableEditDialogComponent).componentInstance.newTable;

    expect(copy.headerRows).toEqual(table.headerRows);
    expect(copy.headerRows[0][0]).not.toBe(table.headerRows[0][0]);
  });

  /* A header cell is edited with the reduced rich text editor, which writes into the copy's cell and
     leaves the injected table alone until saving (#1430). */
  it('should edit each header cell of the copy with the reduced rich text editor', () => {
    table.headerRows = [[{ text: '<p>Kopf</p>' }, { text: '' }]];
    const dialogFixture = TestBed.createComponent(TableEditDialogComponent);
    dialogFixture.detectChanges();

    const editors = dialogFixture.debugElement.queryAll(By.directive(MockRichTextEditorComponent))
      .map(debugElement => debugElement.componentInstance as MockRichTextEditorComponent);
    expect(editors.length).toBe(2);
    expect(editors[0].content).toBe('<p>Kopf</p>');
    expect(editors[0].showReducedControls).toBe(true);
    expect(editors[0].defaultFontSize).toBe(table.styling.fontSize);

    editors[0].contentChange.emit('<p><strong>Kopf</strong></p>');

    expect(dialogFixture.componentInstance.newTable.headerRows[0][0].text).toBe('<p><strong>Kopf</strong></p>');
    expect(table.headerRows[0][0].text).toBe('<p>Kopf</p>');
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

  /* Removing takes the cell out of the copy and nothing else: the unit keeps it until the dialog is
     saved, which is what makes cancelling work (#1270). */
  it('should take the element of the given cell out of the copy without touching the table', () => {
    const element = {
      gridRow: 2,
      gridColumn: 1,
      unregisterIDs: vi.fn()
    } as unknown as UIElement;
    const otherElement = { gridRow: 1, gridColumn: 1, unregisterIDs: vi.fn() } as unknown as UIElement;
    table.elements = [otherElement, element];
    component.newTable.elements = [otherElement, element];

    component.removeElement({ row: 1, col: 0 });

    expect(component.newTable.elements).toEqual([otherElement]);
    expect(table.elements).toEqual([otherElement, element]);
    expect(element.unregisterIDs).not.toHaveBeenCalled();
  });

  /* splice() counts a missing cell as the last one, which would take an unrelated element out of the
     table. */
  it('should keep the copy as it is when no element sits in the given cell', () => {
    const element = { gridRow: 1, gridColumn: 1, unregisterIDs: vi.fn() } as unknown as UIElement;
    component.newTable.elements = [element];

    component.removeElement({ row: 4, col: 4 });

    expect(component.newTable.elements).toEqual([element]);
  });

  it('should release the IDs of a removed cell and deselect it when saving', () => {
    const selectionService = TestBed.inject(SelectionService);
    const element = { gridRow: 2, gridColumn: 1, unregisterIDs: vi.fn() } as unknown as UIElement;
    component.newTable.elements = [element];
    selectionService.selectElement({
      elementComponent: { element, setSelected: () => {} } as unknown as TableChildOverlay,
      multiSelect: false
    });

    component.removeElement({ row: 1, col: 0 });

    expect(element.unregisterIDs).not.toHaveBeenCalled();
    expect(selectionService.getSelectedElements()).toEqual([element]);

    component.save();

    expect(element.unregisterIDs).toHaveBeenCalled();
    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  /* Closing without saving throws the copy away, and the elements built into it go with it -- their
     IDs were taken when they were created and have to come back (#1270, same leak as #1278). */
  it('should release the IDs of elements that were added and not saved', async () => {
    useTableMockAsViewChild();
    await component.addElement({ elementType: 'checkbox', row: 0, col: 0 });
    const added = component.newTable.elements[0];

    fixture.destroy();

    expect(idService.unregister).toHaveBeenCalledWith(added.id, true, false);
    expect(idService.unregister).toHaveBeenCalledWith(added.alias, false, true);
  });

  it('should keep the IDs of added elements that were saved', async () => {
    useTableMockAsViewChild();
    await component.addElement({ elementType: 'checkbox', row: 0, col: 0 });

    component.save();
    fixture.destroy();

    expect(idService.unregister).not.toHaveBeenCalled();
  });

  /* A cell that was added and taken out again never reaches the unit, so it is no removal to carry
     to the save -- it only gives its IDs back right away. */
  it('should release the IDs of an added cell that was removed again', async () => {
    useTableMockAsViewChild();
    await component.addElement({ elementType: 'checkbox', row: 0, col: 0 });
    const added = component.newTable.elements[0];

    component.removeElement({ row: 0, col: 0 });

    expect(idService.unregister).toHaveBeenCalledWith(added.id, true, false);

    idService.unregister.mockClear();
    fixture.destroy();

    expect(idService.unregister).not.toHaveBeenCalled();
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
