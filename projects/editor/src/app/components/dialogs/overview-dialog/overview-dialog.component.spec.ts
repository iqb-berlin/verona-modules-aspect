import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
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

  const createElement = (alias: string, type: string): UIElement => ({
    type,
    id: alias,
    alias,
    isRelevantForPresentationComplete: true,
    setProperty: vi.fn()
  } as unknown as UIElement);

  const createSection = (elements: UIElement[]): Section => ({
    getAllElements: () => elements
  } as unknown as Section);

  const createPage = (sections: Section[]): EditorPage => ({ sections } as unknown as EditorPage);

  beforeEach(async () => {
    firstSectionElements = [createElement('text_1', 'text')];
    const unitServiceMock = {
      unit: {
        pages: [
          createPage([
            createSection(firstSectionElements),
            createSection([createElement('button_1', 'button')])
          ]),
          createPage([createSection([createElement('text_2', 'text')])])
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
    expect(component.tableData.data.length).toBe(3);
    expect(component.tableData.data.map(element => element.alias))
      .toEqual(['text_1', 'button_1', 'text_2']);
    expect(component.tableData.data[1].pageIndex).toBe(0);
    expect(component.tableData.data[1].sectionIndex).toBe(1);
    expect(component.tableData.data[2].pageIndex).toBe(1);
    expect(component.tableData.data[2].sectionIndex).toBe(0);
  });

  it('should offer as many section filter options as the page with the most sections has', () => {
    expect(component.availableSections.length).toBe(2);
  });

  it('should filter the table by page and shrink the available sections', () => {
    component.pageFilter = [1];

    component.updatePageFilter();

    expect(component.tableData.filteredData.map(element => element.alias)).toEqual(['text_2']);
    expect(component.availableSections.length).toBe(1);
  });

  it('should filter the table by section', () => {
    component.sectionFilter = [1];

    component.updateSectionFilter();

    expect(component.tableData.filteredData.map(element => element.alias)).toEqual(['button_1']);
  });

  it('should toggle the selection of all filtered rows', () => {
    component.toggleAllRows();

    expect(component.elementSelection.selected.length).toBe(3);
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
      component.elementSelection.selected, 'isRelevantForPresentationComplete', false
    );
  });

  it('should delete an element and refresh the table data', async () => {
    const [element] = component.tableData.data;
    elementService.deleteElements.mockImplementation(() => {
      firstSectionElements.splice(0, 1);
      return Promise.resolve();
    });

    await component.deleteElement(element);

    expect(elementService.deleteElements).toHaveBeenCalledWith([element]);
    expect(component.tableData.data.length).toBe(2);
  });

  it('should apply the new alias returned by the ID edit dialog', () => {
    const [element] = component.tableData.data;

    component.editAlias(element);

    expect(matDialog.open).toHaveBeenCalledWith(IDEditDialogComponent, { data: { alias: 'text_1' } });
    expect(element.setProperty).toHaveBeenCalledWith('alias', 'neuer_alias');
  });
});
