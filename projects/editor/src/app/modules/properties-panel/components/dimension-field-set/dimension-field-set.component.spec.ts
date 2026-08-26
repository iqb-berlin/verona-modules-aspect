import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import {
  DimensionFieldSetComponent
} from 'editor/src/app/modules/properties-panel/components/dimension-field-set/dimension-field-set.component';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  LimitEnabledStatePipe
} from 'editor/src/app/modules/properties-panel/pipes/limit-enabled-state.pipe';
import {
  PropertyDivergesPipe
} from 'editor/src/app/modules/properties-panel/pipes/property-diverges.pipe';

describe('DimensionFieldSetComponent', () => {
  let component: DimensionFieldSetComponent;
  let fixture: ComponentFixture<DimensionFieldSetComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;

  const selectedElements = [{ id: 'el1' } as UIElement];
  const selectionServiceMock = {
    selectedPageIndex: 0,
    selectedSectionIndex: 0,
    isCompoundChildSelected: false,
    onlyCompoundChildrenSelected: false,
    getSelectedElements: () => selectedElements
  } as unknown as SelectionService;

  const hasFixedWidthCheckbox = (): boolean => Array.from(
    fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
  ).some(checkbox => checkbox.textContent?.includes('propertiesPanel.isWidthFixed'));

  beforeEach(async () => {
    /* Set per test: the mock outlives a single test, so a test that switches the layout would
       otherwise decide the next one. The inline layout is this spec's default. */
    selectionServiceMock.isSelectionDynamicallyPositioned = true;
    elementService = createSpyObj<ElementService>(['updateElementsDimensionsProperty']);
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [DimensionFieldSetComponent, MergedCheckboxComponent, NumberFieldDirective,
        MergedMarkerComponent, LimitEnabledStatePipe, PropertyDivergesPipe
      ],
      imports: [
        MatTooltipModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DimensionFieldSetComponent);
    component = fixture.componentInstance;
    component.dimensions = {
      width: 100,
      height: 50,
      isWidthFixed: false,
      isHeightFixed: false,
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null
    } as DimensionProperties;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  /* The two mocks are shared by the whole file, so a test that moves them puts them back. */
  afterEach(() => {
    selectionServiceMock.isSelectionDynamicallyPositioned = true;
    selectionServiceMock.isCompoundChildSelected = false;
    selectionServiceMock.onlyCompoundChildrenSelected = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the fixed width checkbox in dynamic positioning mode', () => {
    expect(hasFixedWidthCheckbox()).toBe(true);
  });

  it('should not show it for a selection that mixes a compound child with another element', () => {
    selectionServiceMock.isSelectionDynamicallyPositioned = false;
    selectionServiceMock.isCompoundChildSelected = true;

    fixture.detectChanges();

    expect(hasFixedWidthCheckbox()).toBe(false);
  });

  it('should delegate dimension updates to the element service', () => {
    component.updateDimensionProperty('width', 200);

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith(selectedElements, 'width', 200);
  });

  it('should reset the property to null when a toggle is unchecked', () => {
    component.toggleProperty('minWidth', false);

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith(selectedElements, 'minWidth', null);
  });

  it('should not update anything when a toggle is checked', () => {
    component.toggleProperty('minWidth', true);

    expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
  });

  /* All ten size boxes write into the ElementService from this component instead of emitting up to
     the host, so the host's guard never covered them: `min="0"` was on every one of them and meant
     nothing, and an emptied width or height sent null into a property declared `number` (#1161).
     The mechanics now sit in `aspectNumberField`; what is left here is the decision what to do
     with its two outcomes, and these go through the boxes so the wiring is covered too.

     Note the directive is listed in `declarations` rather than pulled in through
     `NumberFieldModule`: with the module in `imports` it does not reach this template and every
     binding on it fails with NG0303, and a test module of its own collides with
     PropertiesPanelModule, which the test build also sees (NG6007). Same wall as the NG0304 case
     already known for this suite. */
  describe('the size boxes', () => {
    /** In template order, under dynamic positioning: width, height, then the four min/max boxes. */
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

    beforeEach(async () => {
      // Both size boxes are disabled until their fixed-size checkbox is ticked.
      component.dimensions = {
        ...component.dimensions, isWidthFixed: true, isHeightFixed: true, maxWidth: 400
      };
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should write an edited width', () => {
      type(boxes()[0], '250');

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith(selectedElements, 'width', 250);
    });

    /* `width` is declared `number`, so its box is `required` and an emptied one is refused rather
       than saved as a 0 the user never typed - reported when the field is left, not on the
       keystroke that empties it. */
    it('should refuse a width left empty and put the box back', async () => {
      type(boxes()[0], '');
      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();

      await leave(boxes()[0]);

      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
      expect(boxes()[0].value).toBe('100');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    /* `min="0"` sat on every box before this and nothing acted on it, so a negative size was
       saved. One warning for the whole edit, and the box goes back to what the model holds. */
    it('should refuse a negative height and put the box back', async () => {
      type(boxes()[1], '-5');
      type(boxes()[1], '-50');

      await leave(boxes()[1]);

      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
      expect(boxes()[1].value).toBe('50');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    /* The maximum is `number | null`, so its box carries no `required`: clearing it means "no
       maximum" and must reach the model as null, or a maximum once set could never be taken off
       again. */
    it('should clear a maximum width to null rather than zero', async () => {
      const maxWidthBox = boxes()[3];

      type(maxWidthBox, '');
      await leave(maxWidthBox);

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith(selectedElements, 'maxWidth', null);
    });

    /* And the same with Enter, which since #1169 ends an edit like leaving the field does. This box
       may legitimately be empty, so the clearing is written rather than refused - the deferral it
       waits for is about the *keystroke* that empties it, where the user is on their way to another
       number, not about a confirmation.
       Worth pinning because clearing this property is what takes the box away: the checkbox above it
       reads the model, unticks, and disables the box the caret is still in. That is the state the
       author asked for - there is no limit left to type - and it is the same state a blur produces;
       Enter only reaches it at the moment they said so. What must not happen is the box staying
       behind unusable, so the checkbox has to lead back in. */
    it('should clear a maximum width on Enter and offer the way back', async () => {
      const maxWidthBox = boxes()[3];
      maxWidthBox.focus();
      type(maxWidthBox, '');

      maxWidthBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith(selectedElements, 'maxWidth', null);
      expect(messageService.showWarning).not.toHaveBeenCalled();

      // The service is a spy here, so the model is followed by hand - the round trip the real one makes.
      component.dimensions = { ...component.dimensions, maxWidth: null };
      fixture.detectChanges();
      await fixture.whenStable();

      const maxWidthCheckbox = (): HTMLInputElement => fixture.nativeElement
        .querySelectorAll('mat-checkbox input')[3] as HTMLInputElement;
      expect(maxWidthCheckbox().checked).toBe(false);
      expect(boxes()[3].disabled).toBe(true);
      /* And it lets go cleanly: disabling the box the caret sat in leaves neither the browser's
         focus nor Material's focused state behind. Measured, because a form field that keeps
         `mat-focused` goes on showing a raised label over a box nobody can reach. */
      expect(document.activeElement).toBe(document.body);
      expect((fixture.nativeElement.querySelectorAll('mat-form-field')[3] as HTMLElement)
        .classList.contains('mat-focused')).toBe(false);

      // Ticking it again hands the box back, so nothing is stuck.
      maxWidthCheckbox().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(boxes()[3].disabled).toBe(false);
    });
  });

  /* The four limit properties are `number | null`, so the merge's null for "they disagree" is
     indistinguishable from the model's null for "no limit" - and the box, reading only the value,
     used to claim the latter about a selection where every element has a limit (#1167). The panel
     now hands down where the selection diverges, and these pin what the pair does with it. */
  describe('the limit boxes under a diverging selection', () => {
    /** Template order under dynamic positioning: fixed width, fixed height, min/max width, min/max height. */
    const checkboxes = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    );
    const boxes = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    );

    const withDivergingMaxWidth = async (): Promise<void> => {
      // What the merge produces for 100 against 200: the value is gone, the divergence is recorded.
      component.dimensions = { ...component.dimensions, maxWidth: null };
      component.divergingProperties = new Set(['dimensions.maxWidth']);
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should show the maximum width box as indeterminate rather than unchecked', async () => {
      await withDivergingMaxWidth();

      expect(checkboxes()[3].getAttribute('aria-checked')).toBe('mixed');
      expect(checkboxes()[3].checked).toBe(false);
    });

    /* The state the author has to be able to leave: an indeterminate box means there is something
       to overwrite, so its field stays editable - typing one number is how the selection is
       resolved. A disabled field would have offered no way out but unticking, which clears all. */
    it('should keep the maximum width field editable while the box is indeterminate', async () => {
      await withDivergingMaxWidth();

      expect(boxes()[3].disabled).toBe(false);

      boxes()[3].value = '150';
      boxes()[3].dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith(selectedElements, 'maxWidth', 150);
    });

    it('should mark the diverging field and leave the others unmarked', async () => {
      await withDivergingMaxWidth();

      const markedFields = Array.from(
        fixture.nativeElement.querySelectorAll('mat-form-field') as NodeListOf<HTMLElement>
      ).map(field => !!field.querySelector('aspect-merged-marker'));
      expect(markedFields[3]).toBe(true);
      expect(markedFields[4]).toBe(false);
      expect(markedFields[5]).toBe(false);
    });

    /* The counter-case, and the reason the set is needed at all: elements that agree on having no
       limit produce the very same null, and there the box is right to say so. */
    it('should leave a shared absent limit unchecked and unmarked', async () => {
      component.dimensions = { ...component.dimensions, maxWidth: null };
      component.divergingProperties = new Set<string>();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(checkboxes()[3].getAttribute('aria-checked')).not.toBe('mixed');
      expect(checkboxes()[3].checked).toBe(false);
      expect(boxes()[3].disabled).toBe(true);
      expect((fixture.nativeElement.querySelectorAll('mat-form-field')[3] as HTMLElement)
        .querySelector('aspect-merged-marker')).toBeNull();
    });

    /* Clicking an indeterminate box means "give them all a limit", which is what `MergedCheckbox`
       emits `true` for. Nothing is written yet - the number the author types next is the write.

       And the limit of this solution, pinned rather than hidden: the click leaves the box ticked,
       and it stays ticked even though the elements still disagree. `MergedCheckbox` reacts to a new
       `value` only, and the value it is bound to is still null, so nothing restores the third state.
       For "100 against 200" the tick is true anyway - every element does have a limit - and only for
       "a limit against no limit" does it overstate. What carries the disagreement either way is the
       marker in the field, which reads the divergence set directly and is unaffected by the click. */
    it('should not write anything when an indeterminate box is clicked', async () => {
      await withDivergingMaxWidth();

      checkboxes()[3].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
      expect(boxes()[3].disabled).toBe(false);
      expect((fixture.nativeElement.querySelectorAll('mat-form-field')[3] as HTMLElement)
        .querySelector('aspect-merged-marker')).not.toBeNull();
    });
  });

  /* All four limits treat a typed 0 as "no limit", the same as the box the checkbox empties, so
     each of them carries the hint (#1350). */
  it('should say what a zero limit means at each of the four limits', () => {
    const hints = Array.from(
      fixture.nativeElement.querySelectorAll('mat-hint') as NodeListOf<HTMLElement>
    ).map(hint => hint.textContent?.trim());

    expect(hints).toEqual(Array(4).fill('propertiesPanel.dimensionNoLimitHint'));
  });
});
