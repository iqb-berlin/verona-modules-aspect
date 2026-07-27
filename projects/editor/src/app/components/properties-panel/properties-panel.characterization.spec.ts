/**
 * Characterization test for the whole element properties panel.
 *
 * Purpose: lock down *what the user sees* for every element type, so the panel can be
 * restructured (own module, typed properties, split by inheritance) without silently
 * losing or gaining a control. The 75 `property !== undefined` conditions in the panel
 * templates are invisible to the compiler — a renamed property makes a control vanish
 * without any test failing. This spec closes that gap.
 *
 * Deliberately NOT part of the baseline: which component renders a control. The baseline
 * records label, control kind and current value only. That is what keeps it valid across
 * a restructuring — moving a checkbox into another component must not change the baseline,
 * losing the checkbox must.
 *
 * The expectations live in `properties-panel.baseline.ts` rather than in a vitest snapshot:
 * the `@angular/build:unit-test` builder compiles specs into a timestamped directory under
 * `dist/test-out/`, so `.snap` files are rewritten from scratch on every run and can never
 * fail. The baseline is generated (by the skipped test at the bottom of this file) but
 * committed, so a diff in it is reviewable. Treat any diff as a behaviour change — never
 * regenerate it just to make the suite pass.
 *
 * Known gaps, deliberately left open:
 * - `mat-select` options only exist while the overlay is open, so the baseline records a
 *   select's current value but not the options it offers.
 * - The panel host's input bindings for the position and styling tabs are mirrored in
 *   `renderPanel()` (see the comment there), so a change to those two bindings is not caught.
 * - Multi-selection is covered by `element-properties-panel.component.spec.ts`, not here.
 */
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { GetStateVariablePipe } from 'editor/src/app/pipes/get-state-variable.pipe';
import { GetValidDropListsPipe } from 'editor/src/app/pipes/get-valid-drop-lists.pipe';
import { IsInputElementPipe } from 'editor/src/app/pipes/is-input-element.pipe';
import { LikertRowLabelPipe } from 'editor/src/app/pipes/likert-row-label.pipe';
import { ScrollPageIndexPipe } from 'editor/src/app/pipes/scroll-page-index.pipe';
import { SizeInputPanelComponent } from 'editor/src/app/components/size-input-panel/size-input-panel.component';
import {
  PANEL_BASELINE
} from 'editor/src/app/components/properties-panel/properties-panel.baseline';
import {
  ElementPropertiesPanelComponent
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import {
  ElementPositionPropertiesComponent
} from 'editor/src/app/components/properties-panel/element-position-properties/element-position-properties.component';
import {
  ElementStylePropertiesComponent
} from 'editor/src/app/components/properties-panel/element-style-properties/element-style-properties.component';
import {
  DimensionFieldSetComponent
} from 'editor/src/app/components/properties-panel/dimension-field-set/dimension-field-set.component';
import {
  PositionFieldSetComponent
} from 'editor/src/app/components/properties-panel/position-field-set/position-field-set.component';
import {
  OptionListPanelComponent
} from 'editor/src/app/components/properties-panel/option-list-panel/option-list-panel.component';
import {
  ElementModelPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/element-model-properties/element-model-properties.component';
import {
  EleSpecificPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/ele-specific-props/ele-specific-props.component';
import {
  ActionParamStateVariableComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-param-state-variable/action-param-state-variable.component';
import {
  ActionPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/action-properties/action-properties.component';
import {
  BorderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/border-properties/border-properties.component';
import {
  ButtonPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/button-properties/button-properties.component';
import {
  DropListPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/drop-list-properties/drop-list-properties.component';
import {
  GeometryPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/geometry-props/geometry-props.component';
import {
  HighlightPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/highlight-properties/highlight-properties.component';
import {
  HotspotPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/hotspot-props/hotspot-props.component';
import {
  InputAssistancePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-assistance-properties/input-assistance-properties.component';
import {
  InputElementPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/input-element-properties/input-element-properties.component';
import {
  MarkingPanelPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/marking-panel-properties/marking-panel-properties.component';
import {
  MathFieldPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/math-field-props/math-field-props.component';
import {
  MathTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/math-table-properties/math-table-properties.component';
import {
  OptionsFieldSetComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/options-field-set/options-field-set.component';
import {
  PresetValuePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/preset-value-properties/preset-value-properties.component';
import {
  ScaleAndZoomPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/scale-and-zoom-properties/scale-and-zoom-properties.component';
import {
  SelectPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/select-properties/select-properties.component';
import {
  SliderPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/slider-properties/slider-properties.component';
import {
  TablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/table-properties/table-properties.component';
import {
  TextFieldElementPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/text-field-element-properties/text-field-element-properties.component';
import {
  TextPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/text-properties-field-set/text-properties-field-set.component';
import {
  WidgetMoleculeEditorPropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/widget-molecule-editor-properties/widget-molecule-editor-properties.component';
import {
  WidgetPeriodicTablePropertiesComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/widget-periodic-table-properties/widget-periodic-table-properties.component';

/** Stand-in for the MathLive-backed input; its internals are out of scope here. */
@Component({ selector: 'aspect-math-input', standalone: false, template: '' })
class MockMathInputComponent {
  @Input() value!: string;
  @Input() fullWidth: boolean = true;
  @Input() readonly: boolean = false;
  @Input() enableModeSwitch: boolean = false;
  @Input() mathKeyboardPresets: string[] = [];
  @Input() placeholder: string = '';
}

/**
 * Exhaustive over UIElementType — a new element type is a compile error here until it is
 * listed, which forces a decision about its properties panel.
 */
const ELEMENT_TYPE_COVERAGE: Record<UIElementType, true> = {
  text: true,
  button: true,
  'text-field': true,
  'text-field-simple': true,
  'text-area': true,
  checkbox: true,
  dropdown: true,
  radio: true,
  image: true,
  audio: true,
  video: true,
  likert: true,
  'likert-row': true,
  'radio-group-images': true,
  'hotspot-image': true,
  'drop-list': true,
  cloze: true,
  'spell-correct': true,
  slider: true,
  frame: true,
  'toggle-button': true,
  geometry: true,
  'math-field': true,
  'math-table': true,
  'text-area-math': true,
  trigger: true,
  table: true,
  'marking-panel': true,
  'widget-periodic-table': true,
  'widget-molecule-editor': true
};

const ELEMENT_TYPES = Object.keys(ELEMENT_TYPE_COVERAGE).sort() as UIElementType[];

function normalizeText(node: Element | null): string {
  return (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function shorten(value: string): string {
  return value.length > 40 ? `${value.slice(0, 37)}…` : value;
}

function flags(control: Element): string {
  const disabled = control.hasAttribute('disabled') ||
    (control as HTMLInputElement).disabled === true;
  return disabled ? ' (disabled)' : '';
}

/**
 * A `mat-select`'s options live in an overlay that only exists while the select is open, so
 * its selected value cannot be read from the DOM. This maps each select element to the value
 * held by its directive instance.
 */
type SelectValues = Map<Element, unknown>;

function formatValue(value: unknown): string {
  if (value === null) return '<null>';
  if (value === undefined) return '<undefined>';
  if (Array.isArray(value)) return `[${value.map(entry => formatValue(entry)).join(', ')}]`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function describeFormField(field: Element, selectValues: SelectValues): string {
  const label = normalizeText(field.querySelector('mat-label')) || '<no label>';
  const select = field.querySelector('mat-select');
  if (select) {
    const multiple = select.getAttribute('aria-multiselectable') === 'true' ? '[multiple]' : '';
    return `select${multiple} "${label}" = ` +
      `${shorten(formatValue(selectValues.get(select)))}${flags(select)}`;
  }
  const textarea = field.querySelector('textarea') as HTMLTextAreaElement | null;
  if (textarea) return `textarea "${label}" = ${shorten(textarea.value)}${flags(textarea)}`;
  const input = field.querySelector('input') as HTMLInputElement | null;
  if (input) return `input[${input.type}] "${label}" = ${shorten(input.value)}${flags(input)}`;
  return `field "${label}"`;
}

function describeCheckbox(checkbox: Element): string {
  const input = checkbox.querySelector('input') as HTMLInputElement | null;
  const state = input?.indeterminate ? 'indeterminate' : String(input?.checked ?? false);
  return `checkbox "${normalizeText(checkbox)}" = ${state}${input ? flags(input) : ''}`;
}

function describeToggleGroup(group: Element): string {
  const options = Array.from(group.querySelectorAll('mat-button-toggle'))
    .map(toggle => {
      const pressed = toggle.querySelector('button')?.getAttribute('aria-pressed') === 'true';
      return `${normalizeText(toggle)}${pressed ? '*' : ''}`;
    });
  return `toggle-group [${options.join(', ')}]`;
}

/**
 * Renders the visible controls of a subtree as one line each, in document order.
 * Recognised controls are not descended into, so their inner buttons are not counted twice.
 */
function describeControls(root: Element, selectValues: SelectValues): string[] {
  const lines: string[] = [];

  const walk = (element: Element): void => {
    switch (element.tagName.toLowerCase()) {
      case 'mat-form-field':
        lines.push(describeFormField(element, selectValues));
        return;
      case 'mat-checkbox':
        lines.push(describeCheckbox(element));
        return;
      case 'mat-button-toggle-group':
        lines.push(describeToggleGroup(element));
        return;
      case 'mat-slider':
        lines.push(`slider "${normalizeText(element.querySelector('input'))}"`);
        return;
      case 'mat-chip-grid':
        lines.push(`chips [${Array.from(element.querySelectorAll('mat-chip-row'))
          .map(chip => normalizeText(chip)).join(', ')}]`);
        return;
      case 'button':
        lines.push(`button "${normalizeText(element)}"${flags(element)}`);
        return;
      case 'fieldset':
        lines.push(`[${normalizeText(element.querySelector('legend')) || 'fieldset'}]`);
        break;
      default:
        break;
    }
    Array.from(element.children).forEach(child => walk(child));
  };

  walk(root);
  return lines;
}

describe('properties panel characterization', () => {
  let fixture: ComponentFixture<ElementPropertiesPanelComponent>;
  let selectedElements: BehaviorSubject<UIElement[]>;
  let unitServiceMock: { expertMode: boolean } & Record<string, unknown>;

  const unitMock = {
    stateVariables: [],
    pages: [{ sections: [{ dynamicPositioning: false }] }],
    getAllElements: () => []
  };

  beforeEach(async () => {
    selectedElements = new BehaviorSubject<UIElement[]>([]);
    unitServiceMock = {
      expertMode: false,
      elementPropertyUpdated: new Subject<void>(),
      tablePropUpdated: new Subject<string>(),
      unit: unitMock,
      getAllDropListElementIDs: () => []
    };
    // GeometryPropsComponent reaches through the selected element's overlay into the rendered
    // geometry component, so the selection needs an entry of that shape. It is not an
    // ElementOverlay, so the panel's own `instanceof` checks skip it.
    const geometryOverlayStub = {
      childComponent: {
        instance: {
          isLoaded: new BehaviorSubject<boolean>(false),
          getGeometryObjects: () => []
        }
      }
    };
    const selectionServiceMock = {
      selectedElements: selectedElements.asObservable(),
      selectedElementComponents: [geometryOverlayStub],
      isCompoundChildSelected: false,
      selectedPageIndex: 0,
      selectedSectionIndex: 0,
      getSelectedElements: () => selectedElements.value
    };
    const elementService: SpyObj<ElementService> = createSpyObj<ElementService>([
      'updateElementsProperty', 'updateElementsDimensionsProperty', 'deleteElements',
      'duplicateSelectedElements', 'showDefaultEditDialog', 'alignElements',
      'updateSelectedElementsPositionProperty', 'updateSelectedElementsStyleProperty',
      'updateDropListValueObject', 'createLikertRowElement'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        ElementPropertiesPanelComponent,
        ElementModelPropertiesComponent,
        ElementPositionPropertiesComponent,
        ElementStylePropertiesComponent,
        DimensionFieldSetComponent,
        PositionFieldSetComponent,
        OptionListPanelComponent,
        EleSpecificPropsComponent,
        ActionParamStateVariableComponent,
        ActionPropertiesComponent,
        BorderPropertiesComponent,
        ButtonPropertiesComponent,
        DropListPropertiesComponent,
        GeometryPropsComponent,
        HighlightPropertiesComponent,
        HotspotPropsComponent,
        InputAssistancePropertiesComponent,
        InputElementPropertiesComponent,
        MarkingPanelPropertiesComponent,
        MathFieldPropsComponent,
        MathTablePropertiesComponent,
        OptionsFieldSetComponent,
        PresetValuePropertiesComponent,
        ScaleAndZoomPropertiesComponent,
        SelectPropertiesComponent,
        SliderPropertiesComponent,
        TablePropertiesComponent,
        TextFieldElementPropertiesComponent,
        TextPropsComponent,
        WidgetMoleculeEditorPropertiesComponent,
        WidgetPeriodicTablePropertiesComponent,
        SizeInputPanelComponent,
        MockMathInputComponent,
        GetStateVariablePipe,
        GetValidDropListsPipe,
        IsInputElementPipe,
        LikertRowLabelPipe,
        ScrollPageIndexPipe,
        SafeResourceHTMLPipe,
        ScrollPagesPipe
      ],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatSliderModule,
        MatTabsModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SelectionService, useValue: selectionServiceMock as unknown as SelectionService },
        { provide: UnitService, useValue: unitServiceMock as unknown as UnitService },
        { provide: SectionService, useValue: {} as SectionService },
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: createSpyObj<MessageService>(['showWarning', 'showError']) },
        {
          provide: DialogService,
          useValue: createSpyObj<DialogService>([
            'showTextEditDialog', 'showImageResizeDialog', 'showTooltipDialog',
            'showLabelEditDialog', 'showLikertRowEditDialog', 'showRichTextEditDialog',
            'showDropListOptionEditDialog', 'showHotspotEditDialog',
            'showGeogebraAppDefinitionDialog', 'importImage'
          ])
        }
      ]
    }).compileComponents();
  });

  /** The panel labels its tabs with icons only; these are the readable equivalents. */
  const TAB_NAMES: Record<string, string> = {
    build: 'element properties',
    format_shapes: 'position and size',
    palette: 'styling'
  };

  function section(title: string, controls: string[]): string {
    return [`--- ${title} ---`, ...controls].join('\n');
  }

  function selectValuesOf(rendered: ComponentFixture<unknown>): SelectValues {
    return new Map(rendered.debugElement.queryAll(By.directive(MatSelect))
      .map(select => [select.nativeElement as Element, (select.componentInstance as MatSelect).value]));
  }

  /**
   * Settles a fixture: `NgModel` writes its initial value to the DOM in a microtask, so without
   * flushing it every `[ngModel]`-bound field would be recorded as empty.
   */
  function settle(rendered: ComponentFixture<unknown>): void {
    rendered.detectChanges();
    tick();
    rendered.detectChanges();
  }

  function describeFixture(rendered: ComponentFixture<unknown>, root?: Element): string[] {
    return describeControls(root ?? rendered.nativeElement, selectValuesOf(rendered));
  }

  /**
   * Renders the panel for one element and describes what it shows.
   *
   * Only the first tab's body is reachable through the host: Material attaches an inactive
   * tab body's content on a transition event that never fires without an animations module
   * (which rule 3 rules out). The remaining tabs are therefore rendered directly, gated by
   * the tab list the host actually produced — so the expert-mode gating still comes from
   * the real panel, only the rendering of those two tab bodies is short-circuited.
   */
  function renderPanel(type: UIElementType, expertMode: boolean): string {
    unitServiceMock.expertMode = expertMode;
    fixture = TestBed.createComponent(ElementPropertiesPanelComponent);
    fixture.detectChanges();

    const element = ElementFactory.createElement({ type, id: type, alias: type });
    selectedElements.next([element]);
    settle(fixture);

    const host = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(host.querySelectorAll('.mat-mdc-tab'))
      .map(tab => TAB_NAMES[normalizeText(tab)] ?? normalizeText(tab));
    const modelTab = host.querySelector('.mat-mdc-tab-body-active');
    const footer = host.querySelector('.button-group');

    const sections = [
      `--- tabs --- ${tabs.join(', ')}`,
      section(
        `tab "${tabs[0]}"`,
        modelTab ? describeFixture(fixture, modelTab) : ['<tab body not rendered>']
      )
    ];

    if (tabs.includes('position and size')) {
      const positionFixture = TestBed.createComponent(ElementPositionPropertiesComponent);
      positionFixture.componentInstance.dimensions = type === 'trigger' ? null : element.dimensions;
      positionFixture.componentInstance.positionProperties = element.position;
      positionFixture.componentInstance.isZIndexDisabled = type === 'trigger';
      settle(positionFixture);
      sections.push(section('tab "position and size"', describeFixture(positionFixture)));
    }

    if (tabs.includes('styling')) {
      const styleFixture = TestBed.createComponent(ElementStylePropertiesComponent);
      styleFixture.componentInstance.styles = element.styling;
      settle(styleFixture);
      sections.push(section('tab "styling"', describeFixture(styleFixture)));
    }

    sections.push(section('footer', footer ? describeFixture(fixture, footer) : []));
    return sections.join('\n\n');
  }

  /**
   * Regenerates `properties-panel.baseline.ts`. Change `describe.skip` to `describe`, run
   * `npx ng test editor --include "**\/properties-panel.characterization.spec.ts"`, replace the
   * body of the baseline file with the logged block, and skip this block again. Always read the
   * resulting diff — it is the list of behaviour changes the edit caused.
   *
   * `describe.skip` rather than `it.skip`: the ProxyZone setup replaces the global `it` and
   * copies its modifiers with `Object.keys`, which does not reach vitest's `skip`/`only`.
   */
  describe.skip('baseline regeneration', () => {
    it('logs a new baseline (see the doc comment before un-skipping)', fakeAsync(() => {
      const entries = ELEMENT_TYPES.flatMap(type => [
        [`${type}|standard`, renderPanel(type, false)] as const,
        [`${type}|expert`, renderPanel(type, true)] as const
      ]);
      const escaped = entries
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `  '${key}': \`${value
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$\{/g, '\\${')}\``);
      // eslint-disable-next-line no-console
      console.log(`\n>>> COPY FROM HERE >>>\nexport const PANEL_BASELINE: Record<string, string> = {\n${
        escaped.join(',\n\n')}\n};\n<<< COPY TO HERE <<<`);
    }));
  });

  // Generated with plain `it` rather than `it.each`: the project's ProxyZone setup
  // (projects/vitest-proxy-zone.setup.ts) only patches `it`/`test`, so `fakeAsync` inside
  // `it.each` fails with "Expected to be running in 'ProxyZone'".
  ELEMENT_TYPES.forEach(type => {
    it(`should render the standard panel for "${type}"`, fakeAsync(() => {
      expect(renderPanel(type, false)).toBe(PANEL_BASELINE[`${type}|standard`]);
    }));

    it(`should render the expert panel for "${type}"`, fakeAsync(() => {
      expect(renderPanel(type, true)).toBe(PANEL_BASELINE[`${type}|expert`]);
    }));
  });
});
