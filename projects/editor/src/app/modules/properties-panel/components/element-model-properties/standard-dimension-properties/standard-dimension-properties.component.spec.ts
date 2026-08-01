import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { SelectionService } from 'editor/src/app/services/selection.service';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { panelSectionsOf } from 'editor/src/app/modules/properties-panel/models/panel-sections';
import {
  StandardDimensionPropertiesComponent
} from './standard-dimension-properties.component';

describe('StandardDimensionPropertiesComponent', () => {
  let component: StandardDimensionPropertiesComponent;
  let fixture: ComponentFixture<StandardDimensionPropertiesComponent>;
  let elementService: SpyObj<ElementService>;

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

    await TestBed.configureTestingModule({
      declarations: [StandardDimensionPropertiesComponent, MergedCheckboxComponent],
      imports: [
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

  /* The block used to be a direct child of the panel's flex column; as a component it needs to be
     one itself, or the number fields fall back to mat-form-field's inline-flex width. This is the
     class of regression the characterization baseline cannot see - it records no CSS. */
  it('should lay its fields out as a stretching column', () => {
    const host = getComputedStyle(fixture.nativeElement as HTMLElement);

    expect(host.display).toBe('flex');
    expect(host.flexDirection).toBe('column');
  });
});
