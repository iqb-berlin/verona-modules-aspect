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
