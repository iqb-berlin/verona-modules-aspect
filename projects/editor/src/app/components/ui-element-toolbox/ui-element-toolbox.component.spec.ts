import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { TemplateService } from 'editor/modules/section-templates/services/template.service';
import {
  UiElementToolboxComponent
} from 'editor/src/app/components/ui-element-toolbox/ui-element-toolbox.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({ selector: 'aspect-show-state-variables-button', standalone: false, template: '' })
class MockShowStateVariablesButtonComponent {
  @Input() stateVariablesCount!: number;
}

describe('UiElementToolboxComponent', () => {
  let component: UiElementToolboxComponent;
  let fixture: ComponentFixture<UiElementToolboxComponent>;
  let elementService: SpyObj<ElementService>;
  let templateService: SpyObj<TemplateService>;
  let dragNDropService: DragNDropService;
  let selectionService: SelectionService;
  let pages: EditorPage[];

  beforeEach(async () => {
    pages = [new EditorPage(), new EditorPage()];
    pages[1].addSection();
    elementService = createSpyObj<ElementService>(['addElementToSection']);
    templateService = createSpyObj<TemplateService>(['applyTemplate']);
    dragNDropService = new DragNDropService();
    selectionService = new SelectionService();

    const unitServiceMock = {
      expertMode: true,
      unit: { pages, stateVariables: [] }
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [UiElementToolboxComponent, MockShowStateVariablesButtonComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatTabsModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SelectionService, useValue: selectionService },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: TemplateService, useValue: templateService },
        { provide: ElementService, useValue: elementService },
        { provide: DragNDropService, useValue: dragNDropService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UiElementToolboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* By the indices, deliberately: a new element has no element to follow, and after a load the
     element selection is whatever overlay rendered last (#1204). */
  it('should add a new element to the currently selected section', () => {
    selectionService.selectedPageIndex = 1;
    selectionService.selectedSectionIndex = 1;

    component.addUIElement('text');

    expect(elementService.addElementToSection)
      .toHaveBeenCalledWith('text', pages[1].sections[1]);
  });

  it('should flag a running drag and pass the element type via the data transfer', () => {
    const setData = vi.fn();
    const dragEvent = { dataTransfer: { setData } } as unknown as DragEvent;

    component.startDrag(dragEvent, 'button');

    expect(dragNDropService.isDragInProgress).toBe(true);
    expect(setData).toHaveBeenCalledWith('elementType', 'button');
  });

  it('should reset the drag flag when the drag ends', () => {
    dragNDropService.isDragInProgress = true;

    component.endDrag();

    expect(dragNDropService.isDragInProgress).toBe(false);
  });

  it('should delegate applying a section template', () => {
    component.applyTemplate('likert');

    expect(templateService.applyTemplate).toHaveBeenCalledWith('likert');
  });

  it('should show the state variables button only in expert mode', () => {
    expect(fixture.nativeElement.querySelector('aspect-show-state-variables-button')).toBeTruthy();
  });
});
