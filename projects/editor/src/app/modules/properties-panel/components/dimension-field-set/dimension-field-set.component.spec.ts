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
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  DimensionFieldSetComponent
} from 'editor/src/app/modules/properties-panel/components/dimension-field-set/dimension-field-set.component';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/src/app/modules/properties-panel/components/merged-marker/merged-marker.component';

describe('DimensionFieldSetComponent', () => {
  let component: DimensionFieldSetComponent;
  let fixture: ComponentFixture<DimensionFieldSetComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;

  const selectedElements = [{ id: 'el1' } as UIElement];
  const unitServiceMock = {
    unit: { pages: [{ sections: [{ dynamicPositioning: true }] }] }
  } as unknown as UnitService;
  const selectionServiceMock = {
    selectedPageIndex: 0,
    selectedSectionIndex: 0,
    isCompoundChildSelected: false,
    getSelectedElements: () => selectedElements
  } as unknown as SelectionService;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateElementsDimensionsProperty']);
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [DimensionFieldSetComponent, MergedCheckboxComponent, NumberFieldDirective,
        MergedMarkerComponent
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
        { provide: UnitService, useValue: unitServiceMock },
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the fixed width checkbox in dynamic positioning mode', () => {
    const checkboxLabels = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox') as NodeListOf<HTMLElement>
    ).map(checkbox => checkbox.textContent);
    expect(checkboxLabels.some(label => label?.includes('propertiesPanel.isWidthFixed'))).toBe(true);
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
  });
});
