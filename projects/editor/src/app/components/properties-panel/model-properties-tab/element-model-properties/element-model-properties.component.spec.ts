// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/components/properties-panel/fields/merged-checkbox/merged-checkbox.component';
import { IsInputElementPipe } from 'editor/src/app/components/properties-panel/pipes/is-input-element.pipe';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  CombinedProperties
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import {
  ElementModelPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/element-model-properties/element-model-properties.component';

@Component({ selector: 'aspect-input-element-properties', standalone: false, template: '' })
class MockInputElementPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-preset-value-properties', standalone: false, template: '' })
class MockPresetValuePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-options-field-set', standalone: false, template: '' })
class MockOptionsFieldSetComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-ele-specific-props', standalone: false, template: '' })
class MockEleSpecificPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-select-properties', standalone: false, template: '' })
class MockSelectPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-text-field-element-properties', standalone: false, template: '' })
class MockTextFieldElementPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-input-assistance-properties', standalone: false, template: '' })
class MockInputAssistancePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-scale-and-zoom-properties', standalone: false, template: '' })
class MockScaleAndZoomPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-action-properties', standalone: false, template: '' })
class MockActionPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() actions!: readonly string[];
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-sticky-header-properties', standalone: false, template: '' })
class MockStickyHeaderPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-first-column-ratio-properties', standalone: false, template: '' })
class MockFirstColumnRatioPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-math-keyboard-properties', standalone: false, template: '' })
class MockMathKeyboardPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-multi-line-text-properties', standalone: false, template: '' })
class MockMultiLineTextPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-checkbox-properties', standalone: false, template: '' })
class MockCheckboxPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

describe('ElementModelPropertiesComponent', () => {
  let component: ElementModelPropertiesComponent;
  let fixture: ComponentFixture<ElementModelPropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let emitted: { property: string; value: unknown }[];

  const selectedElement = { type: 'button', id: 'btn1', alias: 'Btn1' } as unknown as UIElement;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(
      ['updateElementsDimensionsProperty', 'showDefaultEditDialog']
    );
    const selectionServiceMock = {
      getSelectedElements: () => [selectedElement]
    } as unknown as SelectionService;

    await TestBed.configureTestingModule({
      declarations: [ElementModelPropertiesComponent,
        MockInputElementPropertiesComponent,
        MockPresetValuePropertiesComponent,
        MockOptionsFieldSetComponent,
        MockEleSpecificPropsComponent,
        MockSelectPropertiesComponent,
        MockTextFieldElementPropertiesComponent,
        MockInputAssistancePropertiesComponent,
        MockScaleAndZoomPropertiesComponent,
        MockActionPropertiesComponent,
        MockStickyHeaderPropertiesComponent,
        MockFirstColumnRatioPropertiesComponent,
        MockMathKeyboardPropertiesComponent,
        MockMultiLineTextPropertiesComponent,
        MockCheckboxPropertiesComponent,
        IsInputElementPipe,
        MergedCheckboxComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: { expertMode: false } as UnitService },
        { provide: ElementService, useValue: elementService },
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: DialogService, useValue: {} as DialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementModelPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { type: 'button', alias: 'Btn1' };
    component.selectedElements = [selectedElement];
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the alias when the id field is edited', () => {
    const aliasInput = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(aliasInput.value).toBe('Btn1');

    aliasInput.value = 'newAlias';
    aliasInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'alias', value: 'newAlias' }]);
  });

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
});
