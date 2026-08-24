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
    isCompoundChildSelected: boolean;
  };
  let elementService: SpyObj<ElementService>;
  let selectedElements: UIElement[];
  let draggedElement: PositionedUIElement;

  const createDragEvent = (x: number, y: number): CdkDragMove & CdkDragEnd => {
    const event = { distance: { x, y } };
    return event as unknown as CdkDragMove & CdkDragEnd;
  };

  beforeEach(() => {
    /* The dragged element *is* the selected one, the same object the SelectionService hands out -
       the drag starts by selecting it. And it carries `dimensions` like every UIElement does, because
       the resize reads the starting size of each selected element, not just of the dragged one
       (#1156). */
    draggedElement = {
      type: 'text', id: 'text_1', dimensions: { width: 100, height: 50 }
    } as unknown as PositionedUIElement;
    selectedElements = [draggedElement];
    selectionServiceMock = {
      selectedElements: of(selectedElements),
      getSelectedElements: vi.fn().mockReturnValue(selectedElements),
      clearElementSelection: vi.fn(),
      isCompoundChildSelected: false
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
    component.element = draggedElement;
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
     nothing reads them (#1142). */
  it('should persist width and height when the resize drag ends', () => {
    component.resizeDragStart();

    component.updateModel(createDragEvent(20, 10));

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith([component.element], 'width', 120);
    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith([component.element], 'height', 60);
    expect(elementService.updateElementsProperty).not.toHaveBeenCalled();
  });

  /* Every selected element takes the distance dragged on top of its own size, the way a move works
     (SectionComponent.elementDropped). Until #1156 they were all given the absolute size of the
     dragged element, so a large image selected with a small border was shrunk to the border's size -
     with no undo in the editor to take it back. */
  describe('with several elements selected', () => {
    let secondElement: UIElement;

    beforeEach(() => {
      secondElement = { id: 'image_1', dimensions: { width: 400, height: 300 } } as unknown as UIElement;
      selectedElements.push(secondElement);
    });

    it('should grow each element by the dragged distance from its own size', () => {
      component.resizeDragStart();

      component.updateModel(createDragEvent(20, 10));

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([component.element], 'width', 120);
      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([component.element], 'height', 60);
      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([secondElement], 'width', 420);
      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([secondElement], 'height', 310);
    });

    /* The floor applies per element, so shrinking past zero stops the small one at zero without
       dragging the large one down by the same amount twice. */
    it('should not take any element below zero', () => {
      component.resizeDragStart();

      component.updateModel(createDragEvent(-200, -100));

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([component.element], 'width', 0);
      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([secondElement], 'width', 200);
      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([secondElement], 'height', 200);
    });

    /* The live preview stays on the dragged element - as with a move, where the CDK only transforms
       what is under the cursor. The others follow when the drag ends. */
    it('should preview the drag on the dragged element only', () => {
      component.resizeDragStart();

      component.resizeElement(createDragEvent(20, 10));

      expect(component.element.dimensions.width).toBe(120);
      expect(secondElement.dimensions.width).toBe(400);
      expect(secondElement.dimensions.height).toBe(300);
    });

    /* A second drag must measure from where the first one left off, not from the sizes of the drag
       before it - the map is rebuilt on every drag start. */
    it('should measure a second drag from the new sizes', () => {
      component.resizeDragStart();
      component.updateModel(createDragEvent(20, 10));
      // The service is a spy, so the model is followed by hand for the elements it would have written.
      component.element.dimensions.width = 120;
      secondElement.dimensions.width = 420;

      component.resizeDragStart();
      component.updateModel(createDragEvent(5, 0));

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([component.element], 'width', 125);
      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([secondElement], 'width', 425);
    });
  });

  /* The selection is dropped by deleteElements, once the deletion has actually happened -- not here,
     where the confirmation dialog is still open (#1258). */
  it('should hand the selected elements to the delete and leave the selection to it', () => {
    component.deleteSelectedElements();

    expect(elementService.deleteElements).toHaveBeenCalledWith(selectedElements);
    expect(selectionServiceMock.clearElementSelection).not.toHaveBeenCalled();
  });

  /* A cloze gap or a table cell in the selection takes deleting away, here as in the properties
     panel: the key would otherwise delete everything around the child and leave the child (#1268). */
  it('should not delete while a compound child is selected', () => {
    selectionServiceMock.isCompoundChildSelected = true;

    component.deleteSelectedElements();

    expect(elementService.deleteElements).not.toHaveBeenCalled();
  });
});
