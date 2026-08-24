import { ChangeDetectorRef } from '@angular/core';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DynamicOverlayComponent } from 'editor/src/app/components/dynamic-overlay/dynamic-overlay.component';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

/* The component is instantiated directly instead of via TestBed: the inherited ngOnInit
   creates the wrapped element component through the ComponentRegistry, which needs a fully
   rendered canvas. That path is covered by the section component specs. Everything this
   component adds on top of ElementOverlay is plain class logic and tested here. */
describe('DynamicOverlayComponent', () => {
  let component: DynamicOverlayComponent;
  let selectionService: SpyObj<SelectionService>;
  let dragNDropService: DragNDropService;

  beforeEach(() => {
    selectionService = createSpyObj<SelectionService>(['selectElement']);
    dragNDropService = new DragNDropService();
    component = new DynamicOverlayComponent(
      selectionService,
      {} as UnitService,
      {} as ElementService,
      dragNDropService,
      { detectChanges: vi.fn() } as unknown as ChangeDetectorRef
    );
    component.element = { type: 'text', id: 'text_1' } as unknown as PositionedUIElement;
  });

  afterEach(() => {
    document.body.classList.remove('inheritCursors');
    document.body.style.cursor = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.bodyElement).toBe(document.body);
  });

  it('should select the element, apply the cursor fix and flag the drag on drag start', () => {
    component.startDrag();

    expect(selectionService.selectElement)
      .toHaveBeenCalledWith({ elementComponent: component, multiSelect: false });
    expect(document.body.classList.contains('inheritCursors')).toBe(true);
    expect(document.body.style.cursor).toBe('grabbing');
    expect(dragNDropService.isDragInProgress).toBe(true);
  });

  it('should revert the cursor fix and the drag flag on drag end', () => {
    component.startDrag();

    component.endDrag();

    expect(document.body.classList.contains('inheritCursors')).toBe(false);
    expect(document.body.style.cursor).toBe('unset');
    expect(dragNDropService.isDragInProgress).toBe(false);
  });

  it('should set and unset the cursor fix independently of the drag handlers', () => {
    component.setCursorFix();
    expect(document.body.classList.contains('inheritCursors')).toBe(true);

    component.unsetCursorFix();
    expect(document.body.classList.contains('inheritCursors')).toBe(false);
  });
});
