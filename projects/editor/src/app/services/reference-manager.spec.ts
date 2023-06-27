import { TestBed } from '@angular/core/testing';
import * as singleElement from 'test-data/unit-definitions/reference-testing/single-element.json';
import * as elementRef from 'test-data/unit-definitions/reference-testing/element-ref.json';
import * as elementRef2 from 'test-data/unit-definitions/reference-testing/2elements-ref.json';
import { default as section1 } from 'test-data/unit-definitions/reference-testing/section-deletion.json';
import { default as section2 } from 'test-data/unit-definitions/reference-testing/section2.json';
import { default as pageRefs } from 'test-data/unit-definitions/reference-testing/pageRefs.json';
import { default as cloze } from 'test-data/unit-definitions/reference-testing/cloze.json';
import { default as pageNav } from 'test-data/unit-definitions/reference-testing/pageNav.json';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { APIService } from 'common/shared.module';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { Section } from 'common/models/section';
import { Page } from 'common/models/page';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';

describe('ReferenceManager', () => {
  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  let unitService: UnitService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APIService, useClass: ApiStubService }
      ],
      imports: [MatSnackBarModule, MatDialogModule, BrowserAnimationsModule, TranslateModule.forRoot()]
    });
    unitService = TestBed.inject(UnitService);
  });

  it('should load data', () => {
    expect(singleElement).toBeTruthy();
  });

  it('should find no refs for single element', () => {
    unitService.loadUnitDefinition(JSON.stringify(singleElement));
    const element = {
      type: 'drop-list',
      id: 'drop-list_1',
      label: 'Beschriftung',
      value: [],
      connectedTo: []
    } as unknown as DropListElement;
    expect(unitService.referenceManager.getElementsReferences([element]))
      .toEqual([]);
  });

  it('should find refs when deleting element', () => {
    unitService.loadUnitDefinition(JSON.stringify(elementRef));

    const element = {
      type: 'drop-list',
      id: 'drop-list_1',
      label: 'Beschriftung',
      value: [],
      connectedTo: []
    } as unknown as DropListElement;

    expect(unitService.referenceManager.getElementsReferences([element]).length)
      .toEqual(1);
    expect(unitService.referenceManager.getElementsReferences([element])[0].element)
      .toEqual(jasmine.objectContaining({ ...element }));
    expect(unitService.referenceManager.getElementsReferences([element])[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        id: 'drop-list_2'
      }));
  });

  it('should find 2 refs when deleting 2 elements', () => {
    unitService.loadUnitDefinition(JSON.stringify(elementRef2));

    const element1 = {
      type: 'drop-list',
      id: 'drop-list_1',
      value: [],
      connectedTo: []
    } as unknown as DropListElement;
    const element2 = {
      type: 'audio',
      id: 'audio_1'
    } as AudioElement;

    const refs = unitService.referenceManager.getElementsReferences([element1, element2]);

    expect(refs.length)
      .toEqual(2);
    expect(refs[0].element)
      .toEqual(jasmine.objectContaining({ ...element1 }));
    expect(refs[1].element)
      .toEqual(jasmine.objectContaining({
        type: 'audio',
        id: 'audio_1'
      }));
    expect(refs[1].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'audio',
        id: 'audio_2'
      }));
  });

  it('should find ref when deleting section', () => {
    unitService.loadUnitDefinition(JSON.stringify(section1));
    const section = section1.pages[0].sections[0] as unknown as Section;
    const refs = unitService.referenceManager.getSectionElementsReferences([section]);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        id: 'drop-list_3'
      }));
  });

  it('should find refs when deleting section but ignore refs within same section', () => {
    unitService.loadUnitDefinition(JSON.stringify(section2));
    const section = section2.pages[0].sections[0] as unknown as Section;
    const refs = unitService.referenceManager.getSectionElementsReferences([section]);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        id: 'drop-list_3'
      }));
  });

  it('should ignore refs within same page', () => {
    unitService.loadUnitDefinition(JSON.stringify(pageRefs));
    const page = new Page(pageRefs.pages[0]);
    const refs = unitService.referenceManager.getPageElementsReferences(page);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        id: 'drop-list_3'
      }));
  });

  it('should find cloze refs but ignore refs within same cloze', () => {
    unitService.loadUnitDefinition(JSON.stringify(cloze));
    const clozeElement =
      new ClozeElement(cloze.pages[0].sections[0].elements[0] as unknown as Partial<ClozeElement>);
    const refs = unitService.referenceManager.getElementsReferences([clozeElement]);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        id: 'drop-list_3'
      }));
  });

  it('should find page refs via buttons', () => {
    unitService.loadUnitDefinition(JSON.stringify(pageNav));
    const refs = unitService.referenceManager.getPageButtonReferences(0);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'button',
        id: 'button_2'
      }));
  });
});
