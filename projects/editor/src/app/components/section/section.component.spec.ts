// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { UIElement } from 'common/models/elements/element';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { SectionCounter } from 'common/utils/section-counter';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { SectionComponent } from 'editor/src/app/components/section/section.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorSection } from 'editor/src/app/models/editor-section';
import { ElementService } from 'editor/src/app/services/element.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({ selector: 'aspect-section-menu', standalone: false, template: '' })
class MockSectionMenuComponent {
  @Input() section!: EditorSection;
  @Input() sectionIndex!: number;
  @Input() pageIndex!: number;
  @Input() lastSectionIndex!: number;
  @Output() elementSelected = new EventEmitter<string>();
  @Output() elementHovered = new EventEmitter<string>();
  @Output() elementHoverEnd = new EventEmitter();
}

@Component({ selector: 'aspect-editor-static-section', standalone: false, template: '' })
class MockStaticSectionComponent {
  @Input() section!: EditorSection;
  @Input() isSelected!: boolean;
  @Output() elementSelected = new EventEmitter<unknown>();
}

@Component({ selector: 'aspect-editor-dynamic-section', standalone: false, template: '' })
class MockDynamicSectionComponent {
  @Input() section!: EditorSection;
  @Input() sectionIndex!: number;
  @Input() pageIndex!: number;
  @Input() isSelected!: boolean;
  @Output() elementSelected = new EventEmitter();
  @Output() transferElement = new EventEmitter<unknown>();
}

type DropContainerData = { pageIndex: number, sectionIndex: number; gridCoordinates?: number[]; };

describe('SectionComponent', () => {
  let component: SectionComponent;
  let fixture: ComponentFixture<SectionComponent>;
  let selectionService: SelectionService;
  let sectionService: SpyObj<SectionService>;
  let elementService: SpyObj<ElementService>;
  let unitServiceMock: UnitService;
  let pages: EditorPage[];

  const createPositionedElement = (id: string, xPosition: number, yPosition: number): PositionedUIElement => ({
    id,
    position: { xPosition, yPosition },
    dimensions: { width: 100, height: 50 }
  } as unknown as PositionedUIElement);

  const createDropEvent = (
    previousContainerData: DropContainerData,
    containerData: DropContainerData,
    distance: { x: number, y: number },
    sameContainer: boolean
  ): CdkDragDrop<DropContainerData> => {
    const container = { data: containerData };
    return {
      previousContainer: sameContainer ? container : { data: previousContainerData },
      container,
      distance
    } as unknown as CdkDragDrop<DropContainerData>;
  };

  beforeEach(async () => {
    SectionCounter.reset();
    selectionService = new SelectionService();
    sectionService = createSpyObj<SectionService>(['transferElements']);
    elementService = createSpyObj<ElementService>(['updateElementsPositionProperty']);
    pages = [new EditorPage(), new EditorPage()];
    pages[0].sections[0].height = 300;
    pages[0].hasMaxWidth = true;
    pages[0].maxWidth = 750;
    unitServiceMock = {
      unit: {
        pages,
        enableSectionNumbering: true,
        sectionNumberingPosition: 'left'
      },
      getSelectedPage: () => pages[0]
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [
        SectionComponent,
        MockSectionMenuComponent,
        MockStaticSectionComponent,
        MockDynamicSectionComponent
      ],
      imports: [CommonModule, DragDropModule],
      providers: [
        { provide: SelectionService, useValue: selectionService },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: ElementService, useValue: elementService },
        { provide: SectionService, useValue: sectionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionComponent);
    component = fixture.componentInstance;
    component.section = pages[0].sections[0];
    component.sectionIndex = 0;
    component.lastSectionIndex = 0;
    component.pageIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the dynamic section for dynamically positioned sections', () => {
    expect(fixture.nativeElement.querySelector('aspect-editor-dynamic-section')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('aspect-editor-static-section')).toBeFalsy();
  });

  it('should render the static section for statically positioned sections', () => {
    component.section.dynamicPositioning = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('aspect-editor-static-section')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('aspect-editor-dynamic-section')).toBeFalsy();
  });

  it('should count up the section number only for numbered sections', () => {
    component.updateSectionCounter();
    expect(component.sectionCounter).toBe(1);

    component.section.ignoreNumbering = true;
    component.updateSectionCounter();
    expect(component.sectionCounter).toBeUndefined();

    component.section.ignoreNumbering = false;
    component.alwaysVisiblePage = true;
    component.updateSectionCounter();
    expect(component.sectionCounter).toBeUndefined();
  });

  it('should move elements between sections and follow the selection to the target', () => {
    const elements: UIElement[] = [createPositionedElement('text_1', 0, 0)];

    component.moveElementsBetweenSections(elements, 0, 0, 1, 0);

    expect(sectionService.transferElements)
      .toHaveBeenCalledWith(elements, pages[0].sections[0], pages[1].sections[0]);
    expect(selectionService.selectedPageIndex).toBe(1);
    expect(selectionService.selectedSectionIndex).toBe(0);
  });

  it('should move the elements between sections when dropped in another drop list', () => {
    const element = createPositionedElement('text_1', 10, 10);
    vi.spyOn(selectionService, 'getSelectedElements').mockReturnValue([element]);

    component.elementDropped(createDropEvent(
      { pageIndex: 0, sectionIndex: 0 },
      { pageIndex: 1, sectionIndex: 0 },
      { x: 0, y: 0 },
      false
    ));

    expect(sectionService.transferElements)
      .toHaveBeenCalledWith([element], pages[0].sections[0], pages[1].sections[0]);
  });

  it('should shift the elements inside the section and clamp them to the page bounds', () => {
    const element = createPositionedElement('text_1', 10, 10);
    vi.spyOn(selectionService, 'getSelectedElements').mockReturnValue([element]);

    component.elementDropped(createDropEvent(
      { pageIndex: 0, sectionIndex: 0 },
      { pageIndex: 0, sectionIndex: 0 },
      { x: -100, y: 5000 },
      true
    ));

    expect(elementService.updateElementsPositionProperty)
      .toHaveBeenCalledWith([element], 'xPosition', 0);
    expect(elementService.updateElementsPositionProperty)
      .toHaveBeenCalledWith([element], 'yPosition', 250);
  });

  it('should sum up the section heights of the selected page', () => {
    expect(component.getPageHeight()).toBe(300);
  });
});
