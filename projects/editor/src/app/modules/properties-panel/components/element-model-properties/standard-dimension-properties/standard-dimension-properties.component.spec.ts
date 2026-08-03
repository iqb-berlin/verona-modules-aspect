import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { panelSectionsOf } from 'editor/src/app/modules/properties-panel/models/panel-sections';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
import {
  MergedMarkerComponent
} from 'editor/modules/editor-shared/components/merged-marker/merged-marker.component';
import {
  StandardDimensionPropertiesComponent
} from './standard-dimension-properties.component';

describe('StandardDimensionPropertiesComponent', () => {
  let component: StandardDimensionPropertiesComponent;
  let fixture: ComponentFixture<StandardDimensionPropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;

  const selectedElement = { type: 'drop-list', id: 'dl1' } as unknown as UIElement;

  /** What the panel's distributor passes down: the sections the selected element type has. */
  const select = (type: UIElementType): void => {
    component.show = panelSectionsOf([{ type } as UIElement]);
  };

  const numberFields = (): HTMLInputElement[] => Array.from(
    fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
  );
  const labels = (): string[] => Array.from(
    fixture.nativeElement.querySelectorAll('mat-label, mat-checkbox') as NodeListOf<HTMLElement>
  ).map(label => label.textContent?.trim() ?? '');

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateElementsDimensionsProperty']);
    messageService = createSpyObj<MessageService>(['showWarning']);

    await TestBed.configureTestingModule({
      declarations: [StandardDimensionPropertiesComponent, MergedCheckboxComponent, NumberFieldDirective,
        MergedMarkerComponent
      ],
      imports: [
        MatTooltipModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: messageService },
        { provide: SelectionService, useValue: { getSelectedElements: () => [selectedElement] } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StandardDimensionPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      dimensions: {
        width: 240, height: 100, isWidthFixed: false, isHeightFixed: false, maxWidth: null
      }
    };
    select('drop-list');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* The maximum width has no section of its own because every element type has dimensions and
     `maxWidth` defaults to null rather than being absent - so it is the one pair that shows up
     whatever is selected. */
  it('should offer the maximum width for any element', () => {
    select('text');
    fixture.detectChanges();

    expect(labels().some(label => label.includes('propertiesPanel.maxWidthEnabled'))).toBe(true);
    expect(labels().some(label => label.includes('propertiesPanel.isWidthFixed'))).toBe(false);
  });

  it('should offer the fixed width pair for a drop list', () => {
    expect(labels().some(label => label.includes('propertiesPanel.isWidthFixed'))).toBe(true);
    expect(numberFields().length).toBe(2);
  });

  it('should offer width and height for the geometry element', () => {
    select('geometry');
    fixture.detectChanges();

    expect(labels().some(label => label.includes('propertiesPanel.height'))).toBe(true);
    expect(labels().some(label => label.includes('propertiesPanel.isWidthFixed'))).toBe(false);
  });

  // Moved here with the fields themselves, from ui-element-properties.
  it('should delegate dimension updates to the element service', () => {
    component.updateDimensionProperty('width', 300);

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith([selectedElement], 'width', 300);
  });

  it('should reset a dimension property to null when a toggle is unchecked', () => {
    component.toggleProperty('maxWidth', false);

    expect(elementService.updateElementsDimensionsProperty)
      .toHaveBeenCalledWith([selectedElement], 'maxWidth', null);
    elementService.updateElementsDimensionsProperty.mockClear();

    component.toggleProperty('maxWidth', true);

    expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
  });

  /* These fields write into the ElementService straight from this component instead of emitting up
     to the host, so the host's guard never saw them: `min="0"` was on all four boxes and meant
     nothing, and an emptied box sent null into a property declared `number` (#1154). */
  describe('the guard on the size fields', () => {
    beforeEach(async () => {
      select('geometry');
      component.combinedProperties = {
        dimensions: { width: 240, height: 100, maxWidth: 400 }
      };
      fixture.detectChanges();
      await fixture.whenStable();
    });

    /* `width` is declared `number`, so its box is `required`: an empty one is refused like a
       negative value rather than saved as a 0 the user never typed (#1161). */
    it('should refuse a width left empty and put the box back', async () => {
      const widthField = numberFields()[0];

      widthField.value = '';
      widthField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled(); // mid-edit

      widthField.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
      expect(widthField.value).toBe('240');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    it('should refuse a negative height and put the box back', async () => {
      const heightField = numberFields()[1];

      heightField.value = '-5';
      heightField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();

      heightField.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
      expect(heightField.value).toBe('100');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    /* One warning for the whole edit: typing `-50` passes through `-5`, and warning on the
       keystroke put one warning on screen after the other for a single edit. */
    it('should warn once for an edit that passes through several invalid values', async () => {
      const heightField = numberFields()[1];

      ['-5', '-50'].forEach(value => {
        heightField.value = value;
        heightField.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      });
      heightField.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });

    /* `maxWidth` is `number | null`, so unlike width and height an empty box is the legitimate
       "no maximum" and must not be turned into a 0. */
    it('should leave an emptied maximum width empty', () => {
      const maxWidthField = numberFields()[2];

      maxWidthField.value = '';
      maxWidthField.dispatchEvent(new Event('input'));
      maxWidthField.dispatchEvent(new Event('blur'));

      expect(elementService.updateElementsDimensionsProperty)
        .toHaveBeenCalledWith([selectedElement], 'maxWidth', null);
      expect(messageService.showWarning).not.toHaveBeenCalled();
    });

    it('should refuse a negative maximum width', async () => {
      const maxWidthField = numberFields()[2];

      maxWidthField.value = '-1';
      maxWidthField.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      maxWidthField.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(elementService.updateElementsDimensionsProperty).not.toHaveBeenCalled();
      expect(maxWidthField.value).toBe('400');
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
    });
  });

  /* The block used to be a direct child of the panel's flex column; as a component it needs to be
     one itself, or the number fields fall back to mat-form-field's inline-flex width. This is the
     class of regression the characterization baseline cannot see - it records no CSS. */
  it('should lay its fields out as a stretching column', () => {
    const host = getComputedStyle(fixture.nativeElement as HTMLElement);

    expect(host.display).toBe('flex');
    expect(host.flexDirection).toBe('column');
  });
});
