import { ChangeDetectorRef, ComponentRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';

class TestElementOverlay extends ElementOverlay {}

/* ngOnInit is not covered here: it creates the wrapped child component via ViewContainerRef
   and ComponentRegistry, which needs a fully rendered canvas host. That path is exercised
   indirectly by the canvas component specs. The remaining public API is tested in isolation. */
describe('ElementOverlay', () => {
  let overlay: TestElementOverlay;
  let selectionServiceSpy: SpyObj<SelectionService>;
  let elementServiceSpy: SpyObj<ElementService>;
  let changeDetectorMock: { detectChanges: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    selectionServiceSpy = createSpyObj<SelectionService>(['selectElement']);
    elementServiceSpy = createSpyObj<ElementService>(['showDefaultEditDialog']);
    changeDetectorMock = { detectChanges: vi.fn() };
    overlay = new TestElementOverlay(
      selectionServiceSpy,
      {} as UnitService,
      elementServiceSpy,
      new DragNDropService(),
      changeDetectorMock as unknown as ChangeDetectorRef
    );
    overlay.element = { type: 'text', id: 'text_1' } as unknown as PositionedUIElement;
  });

  it('should select an unselected element without multi select and emit elementSelected', () => {
    let selectedEmitted = false;
    overlay.elementSelected.subscribe(() => {
      selectedEmitted = true;
    });

    overlay.selectElement();

    expect(selectionServiceSpy.selectElement)
      .toHaveBeenCalledWith({ elementComponent: overlay, multiSelect: false });
    expect(selectedEmitted).toBe(true);
  });

  it('should multi-select on shift click and stop event propagation', () => {
    const event = new MouseEvent('click', { shiftKey: true });
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    overlay.selectElement(event);

    expect(selectionServiceSpy.selectElement)
      .toHaveBeenCalledWith({ elementComponent: overlay, multiSelect: true });
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should not re-select an already selected element but still emit elementSelected', () => {
    overlay.isSelected = true;
    let selectedEmitted = false;
    overlay.elementSelected.subscribe(() => {
      selectedEmitted = true;
    });

    overlay.selectElement();

    expect(selectionServiceSpy.selectElement).not.toHaveBeenCalled();
    expect(selectedEmitted).toBe(true);
  });

  it('should update the selection state and trigger change detection', () => {
    overlay.setSelected(true);
    expect(overlay.isSelected).toBe(true);
    expect(changeDetectorMock.detectChanges).toHaveBeenCalled();

    overlay.setSelected(false);
    expect(overlay.isSelected).toBe(false);
  });

  it('should highlight temporarily and remove the highlight after the given duration', fakeAsync(() => {
    overlay.highlight(150);
    expect(overlay.temporaryHighlight).toBe(true);

    tick(150);
    expect(overlay.temporaryHighlight).toBe(false);
  }));

  it('should keep the highlight until removeHighlight when no duration is given', () => {
    overlay.highlight();
    expect(overlay.temporaryHighlight).toBe(true);

    overlay.removeHighlight();
    expect(overlay.temporaryHighlight).toBe(false);
  });

  it('should toggle interaction on the overlay', () => {
    overlay.childComponent =
      { instance: {} } as unknown as ComponentRef<ElementComponent | CompoundElementComponent>;

    overlay.setInteractionEnabled(true);
    expect(overlay.preventInteraction).toBe(false);
    expect(overlay.isInteractionEnabled()).toBe(true);

    overlay.setInteractionEnabled(false);
    expect(overlay.preventInteraction).toBe(true);
    expect(overlay.isInteractionEnabled()).toBe(false);
  });

  it('should delegate the edit dialog to the element service', () => {
    overlay.openEditDialog();
    expect(elementServiceSpy.showDefaultEditDialog).toHaveBeenCalledWith(overlay.element);
  });
});
