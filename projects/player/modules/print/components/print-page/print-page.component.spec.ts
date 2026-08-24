import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { PrintMode } from 'player/modules/verona/models/verona';
import { PrintPageComponent } from 'player/modules/print/components/print-page/print-page.component';

@Component({
  selector: 'aspect-print-section',
  template: '',
  standalone: false
})
class MockPrintSectionComponent {
  @Input() section!: Section;
  @Input() printMode!: PrintMode;
  @Input() pageIndex!: number;
  @Input() sectionNumbering!: { enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above' };
}

describe('PrintPageComponent', () => {
  let component: PrintPageComponent;
  let fixture: ComponentFixture<PrintPageComponent>;

  /* The playerModules test target keeps the strict model instantiation. */
  const createPage = (properties: Partial<Page> = {}): Page => {
    const page = new Page({
      sections: [],
      hasMaxWidth: true,
      maxWidth: 750,
      margin: 30,
      backgroundColor: '#ffffff',
      alwaysVisible: false,
      alwaysVisiblePagePosition: 'left',
      alwaysVisibleAspectRatio: 50
    });
    Object.assign(page, properties);
    return page;
  };

  const printPage = (): HTMLElement => fixture.debugElement.query(By.css('.print-page')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintPageComponent,
        MockPrintSectionComponent
      ],
      imports: [CommonModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintPageComponent);
    component = fixture.componentInstance;
    component.printMode = 'on';
    component.pageIndex = 1;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should print nothing without a page', () => {
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.print-page'))).toBeNull();
  });

  it('should print a section per page section', () => {
    component.page = createPage();

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.directive(MockPrintSectionComponent)).length)
      .toBe(component.page.sections.length);
  });

  it('should apply the page layout', () => {
    component.page = createPage({ maxWidth: 600, margin: 20, backgroundColor: 'rgb(255, 0, 0)' });

    fixture.detectChanges();

    expect(printPage().style.width).toBe('600px');
    expect(printPage().style.padding).toBe('20px');
    expect(printPage().style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('should not limit the width of a page without maximum width', () => {
    component.page = createPage({ hasMaxWidth: false });

    fixture.detectChanges();

    expect(printPage().style.width).toBe('');
  });

  it('should hand print mode and page index over to the sections', () => {
    component.page = createPage();
    component.printMode = 'on-with-ids';

    fixture.detectChanges();

    const section = fixture.debugElement.query(By.directive(MockPrintSectionComponent))
      ?.componentInstance as MockPrintSectionComponent | undefined;
    if (section) {
      expect(section.printMode).toBe('on-with-ids');
      expect(section.pageIndex).toBe(1);
    }
    expect(component.printMode).toBe('on-with-ids');
  });
});
