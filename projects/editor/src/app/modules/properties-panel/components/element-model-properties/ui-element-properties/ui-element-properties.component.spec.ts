// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output, SimpleChange
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
import { UIElementType, UIElementValue } from 'common/models/ui-element-interfaces';
import {
  PanelSection
} from 'editor/src/app/modules/properties-panel/models/panel-sections';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { By } from '@angular/platform-browser';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  CombinedProperties
} from 'editor/src/app/modules/properties-panel/components/element-properties-panel/element-properties-panel.component';
import {
  BUTTON_ACTIONS, TRIGGER_ACTIONS
} from '../action-properties/action-properties.component';
import {
  UIElementPropertiesComponent
} from './ui-element-properties.component';

@Component({ selector: 'aspect-input-element-properties', standalone: false, template: '' })
class MockInputElementPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

@Component({ selector: 'aspect-standard-dimension-properties', standalone: false, template: '' })
class MockStandardDimensionPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() show!: Record<PanelSection, boolean>;
}

@Component({ selector: 'aspect-cloze-properties', standalone: false, template: '' })
class MockClozePropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
}

@Component({ selector: 'aspect-media-source-properties', standalone: false, template: '' })
class MockMediaSourcePropertiesComponent {
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
  @Input() show!: Record<PanelSection, boolean>;
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

@Component({ selector: 'aspect-image-properties', standalone: false, template: '' })
class MockImagePropertiesComponent {
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

describe('UIElementPropertiesComponent', () => {
  let component: UIElementPropertiesComponent;
  let fixture: ComponentFixture<UIElementPropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let emitted: { property: string; value: unknown }[];
  let unitServiceMock: { expertMode: boolean };

  const selectedElement = { type: 'button', id: 'btn1', alias: 'Btn1' } as unknown as UIElement;

  /**
   * Sets the selection and recomputes the section map (#1137). Angular calls `ngOnChanges` only for
   * template-bound inputs, so a spec that assigns them on the instance has to say so itself.
   */
  const select = (...types: UIElementType[]): void => {
    const previous = component.selectedElements;
    component.selectedElements = types.map(type => ({ type } as UIElement));
    component.ngOnChanges({ selectedElements: new SimpleChange(previous, component.selectedElements, false) });
  };

  beforeEach(async () => {
    unitServiceMock = { expertMode: false };
    elementService = createSpyObj<ElementService>(
      ['updateElementsDimensionsProperty', 'showDefaultEditDialog']
    );
    const selectionServiceMock = {
      getSelectedElements: () => [selectedElement]
    } as unknown as SelectionService;

    await TestBed.configureTestingModule({
      declarations: [UIElementPropertiesComponent,
        MockInputElementPropertiesComponent,
        MockPresetValuePropertiesComponent,
        MockOptionsFieldSetComponent,
        MockEleSpecificPropsComponent,
        MockSelectPropertiesComponent,
        MockTextFieldElementPropertiesComponent,
        MockInputAssistancePropertiesComponent,
        MockImagePropertiesComponent,
        MockActionPropertiesComponent,
        MockStickyHeaderPropertiesComponent,
        MockFirstColumnRatioPropertiesComponent,
        MockMathKeyboardPropertiesComponent,
        MockMultiLineTextPropertiesComponent,
        MockCheckboxPropertiesComponent,
        MockMediaSourcePropertiesComponent,
        MockClozePropertiesComponent,
        MockStandardDimensionPropertiesComponent,
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
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService },
        { provide: ElementService, useValue: elementService },
        { provide: SelectionService, useValue: selectionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UIElementPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { type: 'button', alias: 'Btn1' };
    component.selectedElements = [selectedElement];
    component.ngOnChanges({ selectedElements: new SimpleChange(undefined, component.selectedElements, true) });
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  /* #1147: the button and the trigger have different action vocabularies, and a mixed selection
     merges `type` to null - the ternary would then offer the trigger's actions and write one of them
     to the button. The characterization net cannot cover this: its multi-selection cases always use
     two elements of the same type, so `type` never merges to null there. */
  describe('the action control', () => {
    const actionPanel = () => fixture.debugElement.query(By.directive(MockActionPropertiesComponent));

    beforeEach(() => {
      unitServiceMock.expertMode = true;
    });

    it('should offer the button vocabulary for a button', () => {
      component.combinedProperties = { type: 'button', action: null };
      select('button');
      fixture.detectChanges();

      expect(actionPanel().componentInstance.actions).toEqual(BUTTON_ACTIONS);
    });

    it('should offer the trigger vocabulary for a trigger', () => {
      component.combinedProperties = { type: 'trigger', action: null };
      select('trigger');
      fixture.detectChanges();

      expect(actionPanel().componentInstance.actions).toEqual(TRIGGER_ACTIONS);
    });

    it('should offer nothing when the selection mixes the two types', () => {
      // Both types have the action section, so the map still offers it - it is the `type != null`
      // guard that has to hide the control here.
      component.combinedProperties = { type: null, action: null };
      select('button', 'trigger');
      fixture.detectChanges();

      expect(actionPanel()).toBeNull();
    });
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
});
