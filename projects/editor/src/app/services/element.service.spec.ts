import { DomSanitizer } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { IDService } from 'editor/src/app/services/id.service';

/* Methods that need file imports or a fully built unit (addElementToSection,
   handleTextElementChange, handleClozeDocumentChange, reorderElements, ...) are not
   covered here; they depend on FileService dialogs and the real EditorUnit and are
   exercised via the unit service and component specs. */
describe('ElementService', () => {
  let service: ElementService;
  let dialogServiceSpy: SpyObj<DialogService>;
  let unitServiceMock: {
    elementPropertyUpdated: Subject<void>;
    geometryElementPropertyUpdated: Subject<string>;
    mathTableElementPropertyUpdated: Subject<string>;
    tablePropUpdated: Subject<string>;
    updateUnitDefinition: Mock;
    // Enough of a unit for reorderElements(), which every position write goes through.
    unit: { pages: { sections: { elements: UIElement[]; dynamicPositioning: boolean }[] }[] };
  };

  const createElementMock = (type: string, properties: Record<string, unknown> = {}): UIElement => ({
    type,
    id: `${type}_1`,
    setProperty: vi.fn(),
    ...properties
  } as unknown as UIElement);

  /* A real element, not a mock: tests about the position group have to see what actually lands in
     it. Registered with the mock unit, because every position write reorders the section. */
  const createPositionedElement = (id: string, xPosition: number, yPosition: number): PositionedUIElement => {
    const element = ElementFactory.createElement({
      type: 'frame', id, alias: id, position: { xPosition, yPosition }
    } as unknown as UIElementProperties) as PositionedUIElement;
    unitServiceMock.unit.pages[0].sections[0].elements.push(element);
    return element;
  };

  beforeEach(() => {
    unitServiceMock = {
      elementPropertyUpdated: new Subject<void>(),
      geometryElementPropertyUpdated: new Subject<string>(),
      mathTableElementPropertyUpdated: new Subject<string>(),
      tablePropUpdated: new Subject<string>(),
      updateUnitDefinition: vi.fn(),
      unit: { pages: [{ sections: [{ elements: [], dynamicPositioning: false }] }] }
    };
    dialogServiceSpy = createSpyObj<DialogService>(['showTextEditDialog']);
    service = new ElementService(
      unitServiceMock as unknown as UnitService,
      new SelectionService(),
      dialogServiceSpy,
      createSpyObj<MessageService>(['showReferencePanel']),
      new IDService(),
      { bypassSecurityTrustHtml: (value: string) => value } as unknown as DomSanitizer
    );
  });

  it('should set an element property and notify the unit', () => {
    const element = createElementMock('radio');
    let propertyUpdateEmitted = false;
    unitServiceMock.elementPropertyUpdated.subscribe(() => {
      propertyUpdateEmitted = true;
    });

    service.updateElementsProperty([element], 'label', 'Neue Beschriftung');

    expect(element.setProperty).toHaveBeenCalledWith('label', 'Neue Beschriftung');
    expect(propertyUpdateEmitted).toBe(true);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should notify geometry elements about property updates', () => {
    const element = createElementMock('geometry');
    const updatedGeometryIDs: string[] = [];
    unitServiceMock.geometryElementPropertyUpdated.subscribe(elementID => {
      updatedGeometryIDs.push(elementID);
    });

    service.updateElementsProperty([element], 'appDefinition', 'app-def');

    expect(updatedGeometryIDs).toEqual(['geometry_1']);
  });

  it('should not notify geometry elements about tracked variable updates', () => {
    const element = createElementMock('geometry');
    const updatedGeometryIDs: string[] = [];
    unitServiceMock.geometryElementPropertyUpdated.subscribe(elementID => {
      updatedGeometryIDs.push(elementID);
    });

    service.updateElementsProperty([element], 'trackedVariables', []);

    expect(updatedGeometryIDs).toEqual([]);
  });

  /* These assert on the elements' own position group rather than on a setProperty spy. The
     alignment used to write through setProperty, which put a stray xPosition on the element and
     left position.xPosition untouched - a spy-based test passed while the buttons did nothing
     (#1142). */
  it('should align elements to the leftmost x position', () => {
    const leftElement = createPositionedElement('frame_left', 10, 0);
    const rightElement = createPositionedElement('frame_right', 30, 0);

    service.alignElements([leftElement, rightElement], 'left');

    expect(leftElement.position.xPosition).toBe(10);
    expect(rightElement.position.xPosition).toBe(10);
  });

  it('should align elements to the lowest y position', () => {
    const topElement = createPositionedElement('frame_top', 0, 5);
    const bottomElement = createPositionedElement('frame_bottom', 0, 25);

    service.alignElements([topElement, bottomElement], 'bottom');

    expect(topElement.position.yPosition).toBe(25);
    expect(bottomElement.position.yPosition).toBe(25);
  });

  it('should align elements to the topmost y position', () => {
    const topElement = createPositionedElement('frame_top', 0, 5);
    const bottomElement = createPositionedElement('frame_bottom', 0, 25);

    service.alignElements([topElement, bottomElement], 'top');

    expect(topElement.position.yPosition).toBe(5);
    expect(bottomElement.position.yPosition).toBe(5);
  });

  /* The counterpart for the dimensions group, which the resize handle writes through (#1142). */
  it('should write a dimension into the dimensions group of every element', () => {
    const first = createPositionedElement('frame_a', 0, 0);
    const second = createPositionedElement('frame_b', 0, 0);

    service.updateElementsDimensionsProperty([first, second], 'width', 240);

    expect(first.dimensions.width).toBe(240);
    expect(second.dimensions.width).toBe(240);
    expect(Object.keys(first)).not.toContain('width');
  });

  it('should not leave the aligned coordinate on the element itself', () => {
    const element = createPositionedElement('frame_stray', 10, 0);

    service.alignElements([element, createPositionedElement('frame_other', 30, 0)], 'right');

    expect(element.position.xPosition).toBe(30);
    expect(Object.keys(element)).not.toContain('xPosition');
  });

  it('should open the text edit dialog for a radio element and apply the result', () => {
    const element = createElementMock('radio', { label: 'Alte Beschriftung' });
    dialogServiceSpy.showTextEditDialog.mockReturnValue(of('Neue Beschriftung'));

    service.showDefaultEditDialog(element);

    expect(dialogServiceSpy.showTextEditDialog).toHaveBeenCalledWith('Alte Beschriftung');
    expect(element.setProperty).toHaveBeenCalledWith('label', 'Neue Beschriftung');
  });

  it('should duplicate an element with an adjusted position', () => {
    const element = ElementFactory.createElement({
      type: 'text',
      id: 'text_original',
      alias: 'text_original',
      position: {
        xPosition: 20, yPosition: 40, gridRow: 2, gridColumn: 3
      }
    } as unknown as UIElementProperties);

    const duplicate = service.duplicateElement(element, true);

    expect(duplicate.type).toBe('text');
    expect(duplicate.id).not.toBe('text_original');
    expect(duplicate.position?.xPosition).toBe(30);
    expect(duplicate.position?.yPosition).toBe(50);
    expect(duplicate.position?.gridRow).toBeNull();
    expect(duplicate.position?.gridColumn).toBeNull();
  });
});
