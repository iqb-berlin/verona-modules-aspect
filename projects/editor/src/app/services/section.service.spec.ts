import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { SectionService } from 'editor/src/app/services/section.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorSection } from 'editor/src/app/models/editor-section';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';

describe('SectionService', () => {
  let service: SectionService;
  let selectionService: SelectionService;
  let unitServiceMock: {
    unit: { pages: EditorPage[] };
    elementPropertyUpdated: Subject<void>;
    updateSectionCounter: Mock;
    updateUnitDefinition: Mock;
    prepareDelete: Mock;
    getSelectedPage: Mock;
  };

  const createElementMock = (): UIElement => ({
    unregisterIDs: vi.fn(),
    registerIDs: vi.fn()
  } as unknown as UIElement);

  const createSectionMock = (elements: UIElement[] = []): EditorSection => ({
    getAllElements: vi.fn(() => elements),
    setProperty: vi.fn()
  } as unknown as EditorSection);

  beforeEach(() => {
    unitServiceMock = {
      unit: { pages: [] },
      elementPropertyUpdated: new Subject<void>(),
      updateSectionCounter: vi.fn(),
      updateUnitDefinition: vi.fn(),
      prepareDelete: vi.fn(),
      getSelectedPage: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: ElementService, useValue: {} }
      ]
    });
    service = TestBed.inject(SectionService);
    selectionService = TestBed.inject(SelectionService);
  });

  it('should set a section property and notify the unit', () => {
    const section = createSectionMock();
    let propertyUpdateEmitted = false;
    unitServiceMock.elementPropertyUpdated.subscribe(() => {
      propertyUpdateEmitted = true;
    });

    service.updateSectionProperty(section, 'height', 500);

    expect(section.setProperty).toHaveBeenCalledWith('height', 500);
    expect(unitServiceMock.updateSectionCounter).not.toHaveBeenCalled();
    expect(propertyUpdateEmitted).toBe(true);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should update the section counter when the numbering is changed', () => {
    const section = createSectionMock();

    service.updateSectionProperty(section, 'ignoreNumbering', true);

    expect(unitServiceMock.updateSectionCounter).toHaveBeenCalled();
  });

  /* The selection stays with the caller: addSection is handed a page, not its position, and only the
     caller knows both (#1255). */
  it('should add a given section at the requested index and re-register its element IDs', () => {
    const page = new EditorPage();
    const element = createElementMock();
    const section = createSectionMock([element]);
    selectionService.selectedSectionIndex = 2;

    service.addSection(page, section, 0);

    expect(page.sections[0]).toBe(section);
    expect(element.registerIDs).toHaveBeenCalled();
    expect(selectionService.selectedSectionIndex).toBe(2);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  /* Both go through the section insert dialog, which offers the new section either next to the current
     one or in its place -- and either way the user is then working on the section that just arrived. */
  it('should select the section it inserts', () => {
    const page = new EditorPage();
    const sectionBelow = createSectionMock();
    page.sections.push(sectionBelow);
    const newSection = createSectionMock();
    unitServiceMock.unit.pages = [new EditorPage(), page];
    /* Starting elsewhere, so that naming the page counts as much as naming the section. */
    selectionService.updateSelection(0, 0);

    service.insertSection(1, 1, newSection);

    /* Both halves of the same statement: the selection has to name the section that just arrived, so it
       is only right as long as the section really sits at that index -- with one below it to be pushed
       down, that index is a claim about the order and not just about the length. */
    expect(page.sections[1]).toBe(newSection);
    expect(page.sections[2]).toBe(sectionBelow);
    expect(selectionService.selectedPageIndex).toBe(1);
    expect(selectionService.selectedSectionIndex).toBe(1);
  });

  it('should select the section it puts in place of another', async () => {
    const page = new EditorPage();
    const sectionToReplace = createSectionMock();
    const sectionBelow = createSectionMock();
    page.sections.push(sectionToReplace, sectionBelow);
    const newSection = createSectionMock();
    unitServiceMock.unit.pages = [page];
    unitServiceMock.prepareDelete.mockResolvedValue(true);
    selectionService.updateSelection(0, 1);

    await service.replaceSection(0, 1, newSection);

    expect(page.sections[1]).toBe(newSection);
    expect(page.sections[2]).toBe(sectionBelow);
    expect(selectionService.selectedSectionIndex).toBe(1);
  });

  it('should delete a section after confirmation and unregister its element IDs', async () => {
    const element = createElementMock();
    const section = createSectionMock([element]);
    unitServiceMock.unit.pages = [{ sections: [section] } as unknown as EditorPage];
    unitServiceMock.prepareDelete.mockResolvedValue(true);

    await service.deleteSection(0, 0);

    expect(unitServiceMock.prepareDelete).toHaveBeenCalledWith('section', section);
    expect(element.unregisterIDs).toHaveBeenCalled();
    expect(unitServiceMock.unit.pages[0].sections).toEqual([]);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  /* Element overlays select themselves as they render and drop nothing when they are destroyed, and the
     sections around a deleted one are not re-rendered (ngFor tracks them by identity). So whatever was
     selected inside the deleted section stays selected, and the properties panel -- which only reacts
     to emissions of selectedElements -- goes on offering its controls (#1258). */
  it('should drop the selection of elements that went with the deleted section', async () => {
    const element = createElementMock();
    const section = createSectionMock([element]);
    unitServiceMock.unit.pages = [{ sections: [section] } as unknown as EditorPage];
    unitServiceMock.prepareDelete.mockResolvedValue(true);
    selectionService.selectElement({
      elementComponent: { element, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    await service.deleteSection(0, 0);

    expect(selectionService.getSelectedElements()).toEqual([]);
  });

  it('should keep a selection that lives in another section', async () => {
    const elementElsewhere = createElementMock();
    const sectionToDelete = createSectionMock([createElementMock()]);
    unitServiceMock.unit.pages = [{
      sections: [sectionToDelete, createSectionMock([elementElsewhere])]
    } as unknown as EditorPage];
    unitServiceMock.prepareDelete.mockResolvedValue(true);
    selectionService.selectElement({
      elementComponent: { element: elementElsewhere, setSelected: () => {} } as unknown as ElementOverlay,
      multiSelect: false
    });

    await service.deleteSection(0, 0);

    expect(selectionService.getSelectedElements()).toEqual([elementElsewhere]);
  });

  it('should keep the section when the deletion is not confirmed', async () => {
    const section = createSectionMock([createElementMock()]);
    unitServiceMock.unit.pages = [{ sections: [section] } as unknown as EditorPage];
    unitServiceMock.prepareDelete.mockResolvedValue(false);

    await service.deleteSection(0, 0);

    expect(unitServiceMock.unit.pages[0].sections).toEqual([section]);
  });

  /* Replacing runs the deletion first; both halves belong to the same unit, so the insertion has to
     wait for the deletion to have happened (#1253). */
  it('should replace a section once its deletion is confirmed', async () => {
    const sectionToReplace = createSectionMock();
    const newSection = createSectionMock([createElementMock()]);
    const page = { sections: [sectionToReplace], addSection: vi.fn() } as unknown as EditorPage;
    unitServiceMock.unit.pages = [page];
    unitServiceMock.prepareDelete.mockResolvedValue(true);

    await service.replaceSection(0, 0, newSection);

    expect(page.addSection).toHaveBeenCalledWith(newSection, 0);
  });

  it('should keep the section and insert nothing when its deletion is not confirmed', async () => {
    const sectionToReplace = createSectionMock();
    const newSection = createSectionMock([createElementMock()]);
    const page = { sections: [sectionToReplace], addSection: vi.fn() } as unknown as EditorPage;
    unitServiceMock.unit.pages = [page];
    unitServiceMock.prepareDelete.mockResolvedValue(false);

    await service.replaceSection(0, 0, newSection);

    expect(page.addSection).not.toHaveBeenCalled();
    expect(page.sections).toEqual([sectionToReplace]);
    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();
  });

  /* A deletion that did not happen is nothing to tell the host about -- neither when the user cancels
     nor when the unit was replaced while the dialog was open (#1253). */
  it('should not report the unit when the deletion is not confirmed', async () => {
    unitServiceMock.unit.pages = [{ sections: [createSectionMock()] } as unknown as EditorPage];
    unitServiceMock.prepareDelete.mockResolvedValue(false);

    await service.deleteSection(0, 0);

    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();
  });

  it('should move a section within the selected page and follow it with the selection', () => {
    const firstSection = createSectionMock();
    const secondSection = createSectionMock();
    const page = { sections: [firstSection, secondSection] } as unknown as EditorPage;
    unitServiceMock.getSelectedPage.mockReturnValue(page);
    selectionService.selectedSectionIndex = 1;

    service.moveSection(secondSection, 'up');

    expect(page.sections).toEqual([secondSection, firstSection]);
    expect(selectionService.selectedSectionIndex).toBe(0);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should transfer elements between sections', () => {
    const elementToMove = createElementMock();
    const elementToKeep = createElementMock();
    const previousSection = { elements: [elementToMove, elementToKeep] } as unknown as EditorSection;
    const newSection = { elements: [] } as unknown as EditorSection;

    service.transferElements([elementToMove], previousSection, newSection);

    expect(previousSection.elements).toEqual([elementToKeep]);
    expect(newSection.elements).toEqual([elementToMove]);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });
});
