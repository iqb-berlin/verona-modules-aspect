import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, Input } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { InputGroupElementComponent } from './input-group-element.component';

describe('InputGroupElementComponent', () => {
  let component: InputGroupElementComponent;
  let fixture: ComponentFixture<InputGroupElementComponent>;

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
    fixture = TestBed.createComponent(InputGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new RadioButtonGroupElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
