import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { TableGridRowsPipe } from 'common/pipes/table-grid-rows.pipe';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { TableElement, TableProperties } from 'common/models/elements/table';
import {
  TableChildOverlay
} from 'common/components/table-child-overlay/table-child-overlay.component';
import { TableComponent } from './table.component';

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

    it('should leave a header cell without an edit button while element editing is not allowed', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-edit-button').length).toBe(0);
    });

    /* The rich text editor lives in the editor project, out of reach of common: in the edit dialog a
       header cell shows its text and asks the dialog to edit it, the way a content cell asks for a
       new element (#1430). */
    it('should show the text of a header cell and an edit button when element editing is allowed', () => {
      component.elementModel = createTableElement({
        headerEnabled: true,
        headerRows: [[{ text: '<p><strong>Bold</strong></p>' }, { text: 'Column B' }]]
      });
      component.allowElementEditing = true;
      fixture.detectChanges();
      const headerCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.header-cell');
      expect(headerCells[0].querySelector('strong')?.textContent).toBe('Bold');
      expect(fixture.nativeElement.querySelectorAll('.header-edit-button').length).toBe(2);
    });

    it('should ask for the header cell whose edit button is clicked', () => {
      component.elementModel = createTableElement(headerProperties);
      component.allowElementEditing = true;
      fixture.detectChanges();
      const requested = vi.spyOn(component.headerCellEditRequested, 'emit');

      fixture.nativeElement.querySelectorAll('.header-edit-button')[1].click();

      expect(requested).toHaveBeenCalledWith({ row: 0, col: 1 });
    });

    it('should use the given content row height while header rows keep the height of their content', () => {
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
