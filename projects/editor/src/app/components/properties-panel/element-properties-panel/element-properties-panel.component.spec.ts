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
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-element-model-properties-component',
  standalone: false,
  template: ''
})
class MockElementModelPropertiesComponent {
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
    messageService = createSpyObj<MessageService>(['showWarning']);
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
        MockElementModelPropertiesComponent,
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

  // Documents current behaviour: idList is added to the merge base, so the key
  // is dropped again as soon as a second element without that key is merged in.
  // See issue #1119 — adapt this test when the merge is fixed.
  it('should drop the id list when several elements are merged', () => {
    const combined = ElementPropertiesPanelComponent.createCombinedProperties([
      { type: 'button', id: 'a' } as unknown as UIElement,
      { type: 'button', id: 'b' } as unknown as UIElement
    ]);

    expect(combined?.idList).toBeUndefined();
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
