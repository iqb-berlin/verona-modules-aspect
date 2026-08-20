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
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { IDService } from 'editor/src/app/services/id.service';
import { ClozeDocument, ClozeElement } from 'common/models/elements/compound-group-elements/cloze/cloze';

/* Methods that need file imports or a fully built unit (addElementToSection,
   handleTextElementChange, reorderElements, ...) are not covered here; they depend on
   FileService dialogs and the real EditorUnit and are exercised via the unit service and
   component specs. */
describe('ElementService', () => {
  let service: ElementService;
  let dialogServiceSpy: SpyObj<DialogService>;
  let selectionService: SelectionService;
  let idService: IDService;
  let unitServiceMock: {
    elementPropertyUpdated: Subject<void>;
    geometryElementPropertyUpdated: Subject<string>;
    mathTableElementPropertyUpdated: Subject<string>;
    tablePropUpdated: Subject<string>;
    updateUnitDefinition: Mock;
    prepareDelete: Mock;
    referenceManager: { getElementsReferences: Mock; getTextAnchorReferences: Mock };
    // Enough of a unit for reorderElements(), which every position write goes through.
    unit: {
      pages: { sections: { elements: UIElement[]; dynamicPositioning: boolean }[] }[];
      deleteElements: Mock;
    };
  };

  const createElementMock = (type: string, properties: Record<string, unknown> = {}): UIElement => ({
    type,
    id: `${type}_1`,
    setProperty: vi.fn(),
    getChildElements: vi.fn(() => []),
    ...properties
  } as unknown as UIElement);

  /* One gap in a paragraph, and the same document without it -- what the rich text editor hands over
     when the user deletes the gap. */
  const clozeDocument = (withChild: boolean): ClozeDocument => ({
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: withChild ?
        [{ type: 'TextField', attrs: { model: { type: 'text-field', id: 'child_1', alias: 'child_1' } } }] :
        []
    }]
  } as unknown as ClozeDocument);

  const clozeWithChild = (): ClozeElement => ElementFactory.createElement({
    type: 'cloze', id: 'cloze_1', alias: 'cloze_1', document: clozeDocument(true)
  } as unknown as UIElementProperties, idService) as ClozeElement;

  /* Deleting reads the elements a section holds itself, so an element only counts as deletable once
     it is in that list (#1262). */
  const putIntoSection = (element: UIElement): UIElement => {
    unitServiceMock.unit.pages[0].sections[0].elements.push(element);
    return element;
  };

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
      prepareDelete: vi.fn(),
      referenceManager: {
        getElementsReferences: vi.fn(() => []),
        getTextAnchorReferences: vi.fn(() => [])
      },
      unit: {
        pages: [{ sections: [{ elements: [], dynamicPositioning: false }] }],
        deleteElements: vi.fn((elements: UIElement[]) => elements)
      }
    };
    dialogServiceSpy = createSpyObj<DialogService>(['showTextEditDialog', 'showDeleteReferenceDialog']);
    selectionService = new SelectionService();
    idService = new IDService();
    service = new ElementService(
      unitServiceMock as unknown as UnitService,
      selectionService,
      dialogServiceSpy,
      createSpyObj<MessageService>(['showReferencePanel']),
      idService,
      { bypassSecurityTrustHtml: (value: string) => value } as unknown as DomSanitizer
    );
  });

  /* Deleting elements takes exactly the selected ones, and no overlay is left to re-select and take
     them out of the selection -- the properties panel would go on offering their controls (#1258). */
  it('should drop the selection of the elements it deletes', async () => {
    const element = putIntoSection(createElementMock('radio', { unregisterIDs: vi.fn() }));
    unitServiceMock.prepareDelete.mockResolvedValue(true);
    selectionService.selectElement({
      elementComponent: { element, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    await service.deleteElements([element]);

    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  /* A child of a compound element is in the list of its parent, not in the one the section holds, so
     no deletion here can reach it. It used to be asked about and its ID released all the same, which
     handed the same ID to the next element that asked for one; the next deletion by ID then took out
     the wrong element (#1262). The delete key arrives here with the child selected, because the click
     that selects it leaves the focus on the overlay of its parent. */
  it('should not ask about deleting a compound child', async () => {
    const child = createElementMock('text-field', { unregisterIDs: vi.fn() });
    selectionService.selectElement({
      elementComponent: { element: child, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    await service.deleteElements([child]);

    expect(unitServiceMock.prepareDelete).not.toHaveBeenCalled();
    expect(child.unregisterIDs).not.toHaveBeenCalled();
    expect(selectionService.getSelectedElements()).toEqual([child]);
    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();
  });

  it('should ask only about the elements it can delete', async () => {
    const element = putIntoSection(createElementMock('radio', { unregisterIDs: vi.fn() }));
    const child = createElementMock('text-field', { unregisterIDs: vi.fn() });
    unitServiceMock.prepareDelete.mockResolvedValue(true);

    await service.deleteElements([element, child]);

    expect(unitServiceMock.prepareDelete).toHaveBeenCalledWith('elements', [element]);
    expect(element.unregisterIDs).toHaveBeenCalled();
    expect(child.unregisterIDs).not.toHaveBeenCalled();
  });

  /* `unregisterIDs()` covers one element, and the overlay of a deleted compound is gone with it, so
     nothing takes its children out of the selection either (#1262, #1258). */
  it('should release the IDs of the children that went with a deleted compound element', async () => {
    const child = createElementMock('text-field', { unregisterIDs: vi.fn() });
    const table = putIntoSection(createElementMock('table', {
      unregisterIDs: vi.fn(), getChildElements: vi.fn(() => [child])
    }));
    unitServiceMock.prepareDelete.mockResolvedValue(true);
    selectionService.selectElement({
      elementComponent: { element: child, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    await service.deleteElements([table]);

    expect(child.unregisterIDs).toHaveBeenCalled();
    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  /* A confirmed deletion has removed the references of the elements it was about before it got here,
     so the host is told about the unit either way. */
  it('should report the unit after a confirmed deletion', async () => {
    const element = putIntoSection(createElementMock('radio', { unregisterIDs: vi.fn() }));
    unitServiceMock.prepareDelete.mockResolvedValue(true);

    await service.deleteElements([element]);

    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  /* A gap removed in the rich text editor leaves the unit with the new document, and no overlay is
     rebuilt that could take it out of the selection -- the properties panel went on offering the
     controls of a child that is not in the unit any more (#1261). */
  it('should drop the selection of a cloze child that left the document', () => {
    const cloze = clozeWithChild();
    const child = cloze.getChildElements()[0];
    selectionService.selectElement({
      elementComponent: { element: child, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    service.updateElementsProperty([cloze], 'document', clozeDocument(false));

    expect(cloze.getChildElements()).toEqual([]);
    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  /* The other way through: references to the gap have to be confirmed first, and the document is set
     from the dialog's answer -- so the deselection has to sit there too (#1261). */
  it('should drop the selection of a cloze child whose references were confirmed', () => {
    const cloze = clozeWithChild();
    const child = cloze.getChildElements()[0];
    unitServiceMock.referenceManager.getElementsReferences.mockReturnValue([{ refs: [], element: child }]);
    dialogServiceSpy.showDeleteReferenceDialog.mockReturnValue(of(true));
    selectionService.selectElement({
      elementComponent: { element: child, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    service.updateElementsProperty([cloze], 'document', clozeDocument(false));

    expect(cloze.getChildElements()).toEqual([]);
    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  /* The dialog answers later, and the unit was reported before it did -- with the document the
     element still had. The confirmed change then only reached the host with some later edit, and a
     save in between wrote the stale state (#1269). */
  it('should report the cloze document only once the reference dialog was confirmed', () => {
    const cloze = clozeWithChild();
    const child = cloze.getChildElements()[0];
    const dialogAnswer = new Subject<boolean>();
    unitServiceMock.referenceManager.getElementsReferences.mockReturnValue([{ refs: [], element: child }]);
    dialogServiceSpy.showDeleteReferenceDialog.mockReturnValue(dialogAnswer);

    service.updateElementsProperty([cloze], 'document', clozeDocument(false));

    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();

    dialogAnswer.next(true);

    expect(cloze.getChildElements()).toEqual([]);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalledTimes(1);
  });

  it('should report nothing when the reference deletion of a cloze document was declined', () => {
    const cloze = clozeWithChild();
    const child = cloze.getChildElements()[0];
    unitServiceMock.referenceManager.getElementsReferences.mockReturnValue([{ refs: [], element: child }]);
    dialogServiceSpy.showDeleteReferenceDialog.mockReturnValue(of(false));

    service.updateElementsProperty([cloze], 'document', clozeDocument(false));

    expect(cloze.getChildElements()).toEqual([child]);
    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();
  });

  it('should report a cloze document without references exactly once', () => {
    service.updateElementsProperty([clozeWithChild()], 'document', clozeDocument(false));

    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalledTimes(1);
  });

  /* Same detour for a text whose anchor is referenced elsewhere (#1269). */
  it('should report a text only once the reference dialog was confirmed', () => {
    const element = createElementMock('text', { text: '<aspect-anchor data-anchor-id="anchor_1"></aspect-anchor>' });
    const dialogAnswer = new Subject<boolean>();
    unitServiceMock.referenceManager.getTextAnchorReferences.mockReturnValue([{ refs: [], element }]);
    dialogServiceSpy.showDeleteReferenceDialog.mockReturnValue(dialogAnswer);

    service.updateElementsProperty([element], 'text', 'ohne Anker');

    expect(element.setProperty).not.toHaveBeenCalled();
    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();

    dialogAnswer.next(true);

    expect(element.setProperty).toHaveBeenCalledWith('text', 'ohne Anker');
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalledTimes(1);
  });

  it('should report a text without references exactly once', () => {
    const element = createElementMock('text', { text: 'ohne Anker' });

    service.updateElementsProperty([element], 'text', 'auch ohne Anker');

    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalledTimes(1);
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
