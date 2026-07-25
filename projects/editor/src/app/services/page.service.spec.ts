import { TestBed } from '@angular/core/testing';
import { Mock } from 'vitest';
import { UIElement } from 'common/models/elements/element';
import { PageService } from 'editor/src/app/services/page.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { EditorPage } from 'editor/src/app/models/editor-page';

describe('PageService', () => {
  let service: PageService;
  let selectionService: SelectionService;
  let unitServiceMock: {
    unit: { pages: EditorPage[] };
    updateSectionCounter: Mock;
    updateUnitDefinition: Mock;
    prepareDelete: Mock;
  };

  const createPageMock = (elements: UIElement[] = []): EditorPage => ({
    getAllElements: vi.fn(() => elements)
  } as unknown as EditorPage);

  const createElementMock = (): UIElement => ({
    unregisterIDs: vi.fn()
  } as unknown as UIElement);

  beforeEach(() => {
    unitServiceMock = {
      unit: { pages: [] },
      updateSectionCounter: vi.fn(),
      updateUnitDefinition: vi.fn(),
      prepareDelete: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [{ provide: UnitService, useValue: unitServiceMock }]
    });
    service = TestBed.inject(PageService);
    selectionService = TestBed.inject(SelectionService);
  });

  it('should append a new page and update the unit', () => {
    service.addPage();

    expect(unitServiceMock.unit.pages.length).toBe(1);
    expect(unitServiceMock.unit.pages[0]).toBeInstanceOf(EditorPage);
    expect(unitServiceMock.updateSectionCounter).toHaveBeenCalled();
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should delete a page after confirmation and unregister its element IDs', async () => {
    const element = createElementMock();
    const pageToKeep = createPageMock();
    const pageToDelete = createPageMock([element]);
    unitServiceMock.unit.pages = [pageToKeep, pageToDelete];
    unitServiceMock.prepareDelete.mockResolvedValue(true);
    selectionService.selectedPageIndex = 1;

    await service.deletePage(1);

    expect(unitServiceMock.prepareDelete).toHaveBeenCalledWith('page', pageToDelete, 1);
    expect(element.unregisterIDs).toHaveBeenCalled();
    expect(unitServiceMock.unit.pages).toEqual([pageToKeep]);
    expect(selectionService.selectedPageIndex).toBe(0);
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should keep the page when the deletion is not confirmed', async () => {
    const page = createPageMock([createElementMock()]);
    unitServiceMock.unit.pages = [page];
    unitServiceMock.prepareDelete.mockResolvedValue(false);

    await service.deletePage(0);

    expect(unitServiceMock.unit.pages).toEqual([page]);
    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();
  });

  it('should move the selected page to the right and follow it with the selection', () => {
    const firstPage = createPageMock();
    const secondPage = createPageMock();
    unitServiceMock.unit.pages = [firstPage, secondPage];
    selectionService.selectedPageIndex = 0;

    service.moveSelectedPage(0, 'right');

    expect(unitServiceMock.unit.pages).toEqual([secondPage, firstPage]);
    expect(selectionService.selectedPageIndex).toBe(1);
    expect(unitServiceMock.updateSectionCounter).toHaveBeenCalled();
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should move the selected page to the left and follow it with the selection', () => {
    const firstPage = createPageMock();
    const secondPage = createPageMock();
    unitServiceMock.unit.pages = [firstPage, secondPage];
    selectionService.selectedPageIndex = 1;

    service.moveSelectedPage(1, 'left');

    expect(unitServiceMock.unit.pages).toEqual([secondPage, firstPage]);
    expect(selectionService.selectedPageIndex).toBe(0);
  });
});
