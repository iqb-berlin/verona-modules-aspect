import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FloatingKeypadComponent } from 'player/src/app/components/floating-keypad/floating-keypad.component';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { TextInputGroupElementComponent } from './text-input-group-element.component';

describe('TextInputGroupElementComponent', () => {
  let component: TextInputGroupElementComponent;
  let fixture: ComponentFixture<TextInputGroupElementComponent>;

  @Component({ selector: 'aspect-text-field', template: '' })
  class TextFieldStubComponent {
    @Input() elementModel!: TextFieldElement;
    @Input() parentForm!: UntypedFormGroup;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextInputGroupElementComponent,
        FloatingKeypadComponent,
        TextFieldStubComponent,
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
    fixture = TestBed.createComponent(TextInputGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextFieldElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
