import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { MeasurePipe } from 'common/pipes/measure.pipe';
import { TableGridRowsPipe } from 'common/pipes/table-grid-rows.pipe';
import { TableElement, TableProperties } from 'common/models/elements/compound-elements/table/table';
import { TableChildOverlay } from 'common/components/compound-elements/table/table-child-overlay.component';
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
      declarations: [TableComponent, TableChildOverlay, MeasurePipe, TableGridRowsPipe],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule, MatButtonModule, MatButtonToggleModule, MatMenuModule, MatTooltipModule
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
      headerRows: [[{ text: 'Column A', alignment: 'left' }, { text: 'Column B', alignment: 'right' }]]
    };

    it('should render one header cell per column with its text and alignment', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      const headerCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.header-cell');
      expect(headerCells.length).toBe(2);
      expect(headerCells[0].textContent).toContain('Column A');
      expect(headerCells[0].style.textAlign).toBe('left');
      expect(headerCells[1].textContent).toContain('Column B');
      expect(headerCells[1].style.textAlign).toBe('right');
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

    it('should render header texts as plain text without inputs outside of the edit dialog', () => {
      component.elementModel = createTableElement(headerProperties);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-text-input').length).toBe(0);
    });

    it('should render inputs and alignment toggles when element editing is allowed', () => {
      component.elementModel = createTableElement(headerProperties);
      component.allowElementEditing = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.header-text-input').length).toBe(2);
      expect(fixture.nativeElement.querySelectorAll('.header-alignment-toggle').length).toBe(2);
    });

    it('should update the element model on header cell changes', () => {
      component.elementModel = createTableElement(headerProperties);
      component.updateHeaderCellText(0, 0, 'changed');
      component.updateHeaderCellAlignment(0, 1, 'center');
      expect(component.elementModel.headerRows[0][0].text).toBe('changed');
      expect(component.elementModel.headerRows[0][1].alignment).toBe('center');
    });
  });
});
