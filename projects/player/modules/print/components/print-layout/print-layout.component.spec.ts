import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Page } from 'common/models/page';
import { PrintMode } from 'player/modules/verona/models/verona';
import { PrintLayoutComponent } from 'player/modules/print/components/print-layout/print-layout.component';

@Component({
  selector: 'aspect-print-page',
  template: '',
  standalone: false
})
class MockPrintPageComponent {
  @Input() page!: Page;
  @Input() printMode!: PrintMode;
  @Input() pageIndex!: number;
  @Input() sectionNumbering!: { enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above' };
}

describe('PrintLayoutComponent', () => {
  let component: PrintLayoutComponent;
  let fixture: ComponentFixture<PrintLayoutComponent>;

  const printPages = (): MockPrintPageComponent[] => fixture.debugElement
    .queryAll(By.directive(MockPrintPageComponent))
    .map(debugElement => debugElement.componentInstance as MockPrintPageComponent);

  /* The playerModules test target keeps the strict model instantiation. */
  const createPage = (): Page => new Page({
    sections: [],
    hasMaxWidth: true,
    maxWidth: 750,
    margin: 30,
    backgroundColor: '#ffffff',
    alwaysVisible: false,
    alwaysVisiblePagePosition: 'left',
    alwaysVisibleAspectRatio: 50
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintLayoutComponent,
        MockPrintPageComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintLayoutComponent);
    component = fixture.componentInstance;
    component.pages = [];
    component.printMode = 'on';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should print nothing without pages', () => {
    expect(printPages()).toEqual([]);
  });

  it('should print a page per unit page', () => {
    component.pages = [createPage(), createPage()];

    fixture.detectChanges();

    expect(printPages().length).toBe(2);
  });

  it('should number the printed pages consecutively', () => {
    component.pages = [createPage(), createPage(), createPage()];

    fixture.detectChanges();

    expect(printPages().map(page => page.pageIndex)).toEqual([0, 1, 2]);
  });

  it('should hand print mode and section numbering over to every page', () => {
    component.pages = [createPage()];
    component.printMode = 'on-with-ids';
    component.sectionNumbering = { enableSectionNumbering: true, sectionNumberingPosition: 'left' };

    fixture.detectChanges();

    expect(printPages()[0].printMode).toBe('on-with-ids');
    expect(printPages()[0].sectionNumbering).toEqual({
      enableSectionNumbering: true, sectionNumberingPosition: 'left'
    });
  });
});
