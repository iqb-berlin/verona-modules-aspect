// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { By } from '@angular/platform-browser';
import { Section } from 'common/models/section';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import {
  DynamicSectionComponent
} from 'editor/src/app/components/dynamic-section/dynamic-section.component';
import {
  DynamicSectionHelperGridComponent
} from 'editor/src/app/components/dynamic-section-helper-grid/dynamic-section-helper-grid.component';
import {
  ElementGridChangeListenerDirective
} from 'editor/src/app/directives/element-grid-change-listener.directive';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Pipe({ name: 'measure', standalone: false })
class MockMeasurePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(): string {
    return '';
  }
}

@Component({
  selector: 'aspect-editor-dynamic-overlay',
  standalone: false,
  template: ''
})
class MockDynamicOverlayComponent {
  @Input() section!: Section;
  @Input() element!: PositionedUIElement;
  @Output() elementSelected = new EventEmitter();
}

const createElement = (id: string, gridColumn: number, gridRow: number) => ({
  id,
  type: 'text',
  position: {
    gridColumn,
    gridColumnRange: 1,
    gridRow,
    gridRowRange: 1,
    zIndex: 0,
    marginLeft: { value: 0, unit: 'px' },
    marginRight: { value: 0, unit: 'px' },
    marginTop: { value: 0, unit: 'px' },
    marginBottom: { value: 0, unit: 'px' }
  }
});

describe('DynamicSectionComponent', () => {
  let component: DynamicSectionComponent;
  let fixture: ComponentFixture<DynamicSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DynamicSectionComponent,
        DynamicSectionHelperGridComponent,
        ElementGridChangeListenerDirective,
        MockDynamicOverlayComponent,
        MockMeasurePipe
      ],
      imports: [CommonModule, DragDropModule],
      providers: [
        { provide: UnitService, useValue: {} as UnitService },
        { provide: ElementService, useValue: {} as ElementService },
        { provide: DragNDropService, useValue: new DragNDropService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicSectionComponent);
    component = fixture.componentInstance;
    component.section = {
      elements: [createElement('text_1', 1, 1), createElement('text_2', 2, 1)],
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: [{ value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      height: 400,
      backgroundColor: '#ffffff'
    } as unknown as Section;
    component.sectionIndex = 0;
    component.pageIndex = 0;
    component.dropListList = [];
    component.isSelected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one overlay per section element and hand the element down', () => {
    const overlays = fixture.debugElement.queryAll(By.directive(MockDynamicOverlayComponent));

    expect(overlays.length).toBe(2);
    expect(overlays[0].injector.get(MockDynamicOverlayComponent).element.id).toBe('text_1');
    expect(overlays[1].injector.get(MockDynamicOverlayComponent).element.id).toBe('text_2');
  });

  it('should provide the helper grid via ViewChild', () => {
    expect(component.helperGrid).toBeInstanceOf(DynamicSectionHelperGridComponent);
  });

  it('should collect the overlays as child element components', () => {
    expect(component.childElementComponents.length).toBe(2);
  });

  it('should re-emit elementSelected of a child overlay', () => {
    let selectedEmitted = false;
    component.elementSelected.subscribe(() => {
      selectedEmitted = true;
    });

    fixture.debugElement.queryAll(By.directive(MockDynamicOverlayComponent))[0]
      .injector.get(MockDynamicOverlayComponent).elementSelected.emit();

    expect(selectedEmitted).toBe(true);
  });

  it('should re-emit the transferElement event of the helper grid', () => {
    const transferEvent = {
      sourcePageIndex: 0, sourceSectionIndex: 1, targetPageIndex: 1, targetSectionIndex: 0
    };
    let emitted: typeof transferEvent | undefined;
    component.transferElement.subscribe(event => {
      emitted = event;
    });

    component.helperGrid.transferElement.emit(transferEvent);

    expect(emitted).toEqual(transferEvent);
  });

  it('should refresh the helper grid when an element changes its grid position', () => {
    const refreshSpy = vi.spyOn(component.helperGrid, 'refresh');

    fixture.debugElement.queryAll(By.directive(ElementGridChangeListenerDirective))[0]
      .injector.get(ElementGridChangeListenerDirective).elementChanged.emit();

    expect(refreshSpy).toHaveBeenCalled();
  });
});
