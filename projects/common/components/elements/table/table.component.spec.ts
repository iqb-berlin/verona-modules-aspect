/* eslint-disable max-classes-per-file -- the host component and the module that gives it its template
   scope belong together in this spec. */
import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { SharedModule } from 'common/shared.module';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { TableGridRowsPipe } from 'common/pipes/table-grid-rows.pipe';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { TableElement, TableProperties } from 'common/models/elements/table';
import {
  TableChildOverlay
} from 'common/components/table-child-overlay/table-child-overlay.component';
import { TableComponent } from './table.component';

/** Stands in for the table edit dialog: it hands in what a header cell is edited with, as the dialog
   does with the rich text editor. The input writes into the cell it was given. */
@Component({
  template: `
    <aspect-table [elementModel]="table" [allowElementEditing]="true"
                  [headerCellEditor]="cellEditor"></aspect-table>
    <ng-template #cellEditor let-cell>
      <input class="test-cell-editor" [value]="cell.text" (input)="cell.text = $any($event.target).value">
    </ng-template>`,
  standalone: false
})
class EditingHostComponent {
  table!: TableElement;
}

/** The host is declared in a module rather than through `declarations`: the AOT compiler resolves its
   template against the NgModule it belongs to. The table comes in through SharedModule, which declares
   it -- declaring it here as well would make it part of two modules. */
@NgModule({
  declarations: [EditingHostComponent],
  imports: [SharedModule]
})
class EditingHostModule {}

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  const createTableElement = (properties: Partial<TableProperties> = {}): TableElement => new TableElement({
    type: 'table',
    id: 'table_1',
    alias: 'table_1',
    isRelevantForPresentationComplete: true,
    elements: [],
    gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    gridRowSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
    tableEdgesEnabled: false,
    ...properties
  } as TableProperties);

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [
        TableComponent, TableChildOverlay, MeasurePipe, TableGridRowsPipe, SafeResourceHTMLPipe
      ],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
  });

  it('should create without a header', () => {
    component.elementModel = createTableElement();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.header-cell').length).toBe(0);
  });

  describe('header row (#864)', () => {
    const headerProperties: Partial<TableProperties> = {
      headerEnabled: true,
      headerRows: [[{ text: 'Column A' }, { text: 'Column B' }]]
    };

    it('should render one header cell per column with its text', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const headerCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.header-cell');
      expect(headerCells.length).toBe(2);
      expect(headerCells[0].textContent).toContain('Column A');
      expect(headerCells[1].textContent).toContain('Column B');
    });

    it('should not render header cells when the header is disabled', () => {
      component.elementModel = createTableElement({ ...headerProperties, headerEnabled: false });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-cell').length).toBe(0);
    });

    it('should move content cells below the header row', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const firstContentCell: HTMLElement = fixture.nativeElement.querySelector('.cell-container');
      expect(firstContentCell.style.gridRowStart).toBe('2');
    });

    it('should prepend an auto grid track for the header row', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const gridContainer: HTMLElement = fixture.nativeElement.querySelector('.grid-container');
      expect(gridContainer.style.gridTemplateRows).toBe('auto 1fr 1fr');
    });

    it('should mark header cells as sticky when stickyHeader is set', () => {
      component.elementModel = createTableElement({ ...headerProperties, stickyHeader: true });
      fixture.detectChanges();
      const headerCell: HTMLElement = fixture.nativeElement.querySelector('.header-cell');
      expect(headerCell.classList).toContain('sticky-header');
    });

    it('should not mark header cells as sticky by default', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const headerCell: HTMLElement = fixture.nativeElement.querySelector('.header-cell');
      expect(headerCell.classList).not.toContain('sticky-header');
    });

    it('should give header cells an opaque background for the default transparent table background', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const headerCell: HTMLElement = fixture.nativeElement.querySelector('.header-cell');
      expect(headerCell.style.backgroundColor).toBe('white');
    });

    /* Since 4.13 a header text is HTML from the rich text editor (#1430). Interpolated, the tags would
       stand in the cell as letters. */
    it('should render the rich text of a header cell as markup', () => {
      component.elementModel = createTableElement({
        headerEnabled: true,
        headerRows: [[{ text: '<p><strong>Bold</strong> head</p>' }, { text: 'a &lt; b' }]]
      });
      fixture.detectChanges();
      const headerCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.header-cell');
      expect(headerCells[0].querySelector('strong')?.textContent).toBe('Bold');
      expect(headerCells[0].textContent?.trim()).toBe('Bold head');
      expect(headerCells[1].textContent?.trim()).toBe('a < b');
    });

    it('should not set an alignment on header cells', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const headerCell: HTMLElement = fixture.nativeElement.querySelector('.header-cell');
      expect(headerCell.style.textAlign).toBe('');
    });

    it('should leave a header cell without an editor while element editing is not allowed', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-cell-editor').length).toBe(0);
    });

    it('should use the given content row height while keeping header rows compact', () => {
      component.elementModel = createTableElement(headerProperties);
      component.contentRowHeight = '250px';
      fixture.detectChanges();
      const gridContainer: HTMLElement = fixture.nativeElement.querySelector('.grid-container');
      expect(gridContainer.style.gridTemplateRows).toBe('auto 250px 250px');
    });
  });

  describe('multiple header rows (#864)', () => {
    const headerProperties: Partial<TableProperties> = {
      headerEnabled: true,
      headerRows: [[{ text: 'Column A' }, { text: 'Column B' }]]
    };

    const twoHeaderRows: Partial<TableProperties> = {
      headerEnabled: true,
      headerRows: [
        [{ text: 'Group' }, { text: '' }],
        [{ text: 'Value' }, { text: 'Unit' }]
      ]
    };

    it('should render all header rows and move content cells below them', () => {
      component.elementModel = createTableElement(twoHeaderRows);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-cell').length).toBe(4);
      const firstContentCell: HTMLElement = fixture.nativeElement.querySelector('.cell-container');
      expect(firstContentCell.style.gridRowStart).toBe('3');
      const gridContainer: HTMLElement = fixture.nativeElement.querySelector('.grid-container');
      expect(gridContainer.style.gridTemplateRows).toBe('auto auto 1fr 1fr');
    });

    it('should stack sticky header rows by setting measured top offsets', () => {
      component.elementModel = createTableElement({ ...twoHeaderRows, stickyHeader: true });
      fixture.detectChanges();
      const headerCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.header-cell');
      expect(headerCells[0].style.top).toBe('0px');
      expect(parseFloat(headerCells[2].style.top)).toBe(headerCells[0].offsetHeight);
    });

    it('should not apply sticky positioning in the edit dialog', () => {
      component.elementModel = createTableElement({ ...twoHeaderRows, stickyHeader: true });
      component.allowElementEditing = true;
      fixture.detectChanges();
      const headerCell: HTMLElement = fixture.nativeElement.querySelector('.header-cell');
      expect(headerCell.classList).not.toContain('sticky-header');
      expect(headerCell.style.top).toBe('');
    });

    it('should offer adding a header row only in the last row and removing only with multiple rows', () => {
      component.elementModel = createTableElement(headerProperties);
      component.allowElementEditing = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-row-controls button').length).toBe(1);

      component.addHeaderRow();
      fixture.detectChanges();
      // second row: one add (last row) + two remove buttons (one per row)
      expect(fixture.nativeElement.querySelectorAll('.header-row-controls button').length).toBe(3);

      component.removeHeaderRow(1);
      fixture.detectChanges();
      expect(component.elementModel.headerRows.length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.header-row-controls button').length).toBe(1);
    });

    it('should size added header rows to the column count', () => {
      component.elementModel = createTableElement(headerProperties);
      component.addHeaderRow();
      expect(component.elementModel.headerRows[1].length).toBe(2);
    });
  });
});

/* The rich text editor lives in the editor project, out of reach of common: the dialog hands it in as
   a template, and what it is handed is the cell itself, so its edits reach the table (#1430). */
describe('TableComponent with a header cell editor', () => {
  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      imports: [EditingHostModule, TranslateModule.forRoot()]
    }).compileComponents();
  });

  it('should edit each header cell with the editor it is handed', () => {
    const hostFixture = TestBed.createComponent(EditingHostComponent);
    hostFixture.componentInstance.table = new TableElement({
      type: 'table',
      id: 'table_1',
      alias: 'table_1',
      elements: [],
      gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      tableEdgesEnabled: false,
      headerEnabled: true,
      headerRows: [[{ text: 'Column A' }, { text: 'Column B' }]]
    } as Partial<TableProperties>);
    hostFixture.detectChanges();
    const editors: NodeListOf<HTMLInputElement> = hostFixture.nativeElement.querySelectorAll('.test-cell-editor');
    expect(Array.from(editors).map(editor => editor.value)).toEqual(['Column A', 'Column B']);

    editors[1].value = 'changed';
    editors[1].dispatchEvent(new Event('input'));

    expect(hostFixture.componentInstance.table.headerRows[0][1].text).toBe('changed');
  });

  /* An editor holds state of its own -- the rich text editor its undo history. Tracked by position, the
     editors of the first row would be handed the second row's cells and the second row's destroyed. */
  it('should keep the editors of the remaining header row when a row above it is removed', () => {
    const hostFixture = TestBed.createComponent(EditingHostComponent);
    const table = new TableElement({
      type: 'table',
      id: 'table_1',
      alias: 'table_1',
      elements: [],
      gridColumnSizes: [{ value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      tableEdgesEnabled: false,
      headerEnabled: true,
      headerRows: [[{ text: 'First' }], [{ text: 'Second' }]]
    } as Partial<TableProperties>);
    hostFixture.componentInstance.table = table;
    hostFixture.detectChanges();
    const editorOfSecondRow = hostFixture.nativeElement.querySelectorAll('.test-cell-editor')[1];

    table.removeHeaderRow(0);
    hostFixture.detectChanges();

    const editors: NodeListOf<HTMLInputElement> = hostFixture.nativeElement.querySelectorAll('.test-cell-editor');
    expect(editors.length).toBe(1);
    expect(editors[0]).toBe(editorOfSecondRow);
  });
});
