import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { Page } from 'common/models/page';
import { ValidPagesPipe } from './valid-pages.pipe';

describe('ValidPagesPipe', () => {
  let pipe: ValidPagesPipe;
  let translateService: TranslateService;
  const TRANSLATIONS = {
    de: {
      pageIndication: 'Seite {{index}}'
    }
  };

  const page = new Page({
    hasMaxWidth: false,
    maxWidth: 0,
    margin: 0,
    backgroundColor: 'white',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50,
    sections: []
  });

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [TranslateTestingModule.withTranslations(TRANSLATIONS).withDefaultLanguage('de')]
      });
    translateService = TestBed.inject(TranslateService);
    pipe = new ValidPagesPipe(translateService);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 1 valid page', () => {
    const pages = [page];
    expect(pipe.transform(pages)).toEqual({ 0: 'Seite 1' });
  });

  it('should transform 3 valid pages', () => {
    const pages = [page, page, page];
    expect(pipe.transform(pages)).toEqual({ 0: 'Seite 1', 1: 'Seite 2', 2: 'Seite 3' });
  });

  it('should transform an empty pages array to an empty object', () => {
    const pages: Page[] = [];
    expect(pipe.transform(pages)).toEqual({ });
  });
});
