import { TestBed } from '@angular/core/testing';
import * as singleElement from 'test-data/unit-definitions/reference-testing/single-element.json';
import * as elementRef from 'test-data/unit-definitions/reference-testing/element-ref.json';
import * as elementRef2 from 'test-data/unit-definitions/reference-testing/2elements-ref.json';
import * as section1 from 'test-data/unit-definitions/reference-testing/section-deletion.json';
import * as section2 from 'test-data/unit-definitions/reference-testing/section2.json';
import * as pageRefs from 'test-data/unit-definitions/reference-testing/pageRefs.json';
import * as cloze from 'test-data/unit-definitions/reference-testing/cloze.json';
import * as pageNav from 'test-data/unit-definitions/reference-testing/pageNav.json';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { APIService } from 'common/shared.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { Section } from 'common/models/section';
import { Page, PageProperties } from 'common/models/page';
import { ClozeElement, ClozeProperties } from 'common/models/elements/compound-elements/cloze/cloze';
import { ReferenceManager } from 'editor/src/app/services/reference-manager';
import { Unit, UnitProperties } from 'common/models/unit';

describe('ReferenceManager', () => {
  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APIService, useClass: ApiStubService }
      ],
      imports: [MatSnackBarModule, MatDialogModule, BrowserAnimationsModule, TranslateModule.forRoot()]
    });
  });

  it('should load data', () => {
    expect(singleElement).toBeTruthy();
  });

  it('should find no refs for single element', () => {
    const refMan = new ReferenceManager(new Unit(singleElement as UnitProperties));
    const element = {
      type: 'drop-list',
      id: 'drop-list_1',
      label: 'Beschriftung',
      value: [],
      connectedTo: []
    } as unknown as DropListElement;
    expect(refMan.getElementsReferences([element]))
      .toEqual([]);
  });

  it('should find refs when deleting element (connected droplist)', () => {
    const refMan = new ReferenceManager(new Unit(elementRef as UnitProperties));
    const element = {
      type: 'drop-list',
      id: 'drop-list_1731317829457_1',
      alias: 'drop-list_1',
      label: 'Beschriftung',
      value: [],
      connectedTo: []
    } as unknown as DropListElement;

    expect(refMan.getElementsReferences([element])
      .length).toEqual(1);
    expect(refMan.getElementsReferences([element])[0].element)
      .toEqual(jasmine.objectContaining({ ...element }));
    expect(refMan.getElementsReferences([element])[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        alias: 'drop-list_2'
      }));
  });

  it('should find 2 refs when deleting 2 elements', () => {
    const refMan = new ReferenceManager(new Unit(elementRef2 as UnitProperties));
    const element1 = {
      type: 'drop-list',
      id: 'drop-list_1731317829457_1',
      alias: 'drop-list_1',
      value: [],
      connectedTo: []
    } as unknown as DropListElement;
    const element2 = {
      type: 'audio',
      id: 'audio_1731318487080_1',
      alias: 'audio_1'
    } as AudioElement;

    const refs = refMan.getElementsReferences([element1, element2]);

    expect(refs.length)
      .toEqual(2);
    expect(refs[0].element)
      .toEqual(jasmine.objectContaining({ ...element1 }));
    expect(refs[1].element)
      .toEqual(jasmine.objectContaining({
        type: 'audio',
        alias: 'audio_1'
      }));
    expect(refs[1].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'audio',
        alias: 'audio_2'
      }));
  });

  it('should find ref when deleting section', () => {
    const refMan = new ReferenceManager(new Unit(section1 as UnitProperties));
    const section = JSON.parse(JSON.stringify(section1)).pages[0].sections[0] as Section;
    const refs = refMan.getSectionElementsReferences([section]);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        id: 'drop-list_1731318755523_1',
        alias: 'drop-list_2'
      }));
  });

  it('should find refs when deleting section but ignore refs within same section', () => {
    const refMan = new ReferenceManager(new Unit(section2 as UnitProperties));
    const section = JSON.parse(JSON.stringify(section2)).pages[0].sections[0] as Section;
    const refs = refMan.getSectionElementsReferences([section]);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        alias: 'drop-list_3'
      }));
  });

  it('should ignore refs within same page', () => {
    const refMan = new ReferenceManager(new Unit(pageRefs as UnitProperties));
    const page = new Page(JSON.parse(JSON.stringify(pageRefs)).pages[0] as PageProperties);
    const refs = refMan.getPageElementsReferences(page);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        alias: 'drop-list_3'
      }));
  });

  it('should find cloze refs but ignore refs within same cloze', () => {
    const refMan = new ReferenceManager(new Unit(cloze as UnitProperties));
    const clozeElement = new ClozeElement(
      JSON.parse(JSON.stringify(cloze)).pages[0].sections[0].elements[0] as ClozeProperties);
    const refs = refMan.getElementsReferences([clozeElement]);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'drop-list',
        alias: 'drop-list_3'
      }));
  });

  it('should find page refs via buttons', () => {
    const refMan = new ReferenceManager(new Unit(pageNav as UnitProperties));
    const refs = refMan.getButtonReferencesForPage(0);

    expect(refs.length)
      .toEqual(1);
    expect(refs[0].refs.length)
      .toEqual(1);
    expect(refs[0].refs[0])
      .toEqual(jasmine.objectContaining({
        type: 'button',
        alias: 'button_1'
      }));
  });
});
