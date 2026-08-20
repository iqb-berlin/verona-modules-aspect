import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import {
  TextFieldSimpleElement
} from 'common/models/elements/text-input-group-elements/text-field-simple';
import {
  ClozeChildOverlayComponent
} from 'common/components/compound-group-elements/cloze-child-overlay/cloze-child-overlay.component';
import {
  TableChildOverlay
} from 'common/components/compound-group-elements/table-child-overlay/table-child-overlay.component';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { SelectionService } from 'editor/src/app/services/selection.service';

describe('SelectionService', () => {
  let service: SelectionService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const setSelected = vi.fn();

  const selectAnElement = (multiSelect: boolean = false): void => {
    service.selectElement({
      elementComponent: {
        element: new TextElement({ type: 'text', id: 'text_1', alias: 'text_1' }),
        setSelected
      } as unknown as ElementOverlay,
      multiSelect
    });
  };

  /* A real ClozeChildOverlayComponent, because that is what the selection is asked about: the flag is
     derived from the kind of overlay, not from something the caller passes in (#1268). */
  const selectAChild = (multiSelect: boolean = false): ClozeChildOverlayComponent => {
    const childOverlay = new ClozeChildOverlayComponent(
      { detectChanges: vi.fn() } as unknown as ChangeDetectorRef
    );
    childOverlay.element = new TextFieldSimpleElement({
      type: 'text-field-simple', id: 'text-field-simple_1', alias: 'gap_1'
    });
    service.selectElement({ elementComponent: childOverlay, multiSelect });
    return childOverlay;
  };

  it('should report a selected compound child', () => {
    selectAChild();

    expect(service.isCompoundChildSelected).toBe(true);
  });

  it('should not report a selection without a compound child', () => {
    selectAnElement();

    expect(service.isCompoundChildSelected).toBe(false);
    expect(service.onlyCompoundChildrenSelected).toBe(false);
  });

  /* A table cell arrives through its own overlay class, and it is the other half of the answer. */
  it('should report a selected table cell', () => {
    const cellOverlay = new TableChildOverlay({ detectChanges: vi.fn() } as unknown as ChangeDetectorRef);
    cellOverlay.element = new TextElement({ type: 'text', id: 'text_5', alias: 'cell_1' });

    service.selectElement({ elementComponent: cellOverlay, multiSelect: false });

    expect(service.isCompoundChildSelected).toBe(true);
    expect(service.onlyCompoundChildrenSelected).toBe(true);
  });

  /* The dimension field set asks this one: its controls describe how an element is laid out, and an
     element the section places itself is not laid out like a child (#1268). */
  it('should stop reporting a selection of children only when another element joins it', () => {
    selectAChild();
    expect(service.onlyCompoundChildrenSelected).toBe(true);

    selectAnElement(true);

    expect(service.onlyCompoundChildrenSelected).toBe(false);
    expect(service.isCompoundChildSelected).toBe(true);
  });

  /* The flag used to be set by whoever had just clicked, and every selectElement cleared it first: a
     shift-click on another element left the child selected and the flag on false. The panel then
     offered its delete button for a selection holding a child that no deletion can reach (#1268). */
  it('should keep reporting the compound child when another element joins the selection', () => {
    selectAChild();

    selectAnElement(true);

    expect(service.getSelectedElements().length).toBe(2);
    expect(service.isCompoundChildSelected).toBe(true);
  });

  it('should keep reporting the compound child when the other element leaves the selection', () => {
    selectAChild();
    selectAnElement(true);
    const otherElement = service.getSelectedElements()[1];

    service.deselectElements([otherElement]);

    expect(service.isCompoundChildSelected).toBe(true);
  });

  it('should stop reporting a compound child that left the selection', () => {
    const childOverlay = selectAChild();
    selectAnElement(true);

    service.deselectElements([childOverlay.element]);

    expect(service.isCompoundChildSelected).toBe(false);
  });

  it('should take only the named elements out of the selection', () => {
    const staying = new TextElement({ type: 'text', id: 'text_2', alias: 'text_2' });
    selectAnElement();
    service.selectElement({
      elementComponent: { element: staying, setSelected } as unknown as ElementOverlay,
      multiSelect: true
    });
    const going = service.getSelectedElements()[0];

    service.deselectElements([going]);

    expect(service.getSelectedElements()).toEqual([staying]);
    expect(service.selectedElementComponents.length).toBe(1);
  });

  it('should leave a selection that none of the named elements is part of', () => {
    selectAnElement();
    const untouched = service.getSelectedElements();

    service.deselectElements([new TextElement({ type: 'text', id: 'text_9', alias: 'text_9' })]);

    expect(service.getSelectedElements()).toEqual(untouched);
  });

  /* Whoever empties the selection is saying that nothing is selected any more, and a compound child is
     something selected -- the panel reads the one flag and the dimension field set the other to decide
     which controls to offer. The delete paths rely on this (#1258). */
  it('should clear the compound child flags with the element selection', () => {
    selectAChild();

    service.clearElementSelection();

    expect(service.getSelectedElements()).toEqual([]);
    expect(service.isCompoundChildSelected).toBe(false);
    expect(service.onlyCompoundChildrenSelected).toBe(false);
  });

  /* reset() runs when a unit is (re)loaded, so everything it leaves behind describes a unit that is
     gone. The element selection used to survive it: `selectedElementComponents` was emptied, but the
     subject the properties panel reads kept emitting the old elements, so the panel went on offering
     controls for elements the new unit does not contain (#1089). */
  it('should clear the element selection on reset', () => {
    selectAnElement();
    selectAChild(true);
    service.updateSelection(1, 2);
    setSelected.mockClear();

    service.reset();

    expect(service.selectedPageIndex).toBe(0);
    expect(service.selectedSectionIndex).toBe(0);
    expect(service.getSelectedElements()).toEqual([]);
    expect(service.selectedElementComponents).toEqual([]);
    expect(service.isCompoundChildSelected).toBe(false);
    expect(setSelected).toHaveBeenCalledWith(false);
  });
});
