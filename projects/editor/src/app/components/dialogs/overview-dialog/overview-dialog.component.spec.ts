import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { IDEditDialogComponent } from 'editor/src/app/components/dialogs/id-edit-dialog/id-edit-dialog.component';
import { OverviewDialogComponent } from 'editor/src/app/components/dialogs/overview-dialog/overview-dialog.component';

describe('OverviewDialogComponent', () => {
  let component: OverviewDialogComponent;
  let fixture: ComponentFixture<OverviewDialogComponent>;
  let elementService: SpyObj<ElementService>;
  let matDialog: SpyObj<MatDialog>;
  let firstSectionElements: UIElement[];
  let gap: UIElement;

  const createElement = (alias: string, type: string, children: UIElement[] = []): UIElement => ({
    type,
    id: alias,
    alias,
    isRelevantForPresentationComplete: true,
    setProperty: vi.fn(),
    getChildElements: () => children
  } as unknown as UIElement);

  /* `elements` is what the section holds itself, `getAllElements()` adds the children of compound
     elements after their parent - as the real section does. */
  const createSection = (elements: UIElement[]): Section => ({
    elements,
    getAllElements: () => elements.flatMap(element => [element, ...element.getChildElements()])
  } as unknown as Section);

  const createPage = (sections: Section[]): EditorPage => ({ sections } as unknown as EditorPage);

  beforeEach(async () => {
    firstSectionElements = [createElement('text_1', 'text')];
    gap = createElement('gap_1', 'text-field');
    const unitServiceMock = {
      unit: {
        pages: [
          createPage([
            createSection(firstSectionElements),
            createSection([createElement('button_1', 'button')])
          ]),
          createPage([createSection([
            createElement('text_2', 'text'),
            createElement('cloze_1', 'cloze', [gap])
          ])])
        ]
      }
    } as unknown as UnitService;
    elementService = createSpyObj<ElementService>(['updateElementsProperty', 'deleteElements']);
    elementService.deleteElements.mockResolvedValue(undefined);
    matDialog = createSpyObj<MatDialog>(['open']);
    matDialog.open.mockReturnValue({ afterClosed: () => of('neuer_alias') });

    await TestBed.configureTestingModule({
      declarations: [OverviewDialogComponent],
      imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: ElementService, useValue: elementService },
        { provide: MatDialog, useValue: matDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should collect all elements of all pages and sections with their indices', () => {
    expect(component.tableData.data.length).toBe(5);
    expect(component.tableData.data.map(row => row.element.alias))
      .toEqual(['text_1', 'button_1', 'text_2', 'cloze_1', 'gap_1']);
    expect(component.tableData.data[1].pageIndex).toBe(0);
    expect(component.tableData.data[1].sectionIndex).toBe(1);
    expect(component.tableData.data[2].pageIndex).toBe(1);
    expect(component.tableData.data[2].sectionIndex).toBe(0);
  });

  /* Written onto the elements, as it was before, the two numbers were own properties of the model and
     travelled into the stored unit definition with the next report (#1273). */
  it('should keep the position out of the elements', () => {
    const [element] = firstSectionElements;

    expect(Object.keys(element)).not.toContain('pageIndex');
    expect(Object.keys(element)).not.toContain('sectionIndex');
  });

  /* Alias, type and the presentation flag sit on the element, not on the row, so sorting reads them
     through the accessor -- the default data[columnName] finds nothing there and leaves the order as
     it is. */
  it('should sort by a column that lives on the element', () => {
    const sorted = component.tableData.sortData(
      component.tableData.data, { active: 'alias', direction: 'asc' } as MatSort
    );

    expect(sorted.map(row => row.element.alias))
      .toEqual(['button_1', 'cloze_1', 'gap_1', 'text_1', 'text_2']);
  });

  it('should offer as many section filter options as the page with the most sections has', () => {
    expect(component.availableSections.length).toBe(2);
  });

  it('should filter the table by page and shrink the available sections', () => {
    component.pageFilter = [1];

    component.updatePageFilter();

    expect(component.tableData.filteredData.map(row => row.element.alias))
      .toEqual(['text_2', 'cloze_1', 'gap_1']);
    expect(component.availableSections.length).toBe(1);
  });

  it('should filter the table by section', () => {
    component.sectionFilter = [1];

    component.updateSectionFilter();

    expect(component.tableData.filteredData.map(row => row.element.alias)).toEqual(['button_1']);
  });

  it('should toggle the selection of all filtered rows', () => {
    component.toggleAllRows();

    expect(component.elementSelection.selected.length).toBe(5);
    expect(component.tableSelection).toBe('all');

    component.toggleAllRows();

    expect(component.elementSelection.selected.length).toBe(0);
    expect(component.tableSelection).toBe('none');
  });

  it('should report a partial selection for a single row', () => {
    component.selectRow(component.tableData.data[0]);

    expect(component.tableSelection).toBe('some');
  });

  it('should clear the selection when a filter is applied', () => {
    component.toggleAllRows();
    component.pageFilter = [0];

    component.updatePageFilter();

    expect(component.elementSelection.selected.length).toBe(0);
    expect(component.tableSelection).toBe('none');
  });

  it('should apply the selected property value to the selection', () => {
    component.toggleAllRows();
    [component.selectedEditableProperty] = component.elementOptions;
    component.editablePropertyValue = false;

    component.applyValueToSelection();

    expect(elementService.updateElementsProperty).toHaveBeenCalledWith(
      component.elementSelection.selected.map(row => row.element), 'isRelevantForPresentationComplete', false
    );
  });

  /* A cloze gap or a table cell is listed like everything else, but no deletion here can reach it:
     the unit removes what a section holds itself (#1262). Offering the button anyway made it a
     confirmed no-op (#1267). */
  it('should name the children of compound elements', () => {
    expect(component.tableData.data.filter(row => row.isCompoundChild).map(row => row.element))
      .toEqual([gap]);
  });

  /* aria-disabled and not disabled: the button stays interactive so that its tooltip -- the only
     place that says why -- is reachable by mouse and keyboard (#1267). */
  it('should disable the delete button in the row of a compound child', () => {
    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-button'));

    expect(component.tableData.data[4].element.alias).toBe('gap_1');
    expect(deleteButtons[4].nativeElement.getAttribute('aria-disabled')).toBe('true');
    expect(deleteButtons[4].nativeElement.classList).not.toContain('deletable');
    expect(deleteButtons[3].nativeElement.getAttribute('aria-disabled')).toBeNull();
    expect(deleteButtons[3].nativeElement.classList).toContain('deletable');
  });

  it('should say on the disabled button where the element is deleted instead', () => {
    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-button'));

    expect(deleteButtons[4].injector.get(MatTooltip).message)
      .toBe('overviewDialog.compoundChildNotDeletable');
    expect(deleteButtons[3].injector.get(MatTooltip).message).toBe('');
  });

  /* The button is still clickable, so the refusal has to be in the handler too. */
  it('should not delete a compound child', async () => {
    await component.deleteElement(component.tableData.data[4]);

    expect(elementService.deleteElements).not.toHaveBeenCalled();
  });

  it('should delete an element and refresh the table data', async () => {
    const [row] = component.tableData.data;
    elementService.deleteElements.mockImplementation(() => {
      firstSectionElements.splice(0, 1);
      return Promise.resolve();
    });

    await component.deleteElement(row);

    expect(elementService.deleteElements).toHaveBeenCalledWith([row.element]);
    expect(component.tableData.data.length).toBe(4);
  });

  /* Refreshing builds new rows, and a selection that compared them by identity would silently come
     loose from the table it belongs to. */
  it('should keep a selection across a refresh of the rows', () => {
    const [, secondRow] = component.tableData.data;
    component.selectRow(secondRow);

    component.tableData.data = component.getTableData();

    expect(component.elementSelection.isSelected(component.tableData.data[1])).toBe(true);
  });

  it('should apply the new alias returned by the ID edit dialog', () => {
    const [{ element }] = component.tableData.data;

    component.editAlias(element);

    expect(matDialog.open).toHaveBeenCalledWith(IDEditDialogComponent, { data: { alias: 'text_1' } });
    expect(element.setProperty).toHaveBeenCalledWith('alias', 'neuer_alias');
  });
});
