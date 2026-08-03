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
