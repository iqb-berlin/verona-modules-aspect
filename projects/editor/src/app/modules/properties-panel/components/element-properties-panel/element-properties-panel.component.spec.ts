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
import {
  DimensionProperties, PositionProperties, Stylings
} from 'common/models/elements/property-group-interfaces';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  CombinedProperties, ElementPropertiesPanelComponent
} from 'editor/src/app/modules/properties-panel/components/element-properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-ui-element-properties',
  standalone: false,
  template: ''
})
class MockUIElementPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
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
  @Input() positionProperties: PositionProperties | undefined;
  @Input() isZIndexDisabled: boolean = false;
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

  const buttonElement = {
    type: 'button', id: 'btn1', alias: 'Btn1', label: 'Click'
  } as unknown as UIElement;
  const secondButtonElement = {
    type: 'button', id: 'btn2', alias: 'Btn2', label: 'Other'
  } as unknown as UIElement;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(
      ['updateElementsProperty', 'deleteElements', 'duplicateSelectedElements']
    );
    messageService = createSpyObj<MessageService>(['showWarning', 'showError']);
    selectedElements = new BehaviorSubject<UIElement[]>([]);
    const selectionServiceMock = {
      selectedElements: selectedElements.asObservable(),
      selectedElementComponents: [],
      isCompoundChildSelected: false
    } as unknown as SelectionService;
    const unitServiceMock = {
      expertMode: true,
      elementPropertyUpdated: new Subject<void>()
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [
        ElementPropertiesPanelComponent,
        MockUIElementPropertiesComponent,
        MockElementPositionPropertiesComponent,
        MockElementStylePropertiesComponent
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

  describe('createCombinedProperties', () => {
    const element = (properties: Record<string, unknown>): UIElement => properties as unknown as UIElement;

    it('should return undefined for an empty selection', () => {
      expect(ElementPropertiesPanelComponent.createCombinedProperties([])).toBeUndefined();
    });

    // The merge adds two keys that the element itself does not have. Templates test for
    // `rows === undefined` rather than for the key, so both stay compatible with that.
    it('should add an id list and a rows key for a single element', () => {
      const combined = ElementPropertiesPanelComponent.createCombinedProperties([
        element({ type: 'text-field', id: 'a' })
      ]);

      expect(combined?.idList).toEqual(['a']);
      expect(combined && 'rows' in combined).toBe(true);
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
