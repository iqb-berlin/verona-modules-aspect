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
 * - Divergent multi-selection is covered by the `multi-` cases: two elements of the same type
 *   whose booleans all disagree. Every such property merges to null, which the panel renders as
 *   `indeterminate` (#1136) — `describeCheckbox()` records that, so the baseline distinguishes it
 *   from "false everywhere". Two elements of *different* types are not covered, which is where a
 *   control gated on the merged `type` disappears.
 */
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MatSelect } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { PANEL_BASELINE } from './properties-panel.baseline';
import { PropertiesPanelModule } from './properties-panel.module';
import {
  ElementPropertiesPanelComponent
} from './components/element-properties-panel/element-properties-panel.component';
import {
  ElementPositionPropertiesComponent
} from './components/element-position-properties/element-position-properties.component';
import {
  ElementStylePropertiesComponent
} from './components/element-style-properties/element-style-properties.component';

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

/**
 * The original file name is a readout, not a control, so none of the tag names below match it.
 * Recognised by its class, which is the only marker it has; keep that class when the markup moves.
 */
function describeFileName(element: Element): string {
  const label = normalizeText(element.querySelector('.file-name-label'));
  const full = normalizeText(element);
  return `text "${label}" = ${shorten(full.startsWith(label) ? full.slice(label.length).trim() : full)}`;
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
    if (element.classList.contains('file-name')) {
      lines.push(describeFileName(element));
      return;
    }
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
      imports: [
        PropertiesPanelModule,
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

  /** Negates every boolean, nested property groups included, so all of them merge to null. */
  function flipBooleans(target: Record<string, unknown>): void {
    Object.keys(target).forEach(key => {
      if (key === 'idService') return;
      const value = target[key];
      if (typeof value === 'boolean') {
        target[key] = !value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        flipBooleans(value as Record<string, unknown>);
      }
    });
  }

  /**
   * Media elements default to `src: null`, so the "change media source" button never rendered and
   * the net could not see it. Set after construction, not through the factory: passing `src` makes
   * the element's own `isXProperties` guard match, and that branch then overwrites `styling`,
   * `position` and `dimensions` with the blueprint's (absent) values.
   */
  function withMediaSource(element: UIElement): UIElement {
    const withSrc = element as unknown as { src?: string | null };
    if ('src' in element && withSrc.src === null) withSrc.src = 'data:application/octet-stream;base64,AAAA';
    return element;
  }

  /**
   * The selection to render. `divergent` puts two elements of the same type in the selection whose
   * booleans all disagree, so every one of them merges to null — which the panel renders as
   * indeterminate. See the doc comment at the top of the file.
   */
  function selectionOf(type: UIElementType, mode: 'single' | 'divergent'): UIElement[] {
    const first = withMediaSource(ElementFactory.createElement({ type, id: type, alias: type }));
    if (mode === 'single') return [first];
    const second = withMediaSource(ElementFactory.createElement({ type, id: `${type}_2`, alias: `${type}_2` }));
    flipBooleans(second as unknown as Record<string, unknown>);
    return [first, second];
  }

  /**
   * Renders the panel for a selection and describes what it shows.
   *
   * Only the first tab's body is reachable through the host: Material attaches an inactive
   * tab body's content on a transition event that never fires without an animations module
   * (which rule 3 rules out). The remaining tabs are therefore rendered directly, but fed from
   * the host's own `combinedProperties` — so the expert-mode gating and the merged values both
   * come from the real panel; only the rendering of those two tab bodies is short-circuited.
   */
  function renderPanel(type: UIElementType, expertMode: boolean,
                       mode: 'single' | 'divergent' = 'single'): string {
    unitServiceMock.expertMode = expertMode;
    fixture = TestBed.createComponent(ElementPropertiesPanelComponent);
    fixture.detectChanges();

    selectedElements.next(selectionOf(type, mode));
    settle(fixture);

    const merged = fixture.componentInstance.combinedProperties;
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
      positionFixture.componentInstance.dimensions = type === 'trigger' ? null : merged?.dimensions;
      positionFixture.componentInstance.positionProperties = merged?.position;
      positionFixture.componentInstance.isZIndexDisabled = type === 'trigger';
      settle(positionFixture);
      sections.push(section('tab "position and size"', describeFixture(positionFixture)));
    }

    if (tabs.includes('styling')) {
      const styleFixture = TestBed.createComponent(ElementStylePropertiesComponent);
      styleFixture.componentInstance.styles = merged?.styling;
      settle(styleFixture);
      sections.push(section('tab "styling"', describeFixture(styleFixture)));
    }

    sections.push(section('footer', footer ? describeFixture(fixture, footer) : []));
    return sections.join('\n\n');
  }

  /**
   * Regenerates `properties-panel.baseline.ts`.
   *
   *   1. change `describe.skip` below to `describe`
   *   2. `npx ng test editor --include "**\/properties-panel.characterization.spec.ts" > /tmp/b.log`
   *   3. `node scripts/panel-baseline-from-log.js /tmp/b.log`
   *   4. skip the group again and read the diff — it is the list of behaviour changes
   *
   * One test per entry rather than one for everything: the MathLive field throws
   * "Mathfield not mounted" as soon as several panel fixtures exist within a single test body,
   * so each entry needs its own test — the same shape as the assertions above, which do work.
   * The tests are ordered so that their output is already in the baseline's sort order.
   */
  describe.skip('baseline regeneration', () => {
    const MODES: [string, boolean, 'single' | 'divergent'][] = [
      ['expert', true, 'single'],
      ['multi-expert', true, 'divergent'],
      ['multi-standard', false, 'divergent'],
      ['standard', false, 'single']
    ];

    ELEMENT_TYPES.forEach(type => {
      MODES.forEach(([suffix, expertMode, selection]) => {
        it(`logs ${type}|${suffix}`, fakeAsync(() => {
          // eslint-disable-next-line no-console
          console.log(`<<<ENTRY ${type}|${suffix}\n${renderPanel(type, expertMode, selection)}\nENTRY>>>`);
        }));
      });
    });
  });

  it.each(ELEMENT_TYPES)('should render the standard panel for "%s"', fakeAsync((type: UIElementType) => {
    expect(renderPanel(type, false)).toBe(PANEL_BASELINE[`${type}|standard`]);
  }));

  it.each(ELEMENT_TYPES)('should render the expert panel for "%s"', fakeAsync((type: UIElementType) => {
    expect(renderPanel(type, true)).toBe(PANEL_BASELINE[`${type}|expert`]);
  }));

  it.each(ELEMENT_TYPES)('should render the standard panel for a divergent selection of "%s"',
                         fakeAsync((type: UIElementType) => {
                           expect(renderPanel(type, false, 'divergent')).toBe(PANEL_BASELINE[`${type}|multi-standard`]);
                         }));

  it.each(ELEMENT_TYPES)('should render the expert panel for a divergent selection of "%s"',
                         fakeAsync((type: UIElementType) => {
                           expect(renderPanel(type, true, 'divergent')).toBe(PANEL_BASELINE[`${type}|multi-expert`]);
                         }));
});
