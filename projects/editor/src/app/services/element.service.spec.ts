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
  };

  const createElementMock = (type: string, properties: Record<string, unknown> = {}): UIElement => ({
    type,
    id: `${type}_1`,
    setProperty: vi.fn(),
    ...properties
  } as unknown as UIElement);

  beforeEach(() => {
    unitServiceMock = {
      elementPropertyUpdated: new Subject<void>(),
      geometryElementPropertyUpdated: new Subject<string>(),
      mathTableElementPropertyUpdated: new Subject<string>(),
      tablePropUpdated: new Subject<string>(),
      updateUnitDefinition: vi.fn()
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

  it('should align elements to the leftmost x position', () => {
    const leftElement = createElementMock('frame', { position: { xPosition: 10 } });
    const rightElement = createElementMock('frame', { position: { xPosition: 30 } });

    service.alignElements([leftElement, rightElement] as PositionedUIElement[], 'left');

    expect(leftElement.setProperty).toHaveBeenCalledWith('xPosition', 10);
    expect(rightElement.setProperty).toHaveBeenCalledWith('xPosition', 10);
  });

  it('should align elements to the lowest y position', () => {
    const topElement = createElementMock('frame', { position: { xPosition: 0, yPosition: 5 } });
    const bottomElement = createElementMock('frame', { position: { xPosition: 0, yPosition: 25 } });

    service.alignElements([topElement, bottomElement] as PositionedUIElement[], 'bottom');

    expect(topElement.setProperty).toHaveBeenCalledWith('yPosition', 25);
    expect(bottomElement.setProperty).toHaveBeenCalledWith('yPosition', 25);
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
