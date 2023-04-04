import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'common/shared.module';
import { Page } from 'common/models/page';
import { ScrollPagesPipe } from './scroll-pages.pipe';

describe('ScrollPagesPipe', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule
      ]
    })
      .compileComponents();
  });

  const page: Page = new Page({
    hasMaxWidth: false,
    maxWidth: 0,
    margin: 0,
    backgroundColor: 'white',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50,
    sections: []
  });

  const pipe = new ScrollPagesPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 3 pages to 2 scroll pages', () => {
    const pages = [page, page, { ...page, alwaysVisible: true } as Page];
    expect(pipe.transform(pages).length).toBe(2);
  });

  it('should transform 2 pages to 2 scroll pages', () => {
    const pages = [page, page];
    expect(pipe.transform(pages).length).toBe(2);
  });
});
