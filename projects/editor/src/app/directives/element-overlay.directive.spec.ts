/* eslint-disable max-classes-per-file */
import {
  ChangeDetectorRef, ComponentRef, ElementRef, QueryList
} from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DragOperatorService } from 'common/services/drag-operator.service';
import { DropListComponent } from 'common/components/elements/drop-list/drop-list.component';
import { DragNDropValueObject } from 'common/models/label-interfaces';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { UIElement } from 'common/models/elements/element';
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
  let dragOperatorService: DragOperatorService;

  beforeEach(() => {
    selectionServiceSpy = createSpyObj<SelectionService>(['selectElement']);
    elementServiceSpy = createSpyObj<ElementService>(['showDefaultEditDialog']);
    changeDetectorMock = { detectChanges: vi.fn() };
    dragOperatorService = new DragOperatorService();
    overlay = new TestElementOverlay(
      selectionServiceSpy,
      {} as UnitService,
      elementServiceSpy,
      new DragNDropService(),
      changeDetectorMock as unknown as ChangeDetectorRef,
      dragOperatorService
    );
    overlay.element = { type: 'text', id: 'text_1', getChildElements: () => [] } as unknown as PositionedUIElement;
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

  /* A drag rearranges the array a drop list holds, and in the editor that is its model's own value array --
     trying a list out changed the unit (#1635). */
  describe('drop lists while interaction is on', () => {
    const itemA = { text: 'A' } as DragNDropValueObject;
    const itemB = { text: 'B' } as DragNDropValueObject;
    let model: { id: string, value: DragNDropValueObject[] };
    let dropList: DropListComponent;

    /* Holds the model's array, as a drop list in the editor does, and copies it on refresh as the real one does. */
    class FakeDropList {
      elementFormControl: UntypedFormControl;
      viewModel: DragNDropValueObject[];
      cdr = { detectChanges: vi.fn() };

      constructor(public elementModel: { id: string, value: DragNDropValueObject[] }) {
        this.elementFormControl = new UntypedFormControl(elementModel.value);
        this.viewModel = elementModel.value;
      }

      refreshViewModel(): void {
        this.viewModel = [...this.elementFormControl.value];
      }
    }

    const registerDropList = (id: string): void => {
      model = { id, value: [itemA, itemB] };
      dropList = new FakeDropList(model) as unknown as DropListComponent;
      dragOperatorService.dropLists[id] = dropList;
    };

    beforeEach(() => {
      overlay.childComponent =
        { instance: {} } as unknown as ComponentRef<ElementComponent | CompoundElementComponent>;
    });

    it('should let the drop list of the element work on copies of its value', () => {
      registerDropList('drop-list_1');
      overlay.element = {
        type: 'drop-list', id: 'drop-list_1', getChildElements: () => []
      } as unknown as PositionedUIElement;

      overlay.setInteractionEnabled(true);
      dropList.elementFormControl.value.reverse();
      dropList.viewModel.push(itemA);

      expect(model.value).toEqual([itemA, itemB]);
      expect(dropList.elementFormControl.value).toEqual([itemB, itemA]);
    });

    it('should hand the drop list its model value back and drop what was tried', () => {
      registerDropList('drop-list_1');
      overlay.element = {
        type: 'drop-list', id: 'drop-list_1', getChildElements: () => []
      } as unknown as PositionedUIElement;
      overlay.setInteractionEnabled(true);
      dropList.elementFormControl.value.reverse();

      overlay.setInteractionEnabled(false);

      expect(dropList.elementFormControl.value).toBe(model.value);
      expect(dropList.viewModel).toBe(model.value);
      expect(model.value).toEqual([itemA, itemB]);
    });

    it('should detach the drop lists among the children of a compound element', () => {
      registerDropList('drop-list_gap');
      overlay.element = {
        type: 'cloze', id: 'cloze_1', getChildElements: () => [{ id: 'drop-list_gap' }]
      } as unknown as PositionedUIElement;

      overlay.setInteractionEnabled(true);

      expect(dropList.elementFormControl.value).not.toBe(model.value);
      expect(dropList.viewModel).not.toBe(model.value);
    });
  });

  /* Some templates show the preset through the form control alone, which is filled once when the element is drawn:
     a preset written in the panel stayed invisible on the canvas until the editor was opened anew (#1642). */
  describe('a preset written in the panel', () => {
    class FakeFormElement extends FormElementComponent {
      constructor(public elementModel: UIElement) {
        super(new ElementRef(document.createElement('div')));
        this.ngOnInit();
      }
    }

    class FakeCompound extends CompoundElementComponent {
      elementModel = { id: 'cloze_1' } as unknown as UIElement;
      compoundChildren!: QueryList<unknown>;

      constructor(private children: ElementComponent[]) {
        super(new ElementRef(document.createElement('div')));
      }

      getFormElementChildrenComponents(): ElementComponent[] {
        return this.children;
      }
    }

    const showOnCanvas = (instance: ElementComponent): void => {
      overlay.childComponent = { instance } as unknown as ComponentRef<ElementComponent | CompoundElementComponent>;
    };

    it('should reach the form control of the element', () => {
      const model = { id: 'toggle-button_1', value: null } as unknown as UIElement;
      const toggleButton = new FakeFormElement(model);
      showOnCanvas(toggleButton);

      model.value = 1;
      overlay.showPresetValue('toggle-button_1');

      expect(toggleButton.elementFormControl.value).toBe(1);
    });

    it('should reach the form control of a child in a gap', () => {
      const model = { id: 'checkbox_gap', value: false } as unknown as UIElement;
      const checkbox = new FakeFormElement(model);
      showOnCanvas(new FakeCompound([checkbox]));

      model.value = true;
      overlay.showPresetValue('checkbox_gap');

      expect(checkbox.elementFormControl.value).toBe(true);
    });

    it('should leave the form controls of other elements alone', () => {
      const model = { id: 'checkbox_gap', value: false } as unknown as UIElement;
      const checkbox = new FakeFormElement(model);
      showOnCanvas(new FakeCompound([checkbox]));

      model.value = true;
      overlay.showPresetValue('toggle-button_gap');

      expect(checkbox.elementFormControl.value).toBe(false);
    });

    /* A drop list follows the panel through the array it shares with its model, and while it is tried out it works
       on a copy; handing it the model's array would let the next drag change the unit again (#1635). */
    it('should leave a drop list on the copy it is tried out on', () => {
      const model = { id: 'drop-list_gap', value: [{ text: 'A' }] } as unknown as UIElement;
      const dropList = Object.assign(Object.create(DropListComponent.prototype), {
        elementModel: model,
        elementFormControl: new UntypedFormControl([{ text: 'A' }])
      }) as DropListComponent;
      const triedOut = dropList.elementFormControl.value;
      showOnCanvas(new FakeCompound([dropList]));

      overlay.showPresetValue('drop-list_gap');

      expect(dropList.elementFormControl.value).toBe(triedOut);
    });
  });

  it('should delegate the edit dialog to the element service', () => {
    overlay.openEditDialog();
    expect(elementServiceSpy.showDefaultEditDialog).toHaveBeenCalledWith(overlay.element);
  });
});
