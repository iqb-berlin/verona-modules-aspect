/* eslint-disable max-classes-per-file */
import { Component, Input, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { ElementComponent } from 'common/directives/element-component.directive';
import { InputElement } from 'common/models/elements/element';
import { CheckboxElement } from 'common/models/elements/checkbox';
import { DropdownElement } from 'common/models/elements/dropdown';
import { DropListElement } from 'common/models/elements/drop-list';
import { HotspotImageElement } from 'common/models/elements/hotspot-image';
import { RadioButtonGroupElement } from 'common/models/elements/radio-button-group';
import {
  RadioButtonGroupComplexElement
} from 'common/models/elements/radio-button-group-complex';
import { SliderElement } from 'common/models/elements/slider';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VopNavigationDeniedNotification } from 'player/modules/verona/models/verona';
import { VeronaSubscriptionService } from 'player/modules/verona/services/verona-subscription.service';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { InputGroupElementComponent } from './input-group-element.component';

/* The child element components are replaced by stubs that still offer domElement and elementModel. */
@Component({ selector: 'aspect-checkbox', template: '', standalone: false })
class CheckboxStubComponent extends ElementComponent {
  @Input() elementModel!: CheckboxElement;
  @Input() parentForm!: UntypedFormGroup;
}

@Component({ selector: 'aspect-slider', template: '', standalone: false })
class SliderStubComponent extends ElementComponent {
  @Input() elementModel!: SliderElement;
  @Input() parentForm!: UntypedFormGroup;
}

@Component({ selector: 'aspect-drop-list', template: '', standalone: false })
class DropListStubComponent extends ElementComponent {
  @Input() elementModel!: DropListElement;
  @Input() parentForm!: UntypedFormGroup;
}

@Component({ selector: 'aspect-radio-button-group', template: '', standalone: false })
class RadioStubComponent extends ElementComponent {
  @Input() elementModel!: RadioButtonGroupElement;
  @Input() parentForm!: UntypedFormGroup;
}

@Component({ selector: 'aspect-radio-group-images', template: '', standalone: false })
class RadioImagesStubComponent extends ElementComponent {
  @Input() elementModel!: RadioButtonGroupComplexElement;
  @Input() parentForm!: UntypedFormGroup;
}

@Component({ selector: 'aspect-hotspot-image', template: '', standalone: false })
class HotspotImageStubComponent extends ElementComponent {
  @Input() elementModel!: HotspotImageElement;
  @Input() parentForm!: UntypedFormGroup;
}

@Component({ selector: 'aspect-dropdown', template: '', standalone: false })
class DropdownStubComponent extends ElementComponent {
  @Input() elementModel!: DropdownElement;
  @Input() parentForm!: UntypedFormGroup;
}

describe('InputGroupElementComponent', () => {
  let component: InputGroupElementComponent;
  let fixture: ComponentFixture<InputGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;

  const initComponent = (elementModel: InputElement): void => {
    fixture = TestBed.createComponent(InputGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>([
      'getElementCodeById', 'changeElementCodeValue', 'registerElementCode'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        InputGroupElementComponent,
        CheckboxStubComponent,
        SliderStubComponent,
        DropListStubComponent,
        RadioStubComponent,
        RadioImagesStubComponent,
        HotspotImageStubComponent,
        DropdownStubComponent,
        CastPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService },
        {
          provide: VeronaSubscriptionService,
          useValue: {
            vopNavigationDeniedNotification: new Subject<VopNavigationDeniedNotification>().asObservable()
          }
        }
      ]
    })
      .compileComponents();
  });

  it('should create', () => {
    initComponent(new RadioButtonGroupElement({ id: 'radio_1', alias: 'radio_1' }));

    expect(component).toBeTruthy();
  });

  it('should add a form control for the element', () => {
    initComponent(new RadioButtonGroupElement({ id: 'radio_1', alias: 'radio_1' }));

    expect(Object.keys(component.form.controls)).toEqual(['radio_1']);
  });

  /* Radio values are stored one-based as element code and zero-based in the element model. */
  it('should initialise the form control with the stored element code value', () => {
    unitStateService.getElementCodeById.mockReturnValue({ id: 'radio_1', alias: 'radio_1', value: 2 });

    initComponent(new RadioButtonGroupElement({ id: 'radio_1', alias: 'radio_1' }));

    expect(component.form.controls.radio_1.value).toBe(1);
  });

  it('should report value changes of the form control', () => {
    initComponent(new RadioButtonGroupElement({ id: 'radio_1', alias: 'radio_1' }));

    component.form.controls.radio_1.setValue(1);

    expect(unitStateService.changeElementCodeValue).toHaveBeenCalledWith({ id: 'radio_1', value: 2 });
  });

  it('should register the element at the unit state service', () => {
    const elementModel = new RadioButtonGroupElement({ id: 'radio_1', alias: 'radio_1' });
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('radio_1', 'radio_1', null, component.elementComponent.domElement, 1);
  });

  it('should hand the form over to the element component', () => {
    initComponent(new RadioButtonGroupElement({ id: 'radio_1', alias: 'radio_1' }));

    const radio = fixture.debugElement.query(By.directive(RadioStubComponent))
      .componentInstance as RadioStubComponent;
    expect(radio.parentForm).toBe(component.form);
    expect(radio.elementModel).toBe(component.elementModel);
  });

  it('should show the component matching the element type', () => {
    const elements: { elementModel: InputElement, stub: Type<unknown> }[] = [
      { elementModel: new CheckboxElement({ id: 'checkbox_1' }), stub: CheckboxStubComponent },
      { elementModel: new SliderElement({ id: 'slider_1' }), stub: SliderStubComponent },
      { elementModel: new DropListElement({ id: 'drop-list_1' }), stub: DropListStubComponent },
      { elementModel: new RadioButtonGroupElement({ id: 'radio_1' }), stub: RadioStubComponent },
      {
        elementModel: new RadioButtonGroupComplexElement({ id: 'radio-group-images_1' }),
        stub: RadioImagesStubComponent
      },
      { elementModel: new HotspotImageElement({ id: 'hotspot-image_1' }), stub: HotspotImageStubComponent },
      { elementModel: new DropdownElement({ id: 'dropdown_1' }), stub: DropdownStubComponent }
    ];

    elements.forEach(element => {
      initComponent(element.elementModel);

      expect(fixture.debugElement.query(By.directive(element.stub))).toBeTruthy();
      const otherStubs = elements.filter(other => other.stub !== element.stub);
      otherStubs.forEach(other => {
        expect(fixture.debugElement.query(By.directive(other.stub))).toBeNull();
      });
    });
  });
});
