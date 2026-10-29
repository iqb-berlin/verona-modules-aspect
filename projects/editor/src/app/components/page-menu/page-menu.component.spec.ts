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
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';

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
  let keepPageNavigation: Mock;

  beforeEach(async () => {
    pages = [new EditorPage(), new EditorPage()];
    movePageToFront = vi.fn();
    updateUnitDefinition = vi.fn();
    updateSectionCounter = vi.fn();
    pageService = createSpyObj<PageService>(['moveSelectedPage', 'deletePage']);
    messageService = createSpyObj<MessageService>(['showWarning']);
    selectionService = new SelectionService();

    keepPageNavigation = vi.fn((operation: () => void) => operation());

    const unitServiceMock = {
      expertMode: true,
      unit: { pages, movePageToFront },
      updateUnitDefinition,
      updateSectionCounter,
      keepPageNavigation
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [PageMenu, NumberFieldDirective, NumberFieldBadInputDirective],
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

  /* The message goes through TranslateService now; with no translations loaded it yields the key.
     It used to be a German literal in the component (rules.md §5). */
  it('should warn instead of writing an invalid value', () => {
    component.updateModel(component.page, 'maxWidth', 900, false);

    expect(component.page.maxWidth).toBe(750);
    expect(messageService.showWarning).toHaveBeenCalledWith('inputInvalid');
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

  /* Navigation buttons do not count a permanently visible page, so switching it on or off renumbers the others.
     The mock does not run the step: a page left as it was shows that the switch acts only inside
     `keepPageNavigation` (#1511). */
  it('should keep the navigation buttons on their pages when the page becomes permanently visible', () => {
    keepPageNavigation.mockImplementation(() => {});

    component.updateModel(component.page, 'alwaysVisible', true);

    expect(keepPageNavigation).toHaveBeenCalledOnce();
    expect(movePageToFront).not.toHaveBeenCalled();
    expect(component.page.alwaysVisible).toBe(false);
  });

  /* The targets are taken before the step and written back after it, so the step has to be whole inside: moved to
     the front AND marked, or the buttons are counted against a page list that is half done. */
  it('should both move and mark the page within the step that keeps the buttons on their pages', () => {
    const states: { moved: boolean; alwaysVisible: boolean }[] = [];
    const record = () => states.push({
      moved: movePageToFront.mock.calls.length > 0, alwaysVisible: component.page.alwaysVisible
    });
    keepPageNavigation.mockImplementation((operation: () => void) => {
      record();
      operation();
      record();
    });

    component.updateModel(component.page, 'alwaysVisible', true);

    expect(states).toEqual([{ moved: false, alwaysVisible: false }, { moved: true, alwaysVisible: true }]);
  });

  it('should keep the navigation buttons on their pages when the page stops being permanently visible', () => {
    component.page.alwaysVisible = true;
    keepPageNavigation.mockImplementation(() => {});

    component.updateModel(component.page, 'alwaysVisible', false);

    expect(keepPageNavigation).toHaveBeenCalledOnce();
    expect(component.page.alwaysVisible).toBe(true);
  });

  it('should make a permanently visible page a page like the others again', () => {
    component.page.alwaysVisible = true;

    component.updateModel(component.page, 'alwaysVisible', false);

    expect(component.page.alwaysVisible).toBe(false);
    expect(movePageToFront).not.toHaveBeenCalled();
    expect(updateUnitDefinition).toHaveBeenCalled();
  });

  /* The three number boxes had a guard already, and it was the closest of the pre-#1161 fields to
     the right shape - but it hung on `(ngModelChange)`, so it judged every keystroke, and
     `$event || 0` wrote a 0 for the one that emptied the box (#1164). */
  describe('the number boxes', () => {
    /* In template order: page width, margin, and - only in expert mode - the aspect ratio. */
    const boxes = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    );

    const type = (box: HTMLInputElement, value: string): void => {
      box.value = value;
      box.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const leave = async (box: HTMLInputElement): Promise<void> => {
      box.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should write an edited page width', async () => {
      type(boxes()[0], '900');
      await leave(boxes()[0]);

      expect(component.page.maxWidth).toBe(900);
      expect(messageService.showWarning).not.toHaveBeenCalled();
    });

    /* One warning for the whole edit: typing `-50` passes through `-5`, and judging the keystroke
       put one warning on screen after the other. */
    it('should warn once for an edit that passes through several invalid values', async () => {
      type(boxes()[0], '-5');
      type(boxes()[0], '-50');
      expect(messageService.showWarning).not.toHaveBeenCalled();

      await leave(boxes()[0]);

      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
      expect(component.page.maxWidth).toBe(750);
      expect(boxes()[0].value).toBe('750');
    });

    it('should refuse an emptied width rather than write a zero', async () => {
      type(boxes()[0], '');
      await leave(boxes()[0]);

      expect(component.page.maxWidth).toBe(750);
      expect(boxes()[0].value).toBe('750');
    });

    /* The margin box had the same guard and the same hole, and nothing pinned either. */
    it('should refuse an emptied margin', async () => {
      type(boxes()[1], '');
      await leave(boxes()[1]);

      expect(component.page.margin).toBe(30);
      expect(boxes()[1].value).toBe('30');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    it('should refuse a negative margin', async () => {
      type(boxes()[1], '-10');
      await leave(boxes()[1]);

      expect(component.page.margin).toBe(30);
      expect(boxes()[1].value).toBe('30');
    });

    /* The aspect ratio passed no validity at all, so its `min="0" max="100"` meant nothing. */
    it('should refuse an aspect ratio above the maximum', async () => {
      component.page.alwaysVisible = true;
      fixture.detectChanges();
      await fixture.whenStable();
      const ratio = boxes()[2];

      type(ratio, '150');
      await leave(ratio);

      expect(component.page.alwaysVisibleAspectRatio).toBe(50);
      expect(ratio.value).toBe('50');
    });
  });
});
