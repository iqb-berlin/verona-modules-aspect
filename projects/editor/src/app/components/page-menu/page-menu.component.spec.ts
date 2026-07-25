import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { PageMenu } from 'editor/src/app/components/page-menu/page-menu.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { MessageService } from 'editor/src/app/services/message.service';
import { PageService } from 'editor/src/app/services/page.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

describe('PageMenu', () => {
  let component: PageMenu;
  let fixture: ComponentFixture<PageMenu>;
  let pageService: SpyObj<PageService>;
  let messageService: SpyObj<MessageService>;
  let selectionService: SelectionService;
  let pages: EditorPage[];
  let movePageToFront: Mock;
  let updateUnitDefinition: Mock;
  let updateSectionCounter: Mock;

  beforeEach(async () => {
    pages = [new EditorPage(), new EditorPage()];
    movePageToFront = vi.fn();
    updateUnitDefinition = vi.fn();
    updateSectionCounter = vi.fn();
    pageService = createSpyObj<PageService>(['moveSelectedPage', 'deletePage']);
    messageService = createSpyObj<MessageService>(['showWarning']);
    selectionService = new SelectionService();

    const unitServiceMock = {
      expertMode: true,
      unit: { pages, movePageToFront },
      updateUnitDefinition,
      updateSectionCounter
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [PageMenu],
      imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: PageService, useValue: pageService },
        { provide: SelectionService, useValue: selectionService },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageMenu);
    component = fixture.componentInstance;
    component.page = pages[1];
    component.pageIndex = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move the selected page and announce the new page order', () => {
    selectionService.selectedPageIndex = 1;
    let orderChanged = false;
    component.pageOrderChanged.subscribe(() => {
      orderChanged = true;
    });

    component.movePage('left');

    expect(pageService.moveSelectedPage).toHaveBeenCalledWith(1, 'left');
    expect(orderChanged).toBe(true);
  });

  it('should delete the page it belongs to', () => {
    component.deletePage();

    expect(pageService.deletePage).toHaveBeenCalledWith(1);
  });

  it('should write a valid value to the page and update the unit definition', () => {
    component.updateModel(component.page, 'maxWidth', 900);

    expect(component.page.maxWidth).toBe(900);
    expect(updateUnitDefinition).toHaveBeenCalled();
    expect(messageService.showWarning).not.toHaveBeenCalled();
  });

  it('should warn instead of writing an invalid value', () => {
    component.updateModel(component.page, 'maxWidth', 900, false);

    expect(component.page.maxWidth).toBe(750);
    expect(messageService.showWarning).toHaveBeenCalledWith('Eingabe ungültig');
    expect(updateUnitDefinition).not.toHaveBeenCalled();
  });

  it('should move a page to the front when it becomes permanently visible', () => {
    let orderChanged = false;
    let alwaysVisibleModified = false;
    component.pageOrderChanged.subscribe(() => {
      orderChanged = true;
    });
    component.alwaysVisiblePageModified.subscribe(() => {
      alwaysVisibleModified = true;
    });

    component.updateModel(component.page, 'alwaysVisible', true);

    expect(movePageToFront).toHaveBeenCalledWith(1);
    expect(component.page.alwaysVisible).toBe(true);
    expect(selectionService.selectedPageIndex).toBe(0);
    expect(updateSectionCounter).toHaveBeenCalled();
    expect(orderChanged).toBe(true);
    expect(alwaysVisibleModified).toBe(true);
  });
});
