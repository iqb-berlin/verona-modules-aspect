import { TestBed } from '@angular/core/testing';
import { TextElement } from 'common/models/elements/text-group-elements/text';
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

  const selectAnElement = (): void => {
    service.selectElement({
      elementComponent: {
        element: new TextElement({ type: 'text', id: 'text_1', alias: 'text_1' }),
        setSelected
      } as unknown as ElementOverlay,
      multiSelect: false
    });
  };

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
     something selected -- the panel and dimension-field-set read the flag to decide which controls to
     offer. The delete paths rely on this (#1258). */
  it('should clear the compound child flag with the element selection', () => {
    selectAnElement();
    service.isCompoundChildSelected = true;

    service.clearElementSelection();

    expect(service.getSelectedElements()).toEqual([]);
    expect(service.isCompoundChildSelected).toBe(false);
  });

  /* reset() runs when a unit is (re)loaded, so everything it leaves behind describes a unit that is
     gone. The element selection used to survive it: `selectedElementComponents` was emptied, but the
     subject the properties panel reads kept emitting the old elements, so the panel went on offering
     controls for elements the new unit does not contain (#1089). */
  it('should clear the element selection on reset', () => {
    selectAnElement();
    service.updateSelection(1, 2);
    service.isCompoundChildSelected = true;
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
