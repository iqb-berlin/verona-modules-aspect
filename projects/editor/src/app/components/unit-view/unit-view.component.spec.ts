// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { PageChangeService } from 'common/services/page-change.service';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { UnitViewComponent } from 'editor/src/app/components/unit-view/unit-view.component';
import {
  OverviewDialogComponent
} from 'editor/src/app/components/dialogs/overview-dialog/overview-dialog.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { PageService } from 'editor/src/app/services/page.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({ selector: 'aspect-ui-element-toolbox', standalone: false, template: '' })
class MockUiElementToolboxComponent {}

@Component({ selector: 'aspect-element-properties', standalone: false, template: '' })
class MockElementPropertiesPanelComponent {}

@Component({ selector: 'aspect-editor-page-view', standalone: false, template: '' })
class MockPageViewComponent {
  @Input() page!: EditorPage;
  @Input() pageIndex!: number;
  @Input() singlePageMode: boolean = false;
  @Input() isLastPage: boolean = false;
  @Output() pagesChanged = new EventEmitter<void>();
}

@Component({ selector: 'aspect-unit-view-page-menu', standalone: false, template: '' })
class MockPageMenuComponent {
  @Input() page!: EditorPage;
  @Input() pageIndex!: number;
  @Output() pageOrderChanged = new EventEmitter<void>();
  @Output() alwaysVisiblePageModified = new EventEmitter<void>();
}

const createCheckboxChange = (checked: boolean): MatCheckboxChange => ({ checked } as unknown as MatCheckboxChange);

/* Only the component's own logic is covered. The template wires up drawers, tab groups
   and menus of Angular Material, whose rendering is not part of this component's contract. */
describe('UnitViewComponent', () => {
  let component: UnitViewComponent;
  let fixture: ComponentFixture<UnitViewComponent>;
  let selectionService: SelectionService;
  let pageService: SpyObj<PageService>;
  let unitService: SpyObj<UnitService>;
  let dialog: SpyObj<MatDialog>;
  let pageOrderChanged: Subject<void>;
  let pages: EditorPage[];

  beforeEach(async () => {
    pages = [new EditorPage(), new EditorPage()];
    pageOrderChanged = new Subject<void>();
    selectionService = new SelectionService();
    pageService = createSpyObj<PageService>(['addPage']);
    unitService = createSpyObj<UnitService>([
      'setSectionNumbering', 'setSectionNumberingPosition', 'setUnitNavNext', 'setSectionExpertMode'
    ]);
    Object.assign(unitService, {
      pageOrderChanged,
      allowExpertMode: true,
      expertMode: true,
      unit: {
        pages,
        enableSectionNumbering: false,
        sectionNumberingPosition: 'left',
        showUnitNavNext: false
      }
    });
    dialog = createSpyObj<MatDialog>(['open']);
    dialog.open.mockReturnValue({
      afterClosed: () => of(undefined)
    } as unknown as MatDialogRef<OverviewDialogComponent>);

    await TestBed.configureTestingModule({
      declarations: [
        UnitViewComponent,
        MockUiElementToolboxComponent,
        MockElementPropertiesPanelComponent,
        MockPageViewComponent,
        MockPageMenuComponent
      ],
      imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        MatCheckboxModule,
        MatIconModule,
        MatMenuModule,
        MatSidenavModule,
        MatTabsModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SelectionService, useValue: selectionService },
        { provide: UnitService, useValue: unitService },
        { provide: PageService, useValue: pageService },
        { provide: MatDialog, useValue: dialog },
        { provide: PageChangeService, useValue: new PageChangeService() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.pagesLoaded).toBe(true);
    expect(component.showPagesAsList).toBe(true);
  });

  it('should add a page and select it', () => {
    component.addPage();

    expect(pageService.addPage).toHaveBeenCalled();
    expect(selectionService.selectedPageIndex).toBe(1);
    expect(selectionService.selectedSectionIndex).toBe(0);
  });

  it('should select a page via the selection service', () => {
    component.selectPage(1);

    expect(selectionService.selectedPageIndex).toBe(1);
  });

  it('should re-create the tabs by unloading and reloading them', fakeAsync(() => {
    component.refreshTabs();
    expect(component.pagesLoaded).toBe(false);

    tick();
    expect(component.pagesLoaded).toBe(true);
  }));

  it('should refresh the tabs when the page order changed', fakeAsync(() => {
    pageOrderChanged.next();
    expect(component.pagesLoaded).toBe(false);

    tick();
    expect(component.pagesLoaded).toBe(true);
  }));

  it('should toggle between list and single page mode', () => {
    component.toggleViewMode();
    expect(component.showPagesAsList).toBe(false);

    component.toggleViewMode();
    expect(component.showPagesAsList).toBe(true);
  });

  it('should delegate the unit wide settings to the unit service', () => {
    component.setSectionNumbering(createCheckboxChange(true));
    component.setSectionNumberingPosition(createCheckboxChange(true));
    component.setUnitNavNext(createCheckboxChange(false));
    component.setExpertMode(createCheckboxChange(false));

    expect(unitService.setSectionNumbering).toHaveBeenCalledWith(true);
    expect(unitService.setSectionNumberingPosition).toHaveBeenCalledWith('above');
    expect(unitService.setUnitNavNext).toHaveBeenCalledWith(false);
    expect(unitService.setSectionExpertMode).toHaveBeenCalledWith(false);
  });

  it('should use the left numbering position when the position checkbox is unchecked', () => {
    component.setSectionNumberingPosition(createCheckboxChange(false));

    expect(unitService.setSectionNumberingPosition).toHaveBeenCalledWith('left');
  });

  it('should open the overview dialog', () => {
    component.openOverview();

    expect(dialog.open).toHaveBeenCalledWith(OverviewDialogComponent, {
      width: '70%',
      height: '70%',
      autoFocus: false
    });
  });

  it('should stop refreshing the tabs after destroy', () => {
    fixture.destroy();

    pageOrderChanged.next();

    expect(component.pagesLoaded).toBe(true);
  });
});
