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

  it('should delegate removing a page break to the unit service', () => {
    component.collapsePage(2);

    expect(unitService.collapsePage).toHaveBeenCalledWith(2);
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
