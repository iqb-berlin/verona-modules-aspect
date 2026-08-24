// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { PageViewComponent } from 'editor/src/app/components/page-view/page-view.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorSection } from 'editor/src/app/models/editor-section';
import { ElementService } from 'editor/src/app/services/element.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({ selector: 'aspect-unit-view-page-menu', standalone: false, template: '' })
class MockPageMenuComponent {
  @Input() page!: EditorPage;
  @Input() pageIndex!: number;
  @Output() pageOrderChanged = new EventEmitter<void>();
  @Output() alwaysVisiblePageModified = new EventEmitter();
}

@Component({ selector: 'aspect-editor-section-view', standalone: false, template: '' })
class MockSectionComponent {
  @Input() section!: EditorSection;
  @Input() sectionIndex!: number;
  @Input() lastSectionIndex!: number;
  @Input() pageIndex!: number;
  @Input() alwaysVisiblePage: boolean = false;
  @Input() isOnSelectedPage: boolean = false;
  @Output() sectionSelected = new EventEmitter();
}

@Component({ selector: 'aspect-unit-nav-next', standalone: false, template: '' })
class MockUnitNavNextComponent {}

describe('PageViewComponent', () => {
  let component: PageViewComponent;
  let fixture: ComponentFixture<PageViewComponent>;
  let selectionService: SelectionService;
  let sectionService: SpyObj<SectionService>;
  let unitService: SpyObj<UnitService>;
  let sectionCountUpdated: Subject<void>;
  let page: EditorPage;

  beforeEach(async () => {
    page = new EditorPage();
    page.addSection();
    sectionCountUpdated = new Subject<void>();
    sectionService = createSpyObj<SectionService>(['addSection']);
    selectionService = new SelectionService();
    unitService = createSpyObj<UnitService>(['moveSectionToNewpage', 'collapsePage']);
    Object.assign(unitService, {
      sectionCountUpdated,
      unit: { pages: [page], showUnitNavNext: false }
    });

    await TestBed.configureTestingModule({
      declarations: [
        PageViewComponent,
        MockPageMenuComponent,
        MockSectionComponent,
        MockUnitNavNextComponent
      ],
      imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
      providers: [
        { provide: SelectionService, useValue: selectionService },
        { provide: UnitService, useValue: unitService },
        { provide: ElementService, useValue: {} as ElementService },
        { provide: SectionService, useValue: sectionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageViewComponent);
    component = fixture.componentInstance;
    component.page = page;
    component.pageIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one section view per page section', () => {
    expect(fixture.nativeElement.querySelectorAll('aspect-editor-section-view').length).toBe(2);
  });

  it('should add a section and select it', () => {
    component.addSection(0);

    expect(sectionService.addSection).toHaveBeenCalledWith(page);
    expect(selectionService.selectedPageIndex).toBe(0);
    expect(selectionService.selectedSectionIndex).toBe(1);
  });

  it('should delegate the page break to the unit service', () => {
    selectionService.selectedSectionIndex = 1;

    component.moveSectionToNewpage(0);

    expect(unitService.moveSectionToNewpage).toHaveBeenCalledWith(0, 1);
  });

  /* The button stands on every page while the selection indices name one page, so a break started from
     another page's button would move nothing and leave a page without sections (#1203). */
  it('should offer the page break only for a section of its own page', () => {
    const pageBreakButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
    selectionService.updateSelection(0, 1);
    fixture.detectChanges();

    expect(pageBreakButton().disabled).toBe(false);

    selectionService.updateSelection(1, 1);
    fixture.detectChanges();

    expect(pageBreakButton().disabled).toBe(true);
  });

  it('should not offer the page break for the first section of its own page', () => {
    selectionService.updateSelection(0, 0);
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should delegate removing a page break to the unit service', () => {
    component.collapsePage(2);

    expect(unitService.collapsePage).toHaveBeenCalledWith(2);
  });

  /* Removing the break hands the sections to the page before this one, which the first regular page
     must not do while the page before it is the permanently visible one (#1298). */
  it('should not offer removing the page break in front of the permanently visible page', () => {
    const collapseButton = (): HTMLButtonElement => fixture.nativeElement.querySelectorAll('button')[1];
    component.pageIndex = 1;
    unitService.unit.pages = [new EditorPage(), page];
    fixture.detectChanges();

    expect(collapseButton().disabled).toBe(false);

    unitService.unit.pages[0].alwaysVisible = true;
    fixture.detectChanges();

    expect(collapseButton().disabled).toBe(true);
  });

  /* The editor keeps the permanently visible page at index 0 -- switching the flag on moves the page to
     the front -- but a definition loaded from elsewhere can carry it anywhere, and the player finds it
     wherever it is. The button asks about the page before this one, as the service does. */
  it('should not offer removing the page break behind a permanently visible page at any index', () => {
    const alwaysVisible = new EditorPage();
    alwaysVisible.alwaysVisible = true;
    component.pageIndex = 2;
    unitService.unit.pages = [new EditorPage(), alwaysVisible, page];
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it('should not offer removing the page break on the first page', () => {
    expect((fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it('should survive a section count update without rendered section components', () => {
    expect(() => sectionCountUpdated.next()).not.toThrow();
  });

  it('should stop listening for section count updates after destroy', () => {
    const toArraySpy = vi.spyOn(component.sectionComponents, 'toArray');

    fixture.destroy();
    sectionCountUpdated.next();

    expect(toArraySpy).not.toHaveBeenCalled();
  });
});
