import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { Component, Input } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { InputGroupElementComponent } from './input-group-element.component';

describe('InputGroupElementComponent', () => {
  let component: InputGroupElementComponent;
  let fixture: ComponentFixture<InputGroupElementComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-radio-button-group', template: '' })
  class RadioStubComponent {
    @Input() elementModel!: RadioButtonGroupElement;
    @Input() parentForm!: UntypedFormGroup;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InputGroupElementComponent,
        RadioStubComponent,
        CastPipe
      ],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(InputGroupElementComponent);
    spyOn(mockUnitStateService, 'registerElement');
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 0 });
    component = fixture.componentInstance;
    component.elementModel = new RadioButtonGroupElement({
      type: 'radio',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
