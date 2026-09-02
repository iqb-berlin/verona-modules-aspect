import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { Mock } from 'vitest';
import { TemplateService } from 'editor/modules/section-templates/services/template.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { IDService } from 'editor/src/app/services/id.service';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { TextElement } from 'common/models/elements/text';
import { TwoPageTemplateOptions } from 'editor/modules/section-templates/models/droplist-interfaces';
import {
  Text3WizardDialogComponent
} from 'editor/modules/section-templates/components/text3-dialog/text3-dialog.component';

describe('TemplateService', () => {
  let service: TemplateService;
  let page: EditorPage;
  let dialogMock: { open: Mock };
  let translateMock: { instant: Mock };
  let selectionServiceMock: { selectedSectionIndex: number; updateSelection: Mock };
  let unitServiceMock: {
    unit: {
      pages: EditorPage[];
      getAllElements: Mock;
      movePageToFront: (pageIndex: number) => void;
    };
    pageOrderChanged: Subject<void>;
    getSelectedPage: () => EditorPage;
    updateSectionCounter: Mock;
    updateUnitDefinition: Mock;
  };

  const text3Result = {
    text1: 'T1', text2: 'T2', text3: 'T3', text4: 'T4', text5: 'T5'
  };

  const mockDialogResult = (result: unknown): void => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(result) });
  };

  beforeEach(() => {
    page = new EditorPage();
    const pages = [page];
    unitServiceMock = {
      unit: {
        pages,
        getAllElements: vi.fn(() => []),
        movePageToFront: (pageIndex: number) => {
          pages.unshift(pages.splice(pageIndex, 1)[0]);
        }
      },
      pageOrderChanged: new Subject<void>(),
      getSelectedPage: () => page,
      updateSectionCounter: vi.fn(),
      updateUnitDefinition: vi.fn()
    };
    selectionServiceMock = { selectedSectionIndex: 0, updateSelection: vi.fn() };
    dialogMock = { open: vi.fn() };
    translateMock = { instant: vi.fn((key: string) => key) };

    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: dialogMock },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: TranslateService, useValue: translateMock },
        IDService
      ]
    });
    service = TestBed.inject(TemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should replace the empty selected section with the created template section', async () => {
    mockDialogResult(text3Result);

    await service.applyTemplate('text3');

    expect(dialogMock.open).toHaveBeenCalledWith(Text3WizardDialogComponent, {});
    expect(page.sections.length).toBe(1);
    const textElements = page.sections[0].getAllElements('text') as TextElement[];
    expect(textElements.length).toBe(11);
    expect(textElements.map(element => element.text)).toContain('T1');
    expect(selectionServiceMock.updateSelection).toHaveBeenCalledWith(0, 0);
    expect(unitServiceMock.updateSectionCounter).toHaveBeenCalled();
    expect(unitServiceMock.updateUnitDefinition).toHaveBeenCalled();
  });

  it('should append a new section when the selected section is not empty', async () => {
    const idService = TestBed.inject(IDService);
    page.sections[0].addElement(TemplateService.createElement('text', {}, { text: 'existing' }, idService));
    mockDialogResult(text3Result);

    await service.applyTemplate('text3');

    expect(page.sections.length).toBe(2);
    expect(page.sections[1].isEmpty()).toBe(false);
    expect(selectionServiceMock.updateSelection).toHaveBeenCalledWith(0, 1);
  });

  it('should not change the unit when the dialog is cancelled', fakeAsync(() => {
    mockDialogResult(undefined);

    service.applyTemplate('text3');
    tick();

    expect(page.sections[0].isEmpty()).toBe(true);
    expect(selectionServiceMock.updateSelection).not.toHaveBeenCalled();
    expect(unitServiceMock.updateUnitDefinition).not.toHaveBeenCalled();
  }));

  it('should reject for an unknown template name', async () => {
    await expect(service.applyTemplate('unknown')).rejects.toThrow('Template name not found: unknown');
  });

  it('should use the translated source text for the geometry template', async () => {
    mockDialogResult({
      text: 'Aufgabentext', geometryAppDefinition: 'appDef', geometryFileName: 'file.ggb', showHelper: false
    });

    await service.applyTemplate('geometry');

    expect(translateMock.instant).toHaveBeenCalledWith('sectionTemplates.geometrySource');
    const textElements = page.sections[0].getAllElements('text') as TextElement[];
    expect(textElements.map(element => element.text)).toContain('sectionTemplates.geometrySource');
  });

  it('should create an always visible page for the two page droplist template', async () => {
    const twoPageOptions: TwoPageTemplateOptions = {
      text1: '<p>Intro</p>',
      headingSourceList: '<p>Quelle</p>',
      options: ['A', 'B'],
      optionWidth: 'medium',
      text2: '<p>Zweiter Text</p>',
      text3: '<p>Dritter Text</p>',
      headingTargetLists: '<p>Ziele</p>',
      targetLabels: ['Ziel 1', 'Ziel 2'],
      labelsBelow: false,
      targetListAlignment: 'row',
      srcUseImages: false,
      imageSize: 'medium',
      targetUseImages: false
    };
    const pageOrderChangedSpy = vi.fn();
    unitServiceMock.pageOrderChanged.subscribe(pageOrderChangedSpy);
    mockDialogResult({ variant: '2pages', options: twoPageOptions });

    await service.applyTemplate('droplist');

    expect(unitServiceMock.unit.pages.length).toBe(2);
    expect(unitServiceMock.unit.pages[0].alwaysVisible).toBe(true);
    expect(unitServiceMock.unit.pages[0].sections[0].isEmpty()).toBe(false);
    expect(page.sections[0].isEmpty()).toBe(false);
    expect(pageOrderChangedSpy).toHaveBeenCalled();
    expect(selectionServiceMock.updateSelection).toHaveBeenCalledWith(1, 0);
  });

  it('should create a positioned element via createElement', () => {
    const idService = TestBed.inject(IDService);

    const element = TemplateService.createElement('text', { gridRow: 2, gridColumn: 3 }, { text: 'Hallo' }, idService);

    expect(element.type).toBe('text');
    expect(element.position.gridRow).toBe(2);
    expect(element.position.gridColumn).toBe(3);
    expect((element as TextElement).text).toBe('Hallo');
  });

  /* A margin a template does not name is 0, not the one the element type declares -- the spacing of a
     template section is tuned as a whole: the margins the builders write out are tuned against the 22
     neighbours that name none and contribute nothing. Letting the type fill those 22 gaps moves them by
     10px each, which is why the position group is completed in `createElement` and not left to the
     normalizer (#1193). */
  it('should give a template element no margin of its own type', () => {
    const idService = TestBed.inject(IDService);

    const text = TemplateService.createElement('text', { gridRow: 1, gridColumn: 1 }, { text: 'T' }, idService);
    const image = TemplateService.createElement('image', { gridRow: 2, gridColumn: 1 }, {}, idService);

    expect(text.position.marginBottom).toEqual({ value: 0, unit: 'px' });
    expect(image.position.marginBottom).toEqual({ value: 0, unit: 'px' });
  });

  it('should keep a margin the template names itself', () => {
    const idService = TestBed.inject(IDService);

    const element = TemplateService.createElement(
      'text', { gridRow: 1, gridColumn: 1, marginBottom: { value: 40, unit: 'px' } }, { text: 'T' }, idService
    );

    expect(element.position.marginBottom).toEqual({ value: 40, unit: 'px' });
  });
});
