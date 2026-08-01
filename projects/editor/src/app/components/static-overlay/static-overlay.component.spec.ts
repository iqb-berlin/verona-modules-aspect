import { ChangeDetectorRef } from '@angular/core';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Observable, of } from 'rxjs';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { StaticOverlayComponent } from 'editor/src/app/components/static-overlay/static-overlay.component';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

/* The component is instantiated directly instead of via TestBed: the inherited ngOnInit
   creates the wrapped element component through the ComponentRegistry, which needs a fully
   rendered canvas. That path is covered by the section component specs. Everything this
   component adds on top of ElementOverlay is plain class logic and tested here. */
describe('StaticOverlayComponent', () => {
  let component: StaticOverlayComponent;
  let selectionServiceMock: {
    selectedElements: Observable<UIElement[]>;
    getSelectedElements: Mock;
    clearElementSelection: Mock;
  };
  let elementService: SpyObj<ElementService>;
  let selectedElements: UIElement[];

  const createDragEvent = (x: number, y: number): CdkDragMove & CdkDragEnd => {
    const event = { distance: { x, y } };
    return event as unknown as CdkDragMove & CdkDragEnd;
  };

  beforeEach(() => {
    selectedElements = [{ id: 'text_1' } as unknown as UIElement];
    selectionServiceMock = {
      selectedElements: of(selectedElements),
      getSelectedElements: vi.fn().mockReturnValue(selectedElements),
      clearElementSelection: vi.fn()
    };
    elementService = createSpyObj<ElementService>([
      'updateElementsProperty', 'updateElementsDimensionsProperty', 'deleteElements'
    ]);

    component = new StaticOverlayComponent(
      selectionServiceMock as unknown as SelectionService,
      {} as UnitService,
      elementService,
      new DragNDropService(),
      { detectChanges: vi.fn() } as unknown as ChangeDetectorRef
    );
    component.element = {
      type: 'text',
      id: 'text_1',
      dimensions: { width: 100, height: 50 }
    } as unknown as PositionedUIElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resize the element relative to the size at drag start', () => {
    component.resizeDragStart();

    component.resizeElement(createDragEvent(30, -20));

    expect(component.element.dimensions.width).toBe(130);
    expect(component.element.dimensions.height).toBe(30);
  });

  it('should never resize the element below zero', () => {
    component.resizeDragStart();

    component.resizeElement(createDragEvent(-300, -300));

    expect(component.element.dimensions.width).toBe(0);
    expect(component.element.dimensions.height).toBe(0);
  });

  /* Asserts on the dimensions setter, not the generic one: width and height belong to the dimensions
     group, and going through updateElementsProperty wrote them onto the element root instead, where
     nothing reads them. The dragged element still looked right because resizeElement() mutates its
     dimensions as a live preview - the other selected elements did not (#1142). */
  it('should persist width and height of the selected elements when the resize drag ends', () => {
    selectedElements.push({ id: 'text_2' } as unknown as UIElement);
    component.resizeDragStart();

    component.updateModel(createDragEvent(20, 10));

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith(selectedElements, 'width', 120);
    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith(selectedElements, 'height', 60);
    expect(elementService.updateElementsProperty).not.toHaveBeenCalled();
  });

  it('should delete the selected elements and clear the selection', () => {
    component.deleteSelectedElements();

    expect(elementService.deleteElements).toHaveBeenCalledWith(selectedElements);
    expect(selectionServiceMock.clearElementSelection).toHaveBeenCalled();
  });
});
