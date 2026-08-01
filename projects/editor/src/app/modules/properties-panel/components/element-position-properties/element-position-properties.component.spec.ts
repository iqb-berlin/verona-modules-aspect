// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import {
  DimensionProperties, PositionProperties
} from 'common/models/elements/property-group-interfaces';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  ElementPositionPropertiesComponent
} from './element-position-properties.component';

@Component({
  selector: 'aspect-position-field-set',
  standalone: false,
  template: ''
})
class MockPositionFieldSetComponent {
  @Input() positionProperties!: PositionProperties;
  @Input() isZIndexDisabled: boolean = false;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}

@Component({
  selector: 'aspect-dimension-field-set',
  standalone: false,
  template: ''
})
class MockDimensionFieldSetComponent {
  @Input() positionProperties: PositionProperties | undefined;
  @Input() dimensions!: DimensionProperties;
}

describe('ElementPositionPropertiesComponent', () => {
  let component: ElementPositionPropertiesComponent;
  let fixture: ComponentFixture<ElementPositionPropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let selectedElements: BehaviorSubject<UIElement[]>;

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(
      ['alignElements', 'updateSelectedElementsPositionProperty']
    );
    selectedElements = new BehaviorSubject<UIElement[]>([{ id: 'el1' } as UIElement]);
    const selectionServiceMock = {
      selectedElements: selectedElements.asObservable(),
      getSelectedElements: () => selectedElements.value
    } as unknown as SelectionService;

    await TestBed.configureTestingModule({
      declarations: [
        ElementPositionPropertiesComponent,
        MockPositionFieldSetComponent,
        MockDimensionFieldSetComponent
      ],
      imports: [
        CommonModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: {} as UnitService },
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: ElementService, useValue: elementService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementPositionPropertiesComponent);
    component = fixture.componentInstance;
    component.dimensions = { width: 100, height: 50 } as DimensionProperties;
    component.positionProperties = { xPosition: 0, yPosition: 0 } as PositionProperties;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show alignment buttons for a single selected element', () => {
    expect(fixture.nativeElement.querySelector('.alignment-button-group')).toBeNull();
  });

  it('should align elements via the element service when an alignment button is clicked', () => {
    selectedElements.next([{ id: 'el1' } as UIElement, { id: 'el2' } as UIElement]);
    fixture.detectChanges();

    const buttons = fixture.nativeElement
      .querySelectorAll('.alignment-button-group button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(4);
    buttons[0].click();

    expect(elementService.alignElements).toHaveBeenCalledWith(selectedElements.value, 'left');
  });

  it('should forward position updates to the element service', () => {
    const positionFieldSet = fixture.debugElement
      .query(debugElement => debugElement.componentInstance instanceof MockPositionFieldSetComponent)
      .componentInstance as MockPositionFieldSetComponent;

    positionFieldSet.updateModel.emit({ property: 'xPosition', value: 10 });

    expect(elementService.updateSelectedElementsPositionProperty).toHaveBeenCalledWith('xPosition', 10);
  });
});
