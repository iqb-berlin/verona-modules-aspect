import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  DynamicSectionHelperGridComponent
} from 'editor/src/app/components/dynamic-section-helper-grid/dynamic-section-helper-grid.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';

type DropContainerData = { pageIndex: number, sectionIndex: number; gridCoordinates: number[]; };

const createElement = (gridColumn: number, gridColumnRange: number, gridRow: number, gridRowRange: number) => ({
  position: {
    gridColumn, gridColumnRange, gridRow, gridRowRange
  }
});

describe('DynamicSectionHelperGridComponent', () => {
  let component: DynamicSectionHelperGridComponent;
  let fixture: ComponentFixture<DynamicSectionHelperGridComponent>;
  let elementService: SpyObj<ElementService>;

  const createDropEvent = (
    dragType: string,
    previousContainerData: { pageIndex: number, sectionIndex: number },
    containerData: DropContainerData
  ): CdkDragDrop<DropContainerData> => ({
    item: { data: { dragType, element: { id: 'text_1' } as unknown as UIElement } },
    previousContainer: { data: previousContainerData },
    container: { data: containerData }
  } as unknown as CdkDragDrop<DropContainerData>);

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateElementsPositionProperty', 'addElementToSection']);

    await TestBed.configureTestingModule({
      declarations: [DynamicSectionHelperGridComponent],
      imports: [CommonModule, DragDropModule],
      providers: [
        { provide: UnitService, useValue: {} as UnitService },
        { provide: ElementService, useValue: elementService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicSectionHelperGridComponent);
    component = fixture.componentInstance;
    component.section = {
      elements: [createElement(1, 2, 3, 1)]
    } as unknown as Section;
    component.autoColumnSize = true;
    component.autoRowSize = true;
    component.gridColumnSizes = [{ value: 1, unit: 'fr' }];
    component.gridRowSizes = [{ value: 1, unit: 'fr' }];
    component.pageIndex = 0;
    component.sectionIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive the grid size from the element positions when sizing is automatic', () => {
    expect(component.columnCountArray.length).toBe(2);
    expect(component.rowCountArray.length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.grid-placeholder').length).toBe(6);
  });

  it('should always keep at least one row and one column', () => {
    component.section = { elements: [] } as unknown as Section;

    component.refresh();

    expect(component.columnCountArray.length).toBe(1);
    expect(component.rowCountArray.length).toBe(1);
  });

  it('should use the configured size arrays when sizing is not automatic', () => {
    component.autoColumnSize = false;
    component.autoRowSize = false;
    component.gridColumnSizes = [{ value: 1, unit: 'fr' }, { value: 2, unit: 'fr' }, { value: 1, unit: 'fr' }];
    component.gridRowSizes = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];

    component.ngOnChanges({ autoColumnSize: new SimpleChange(true, false, false) });

    expect(component.columnCountArray.length).toBe(3);
    expect(component.rowCountArray.length).toBe(2);
  });

  it('should update grid row and column of a moved element on drop', () => {
    component.drop(createDropEvent(
      'move',
      { pageIndex: 0, sectionIndex: 0 },
      { pageIndex: 0, sectionIndex: 0, gridCoordinates: [2, 4] }
    ));

    expect(elementService.updateElementsPositionProperty)
      .toHaveBeenCalledWith([{ id: 'text_1' }], 'gridRow', 2);
    expect(elementService.updateElementsPositionProperty)
      .toHaveBeenCalledWith([{ id: 'text_1' }], 'gridColumn', 4);
  });

  it('should emit transferElement when the element is dropped in another section', () => {
    let transfer: { sourcePageIndex: number, sourceSectionIndex: number,
      targetPageIndex: number, targetSectionIndex: number } | undefined;
    component.transferElement.subscribe(event => {
      transfer = event;
    });

    component.drop(createDropEvent(
      'move',
      { pageIndex: 0, sectionIndex: 1 },
      { pageIndex: 1, sectionIndex: 0, gridCoordinates: [1, 1] }
    ));

    expect(transfer).toEqual({
      sourcePageIndex: 0, sourceSectionIndex: 1, targetPageIndex: 1, targetSectionIndex: 0
    });
  });

  it('should throw for an unknown drag type', () => {
    expect(() => component.drop(createDropEvent(
      'unknown',
      { pageIndex: 0, sectionIndex: 0 },
      { pageIndex: 0, sectionIndex: 0, gridCoordinates: [1, 1] }
    ))).toThrowError('Unknown drop event');
  });

  it('should add a new element at the grid coordinates of the drop target', () => {
    const preventDefault = vi.fn();
    const dragEvent = {
      preventDefault,
      dataTransfer: { getData: vi.fn().mockReturnValue('text') }
    } as unknown as DragEvent;

    component.newElementDropped(dragEvent, 2, 3);

    expect(preventDefault).toHaveBeenCalled();
    expect(elementService.addElementToSection)
      .toHaveBeenCalledWith('text', component.section, { x: 2, y: 3 });
  });
});
