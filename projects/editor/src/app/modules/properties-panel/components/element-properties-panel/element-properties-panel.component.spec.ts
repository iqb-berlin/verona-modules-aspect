// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { ElementFactory } from 'common/utils/element-factory';
import {
  DimensionProperties, PositionProperties, Stylings
} from 'common/models/elements/property-group-interfaces';
import { UIElementProperties, UIElementValue } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  CombinedProperties, ElementPropertiesPanelComponent
} from 'editor/src/app/modules/properties-panel/components/element-properties-panel/element-properties-panel.component';
import { HasAnyPropertyPipe } from 'editor/src/app/modules/properties-panel/pipes/has-any-property.pipe';

@Component({
  selector: 'aspect-ui-element-properties',
  standalone: false,
  template: ''
})
class MockUIElementPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() divergingProperties: ReadonlySet<string> | undefined;
  @Input() selectedElements: UIElement[] = [];
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}

@Component({
  selector: 'aspect-position-and-dimension-properties',
  standalone: false,
  template: ''
})
class MockElementPositionPropertiesComponent {
  @Input() dimensions!: DimensionProperties | null | undefined;
  @Input() divergingProperties: ReadonlySet<string> | undefined;
  @Input() positionProperties: PositionProperties | undefined;
  @Input() isZIndexDisabled: boolean = false;
  /* Without this the binding in the host template is not an output at all - Angular quietly turns
     an unknown one into a DOM event listener, and the test would pass with the argument missing. */
  @Output() updatePositionModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}

@Component({
  selector: 'aspect-element-style-properties',
  standalone: false,
  template: ''
})
class MockElementStylePropertiesComponent {
  @Input() styles!: Stylings | undefined;
}

describe('ElementPropertiesPanelComponent', () => {
  let component: ElementPropertiesPanelComponent;
  let fixture: ComponentFixture<ElementPropertiesPanelComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;
  let selectedElements: BehaviorSubject<UIElement[]>;
  let elementPropertyUpdated: Subject<void>;

  const buttonElement = {
    type: 'button', id: 'btn1', alias: 'Btn1', label: 'Click'
  } as unknown as UIElement;
  const secondButtonElement = {
    type: 'button', id: 'btn2', alias: 'Btn2', label: 'Other'
  } as unknown as UIElement;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(
      ['updateElementsProperty', 'updateSelectedElementsPositionProperty',
        'deleteElements', 'duplicateSelectedElements']
    );
    messageService = createSpyObj<MessageService>(['showWarning', 'showError']);
    selectedElements = new BehaviorSubject<UIElement[]>([]);
    const selectionServiceMock = {
      selectedElements: selectedElements.asObservable(),
      selectedElementComponents: [],
      isCompoundChildSelected: false
    } as unknown as SelectionService;
    elementPropertyUpdated = new Subject<void>();
    const unitServiceMock = {
      expertMode: true,
      elementPropertyUpdated
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [
        ElementPropertiesPanelComponent,
        MockUIElementPropertiesComponent,
        MockElementPositionPropertiesComponent,
        MockElementStylePropertiesComponent,
        HasAnyPropertyPipe
      ],
      imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatTabsModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SectionService, useValue: {} as SectionService },
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementPropertiesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* Two tests below stub `console.error`. Without this the stub outlives them and swallows what
     Angular reports in every test declared after them - vitest does not restore mocks by default. */
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a placeholder message when no element is selected', () => {
    expect(fixture.nativeElement.querySelector('.no-selection')?.textContent)
      .toContain('propertiesPanel.noElementSelected');
  });

  it('should keep the id list when a single element is selected', () => {
    selectedElements.next([buttonElement]);
    fixture.detectChanges();

    expect(component.combinedProperties?.idList).toEqual(['btn1']);
    expect(component.combinedProperties?.label).toBe('Click');
  });

  it('should build combined properties when elements are selected', () => {
    selectedElements.next([buttonElement, secondButtonElement]);
    fixture.detectChanges();

    expect(component.combinedProperties?.type).toBe('button');
    expect(component.combinedProperties?.label).toBeNull();
  });

  /* Handed to the leaves next to the merged values, and rebuilt each time: the leaves read it
     through pure pipes, which re-run on a changed reference - a cleared set would keep the previous
     selection's answer on screen (#1167). */
  it('should publish where the selection diverges as a new set per merge', () => {
    selectedElements.next([buttonElement, secondButtonElement]);
    fixture.detectChanges();
    const firstMerge = component.divergingProperties;

    expect(firstMerge.has('label')).toBe(true);

    selectedElements.next([buttonElement]);
    fixture.detectChanges();

    expect(component.divergingProperties).not.toBe(firstMerge);
    expect(component.divergingProperties.size).toBe(0);
  });

  /* A failed merge takes every control away, so the paths of the selection it half-walked must go
     too - they would otherwise describe a selection the panel no longer shows (#1155). */
  it('should drop the diverging paths when a merge fails', () => {
    const exploding = { type: 'button', id: 'boom' } as unknown as UIElement;
    Object.defineProperty(exploding, 'label', {
      get() { throw new Error('merge failed'); },
      enumerable: true
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    selectedElements.next([buttonElement, secondButtonElement]);
    fixture.detectChanges();
    expect(component.divergingProperties.size).toBeGreaterThan(0);

    selectedElements.next([buttonElement, exploding]);
    fixture.detectChanges();

    expect(component.combinedProperties).toBeUndefined();
    expect(component.divergingProperties.size).toBe(0);
  });

  it('should merge shared properties and drop non-shared ones', () => {
    const combined = ElementPropertiesPanelComponent.createCombinedProperties([
      {
        type: 'button', id: 'a', label: 'same', asLink: true
      } as unknown as UIElement,
      { type: 'button', id: 'b', label: 'same' } as unknown as UIElement
    ]);

    expect(combined?.label).toBe('same');
    expect(combined?.asLink).toBeUndefined();
  });

  /* idList used to be added to the merge base, where the merge loop deleted it again on the first
     iteration - no element has that key, and the loop drops every key the next element lacks. It is
     now added after merging (#1119). Without it the drop list's "connected lists" options are empty
     for a multi selection, because GetValidDropListsPipe returns [] for undefined. */
  it('should list the ids of the whole selection when several elements are merged', () => {
    const combined = ElementPropertiesPanelComponent.createCombinedProperties([
      { type: 'button', id: 'a' } as unknown as UIElement,
      { type: 'button', id: 'b' } as unknown as UIElement
    ]);

    expect(combined?.idList).toEqual(['a', 'b']);
  });

  /* The two selection-wide keys are added around the merge, not inside it, so the recursion into
     property groups does not leave them behind on a position or dimensions object. */
  it('should not put the selection-wide keys on a merged property group', () => {
    const combined = ElementPropertiesPanelComponent.createCombinedProperties([
      { type: 'button', id: 'a', position: { xPosition: 0 } } as unknown as UIElement,
      { type: 'button', id: 'b', position: { xPosition: 5 } } as unknown as UIElement
    ]);

    const position = combined?.position as unknown as Record<string, unknown>;
    expect('idList' in position).toBe(false);
    expect('rows' in position).toBe(false);
  });

  /* Since #1226 six element types have an empty styling group, and the merge drops every key the
     selection does not share -- so a text together with an image leaves nothing to show, and the
     styling tab disappears for that selection. Same as in the shipped 2.x line, where those six
     carried no styling at all; between the two it briefly stayed, offering the text's font size while
     an image was co-selected. Pinned here because the characterization net does not cover mixed-type
     selections. */
  it('should leave no styling for a selection that mixes a styled and an unstyled element', () => {
    const combined = ElementPropertiesPanelComponent.createCombinedProperties([
      { type: 'text', id: 'a', styling: { fontSize: 20, backgroundColor: 'white' } } as unknown as UIElement,
      { type: 'image', id: 'b', styling: {} } as unknown as UIElement
    ]);

    expect(combined?.styling).toEqual({});
  });

  describe('createCombinedProperties', () => {
    const element = (properties: Record<string, unknown>): UIElement => properties as unknown as UIElement;

    /* The panel edits some of what it is given in place -- removing an option splices the array it
       reads -- so a view that shared it would change the element without any write path seeing it,
       and leave every selected element holding the same label objects (#1188). */
    it('should share no plain data with the selected element', () => {
      const options = [{ text: 'A' }, { text: 'B' }];
      const position = { xPosition: 5 };
      const selected = element({
        type: 'radio', id: 'a', options, position
      });

      const combined = ElementPropertiesPanelComponent.createCombinedProperties([selected]);

      expect(combined?.options).toEqual(options);
      expect(combined?.options).not.toBe(options);
      expect((combined?.options as { text: string }[])[0]).not.toBe(options[0]);
      expect(combined?.position).not.toBe(position);
    });

    /* Element models are the exception: they belong to the unit, and a copy would carry their IDs a
       second time. */
    it('should keep element models of the selection as they are', () => {
      const row = ElementFactory.createElement({
        type: 'likert-row', id: 'row_1', alias: 'row_1'
      } as unknown as UIElementProperties);

      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'likert', id: 'a', rows: [row] })
      ]);

      expect((combined?.rows as UIElement[])[0]).toBe(row);
    });

    it('should return undefined for an empty selection', () => {
      expect(ElementPropertiesPanelComponent.createCombinedProperties([])).toBeUndefined();
    });

    // The merge adds a key that the element itself does not have. Templates test the value rather
    // than the key, so an element without rows stays compatible with that.
    it('should add an id list for a single element', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'text-field', id: 'a' })
      ]);

      expect(combined?.idList).toEqual(['a']);
      expect(combined?.rows).toBeUndefined();
    });

    // The rows array is copied so that the options panel sees a new reference and re-renders.
    it('should replace the rows array with a new reference', () => {
      const rows = [{ id: 'r1' }];
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'likert', id: 'a', rows })
      ]);

      expect(combined?.rows).not.toBe(rows);
      expect(combined?.rows).toEqual(rows);
    });

    it('should merge property groups recursively and null only the diverging entries', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'text-field', id: 'a', position: { xPosition: 0, yPosition: 10 } }),
        element({ type: 'text-field', id: 'b', position: { xPosition: 5, yPosition: 10 } })
      ]);

      expect(combined?.position).toEqual(expect.objectContaining({ xPosition: null, yPosition: 10 }));
    });

    it('should null a diverging array instead of merging it', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'dropdown', id: 'a', options: [{ text: 'one' }] }),
        element({ type: 'dropdown', id: 'b', options: [{ text: 'two' }] })
      ]);

      expect(combined?.options).toBeNull();
    });

    it('should keep an array whose contents are equal', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'dropdown', id: 'a', options: [{ text: 'one' }] }),
        element({ type: 'dropdown', id: 'b', options: [{ text: 'one' }] })
      ]);

      expect(combined?.options).toEqual([{ text: 'one' }]);
    });

    it('should null diverging primitives of any type', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({
          type: 'text-field', id: 'a', readOnly: false, rowCount: 2, label: 'first'
        }),
        element({
          type: 'text-field', id: 'b', readOnly: true, rowCount: 3, label: 'second'
        })
      ]);

      expect(combined?.readOnly).toBeNull();
      expect(combined?.rowCount).toBeNull();
      expect(combined?.label).toBeNull();
    });

    /* Where the selection diverges, collected next to the merge rather than encoded in it: the
       nullable properties ("no limit", "no preset") produce the same null for "they disagree" as for
       "none of them has one", and a panel reading only the value claimed the latter (#1167). */
    describe('the diverging paths', () => {
      it('should record a diverging property and leave a shared one out', () => {
        const diverging = new Set<string>();

        ElementPropertiesPanelComponent.createCombinedProperties([
          element({
            type: 'text-field', id: 'a', label: 'same', rowCount: 2
          }),
          element({
            type: 'text-field', id: 'b', label: 'same', rowCount: 3
          })
        ], diverging);

        expect(diverging.has('rowCount')).toBe(true);
        expect(diverging.has('label')).toBe(false);
      });

      // Dotted, so a leaf inside a property group is distinguishable from a top-level one.
      it('should record a nested property with its group as a path', () => {
        const diverging = new Set<string>();

        ElementPropertiesPanelComponent.createCombinedProperties([
          element({ type: 'text-field', id: 'a', dimensions: { maxWidth: 100, minWidth: 20 } }),
          element({ type: 'text-field', id: 'b', dimensions: { maxWidth: 200, minWidth: 20 } })
        ], diverging);

        expect([...diverging]).toEqual(['dimensions.maxWidth']);
      });

      /* The counter-case the whole set is for: elements that agree on having no limit produce the
         same `null` as diverging ones, and there the panel is right to show "no limit". */
      it('should record nothing when the elements agree on null', () => {
        const diverging = new Set<string>();

        const combined = ElementPropertiesPanelComponent.createCombinedProperties([
          element({ type: 'text-field', id: 'a', dimensions: { maxWidth: null } }),
          element({ type: 'text-field', id: 'b', dimensions: { maxWidth: null } })
        ], diverging);

        expect((combined?.dimensions as unknown as Record<string, unknown>).maxWidth).toBeNull();
        expect(diverging.size).toBe(0);
      });

      /* A third element that disagrees with an already-nulled property: the merge compares against
         the null it wrote itself, so the divergence has to be recorded when it first happens. */
      it('should keep a divergence recorded once a later element matches the null', () => {
        const diverging = new Set<string>();

        ElementPropertiesPanelComponent.createCombinedProperties([
          element({ type: 'text-field', id: 'a', dimensions: { maxWidth: 100 } }),
          element({ type: 'text-field', id: 'b', dimensions: { maxWidth: 200 } }),
          element({ type: 'text-field', id: 'c', dimensions: { maxWidth: null } })
        ], diverging);

        expect(diverging.has('dimensions.maxWidth')).toBe(true);
      });

      // Only the third element brings the disagreement, and the first two must not hide it.
      it('should record a divergence that only a later element introduces', () => {
        const diverging = new Set<string>();

        ElementPropertiesPanelComponent.createCombinedProperties([
          element({ type: 'text-field', id: 'a', dimensions: { maxWidth: null } }),
          element({ type: 'text-field', id: 'b', dimensions: { maxWidth: null } }),
          element({ type: 'text-field', id: 'c', dimensions: { maxWidth: 300 } })
        ], diverging);

        expect(diverging.has('dimensions.maxWidth')).toBe(true);
      });

      // `id` diverges by definition and is exempt from the merge; it has no field to speak for.
      it('should not record the id', () => {
        const diverging = new Set<string>();

        ElementPropertiesPanelComponent.createCombinedProperties([
          element({ type: 'text-field', id: 'a' }),
          element({ type: 'text-field', id: 'b' })
        ], diverging);

        expect(diverging.has('id')).toBe(false);
      });

      it('should record nothing for a single element', () => {
        const diverging = new Set<string>();

        ElementPropertiesPanelComponent.createCombinedProperties([
          element({ type: 'text-field', id: 'a', dimensions: { maxWidth: null } })
        ], diverging);

        expect(diverging.size).toBe(0);
      });
    });

    it('should keep the shared type when merging elements of the same type', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'checkbox', id: 'a' }),
        element({ type: 'checkbox', id: 'b' })
      ]);

      expect(combined?.type).toBe('checkbox');
    });

    it('should null the type when merging elements of different types', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'checkbox', id: 'a' }),
        element({ type: 'dropdown', id: 'b' })
      ]);

      expect(combined?.type).toBeNull();
    });

    /* An object on one side and null on the other: the recursion used to be entered on the strength
       of the first element alone and then walked into `hasOwnProperty.call(null, …)`. A property
       group that only one of the elements has filled is as diverging as any other pair (#1155). */
    it('should null a property group the other element has as null', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'trigger', id: 'a', actionParam: { variableId: 'v1', value: '1' } }),
        element({ type: 'trigger', id: 'b', actionParam: null })
      ]);

      expect(combined?.actionParam).toBeNull();
    });

    /* A group against a primitive - a geometry's object-shaped `value` beside a text field's
       string, say. This never crashed: the recursion ran, found none of the group's keys on the
       primitive and deleted them all, so the answer was an empty object. `null` is what the merge
       says everywhere else about two values that disagree (#1155). */
    it('should null a property group the other element has as a primitive', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'geometry', id: 'a', value: { coordinates: [1, 2] } }),
        element({ type: 'text-field', id: 'b', value: 'text' })
      ]);

      expect(combined?.value).toBeNull();
    });

    // The reverse order never crashed, and has to keep answering the same thing.
    it('should null a property group regardless of the selection order', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'trigger', id: 'b', actionParam: null }),
        element({ type: 'trigger', id: 'a', actionParam: { variableId: 'v1', value: '1' } })
      ]);

      expect(combined?.actionParam).toBeNull();
    });
  });

  /* A merge that throws used to leave `selectedElements` on the new selection and
     `combinedProperties` on the previous one - the panel then showed the old values and wrote them
     to the newly selected elements. Failing to `undefined` takes the controls away instead (#1155).
     Provoked through a getter rather than through real elements, because the crash this ticket is
     about is fixed: what is pinned here is the handling, not that one cause. */
  it('should show no properties and report when the merge throws', () => {
    const exploding = { type: 'button', id: 'boom' } as unknown as UIElement;
    Object.defineProperty(exploding, 'label', {
      get() { throw new Error('merge failed'); },
      enumerable: true
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    selectedElements.next([buttonElement]);
    expect(component.combinedProperties).toBeDefined();

    selectedElements.next([exploding]);

    expect(component.combinedProperties).toBeUndefined();
    expect(messageService.showError).toHaveBeenCalled();
  });

  // The write path reads `selectedElements`, so the guarantee is that no control is left to call it.
  it('should not write the previous selection after a failed merge', () => {
    const exploding = { type: 'button', id: 'boom' } as unknown as UIElement;
    Object.defineProperty(exploding, 'label', {
      get() { throw new Error('merge failed'); },
      enumerable: true
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    selectedElements.next([buttonElement]);
    fixture.detectChanges();

    selectedElements.next([exploding]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('aspect-ui-element-properties')).toBeNull();
    expect(elementService.updateElementsProperty).not.toHaveBeenCalled();
  });

  /* No controls and no placeholder would leave an empty pane once the snackbar times out - the
     "no element selected" text does not apply, because elements are selected. */
  it('should explain the empty pane after a failed merge', () => {
    const exploding = { type: 'button', id: 'boom' } as unknown as UIElement;
    Object.defineProperty(exploding, 'label', {
      get() { throw new Error('merge failed'); },
      enumerable: true
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    selectedElements.next([exploding]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-selection')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('propertiesPanel.combineFailed');
  });

  /* `elementPropertyUpdated` fires for edits anywhere in the unit. Re-running the same failing
     merge on the unchanged broken selection must not put a snackbar on screen for each of them. */
  it('should report a persistent merge failure only once', () => {
    const exploding = { type: 'button', id: 'boom' } as unknown as UIElement;
    Object.defineProperty(exploding, 'label', {
      get() { throw new Error('merge failed'); },
      enumerable: true
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    selectedElements.next([exploding]);

    elementPropertyUpdated.next();
    elementPropertyUpdated.next();

    expect(messageService.showError).toHaveBeenCalledTimes(1);
  });

  // A selection that merges again clears the mark, so a later failure is reported afresh.
  it('should report again after the merge has recovered', () => {
    const exploding = { type: 'button', id: 'boom' } as unknown as UIElement;
    Object.defineProperty(exploding, 'label', {
      get() { throw new Error('merge failed'); },
      enumerable: true
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    selectedElements.next([exploding]);
    selectedElements.next([buttonElement]);
    selectedElements.next([exploding]);

    expect(messageService.showError).toHaveBeenCalledTimes(2);
  });

  /* The leaves compute `isInputValid` and the host evaluates it, but the binding in between passed
     only two arguments, so the parameter default `true` won every time and the whole validation
     path was inert (#1154). Asserted through the template, because that binding is the defect. */
  it('should carry isInputValid from the model tab to the guard', () => {
    selectedElements.next([buttonElement]);
    fixture.detectChanges();
    const modelTab = fixture.debugElement
      .query(debugElement => debugElement.componentInstance instanceof MockUIElementPropertiesComponent)
      .componentInstance as MockUIElementPropertiesComponent;

    modelTab.updateModel.emit({ property: 'label', value: 'x', isInputValid: false });

    expect(elementService.updateElementsProperty).not.toHaveBeenCalled();
    expect(messageService.showWarning).toHaveBeenCalled();
  });

  // Leaves that do not compute the flag must keep writing - the parameter default covers them.
  it('should still write when a leaf sends no validity at all', () => {
    selectedElements.next([buttonElement]);
    fixture.detectChanges();
    const modelTab = fixture.debugElement
      .query(debugElement => debugElement.componentInstance instanceof MockUIElementPropertiesComponent)
      .componentInstance as MockUIElementPropertiesComponent;

    modelTab.updateModel.emit({ property: 'label', value: 'x' });

    expect(elementService.updateElementsProperty)
      .toHaveBeenCalledWith([buttonElement], 'label', 'x');
  });

  /* Asserted through the template rather than by calling the method: the binding is the thing that
     used to drop the flag, and only the mock's real `@Output` makes it a binding at all. */
  /* No template-level test for the position tab's binding, unlike the model tab's above.
     Material attaches an inactive tab body's content on a transition event that never fires
     without an animations module, which rule 3 rules out - the position tab simply cannot be
     rendered through the host here. `properties-panel.characterization.spec.ts` hits the same wall
     and lists it among its known gaps. The mock does declare `updatePositionModel` as a real
     `@Output`, so the binding is at least wired to something rather than silently degrading to a
     DOM event listener; the guard itself is covered by the two tests below. */
  it('should write a position property through the guard', () => {
    selectedElements.next([buttonElement]);

    component.updatePositionModel('xPosition', 5);

    expect(elementService.updateSelectedElementsPositionProperty)
      .toHaveBeenCalledWith('xPosition', 5);
    expect(messageService.showWarning).not.toHaveBeenCalled();
  });

  it('should warn instead of writing an invalid position property', () => {
    selectedElements.next([buttonElement]);

    component.updatePositionModel('xPosition', -1, false);

    expect(elementService.updateSelectedElementsPositionProperty).not.toHaveBeenCalled();
    expect(messageService.showWarning).toHaveBeenCalled();
  });

  it('should update the elements property for valid input', () => {
    selectedElements.next([buttonElement]);
    fixture.detectChanges();

    component.updateModel('label', 'new label');

    expect(elementService.updateElementsProperty)
      .toHaveBeenCalledWith([buttonElement], 'label', 'new label');
    expect(messageService.showWarning).not.toHaveBeenCalled();
  });

  it('should warn instead of updating for invalid input', () => {
    selectedElements.next([buttonElement]);
    fixture.detectChanges();

    component.updateModel('xPosition', -1, false);

    expect(elementService.updateElementsProperty).not.toHaveBeenCalled();
    expect(messageService.showWarning).toHaveBeenCalled();
  });

  it('should delete the selected elements', () => {
    selectedElements.next([buttonElement]);
    fixture.detectChanges();

    component.deleteElement();

    expect(elementService.deleteElements).toHaveBeenCalledWith([buttonElement]);
  });
});
